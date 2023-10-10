import fs from 'fs';
import path from 'path';
import {
  CarvedFile,
  getCarvedFiles,
  getFileHashAsync,
  getHashAsync,
  getFilesForAllKeywords,
} from './other-cli-tools';
import { PartitionTable, getPartitionTable } from './volume-system-tools';
import { runBufferedCliTool, runCliTool } from './runners';
import {
  File,
  RenamedFile,
  processForRenamedFile,
  KeywordFile,
  Hash,
  getTimeZone,
} from './file-system-tools';
import { TimelineEntry, buildTimeline } from './timeline-tools';

export type OrchestratorOptions = {
  imagePath: string;
  searchString: string;
  showPartitions: boolean;
  showTimeline: boolean;
  includeRenamedFiles: boolean;
  includeDeletedFiles: boolean;
  includeKeywordSearchFiles: boolean;
  includeCarvedFiles: boolean;
  keepRecoveredFiles: boolean;
};

export type ReportDetails = {
  imageName: string;
  imageHash: Hash | undefined;
  imageHashFinal: Hash | undefined;
  timezone: string | undefined;
  partitionTable: PartitionTable | undefined;
  renamedFiles: RenamedFile[] | undefined;
  deletedFiles: File[] | undefined;
  keywordFiles: KeywordFile[] | undefined;
  carvedFiles: CarvedFile[] | undefined;
  timeline: TimelineEntry[] | undefined;
};

export type SuspiciousFiles = {
  renamedFiles: RenamedFile[];
  deletedFiles: File[];
};

export const fileListProcessor = (line: string): File => {
  const split = line.split('\t');

  const metadata = split[0].split(' ');

  const fileType = metadata[0].split('/');
  const [fileNameFileType, metadataFileType] = fileType;

  const deleted = metadata[1] === '*';
  let inode = deleted ? metadata[2] : metadata[1];
  inode = inode.replace(':', '');
  const reallocated = inode.includes('(realloc)');

  if (reallocated) {
    inode.replace('(realloc)', '');
  }

  const fileName = split[1];

  // These conversions are pretty awful
  // Basically takes the date output from fls, removes the timezone info (AEDT).
  // THIS IS THE CURRENT TIMEZONE OF THE SYSTEM.
  // Converts it to a date object, which is also in the current system timezone anyway, so we don't
  // need the timezone info from fls
  const mtime = new Date(split[2].split('(')[0]);
  const atime = new Date(split[3].split('(')[0]);
  const ctime = new Date(split[4].split('(')[0]);
  const crtime = new Date(split[5].split('(')[0]);

  const size = parseInt(split[6], 10);
  const uid = split[7];
  const gid = split[8];

  const hash = {
    fileName: '',
    md5sum: '',
    sha1sum: '',
  };

  return {
    fileNameFileType,
    metadataFileType,
    deleted,
    inode,
    reallocated,
    fileName,
    mtime,
    atime,
    ctime,
    crtime,
    size,
    uid,
    gid,
    hash,
  };
};

export const getSuspiciousFiles = async (
  options: OrchestratorOptions,
  partitionTable: PartitionTable
): Promise<SuspiciousFiles> => {
  // DON'T FORGET ORCHESTRATOR OPTIONS, CHECK IF WE WANT TO SEARCH FOR THINGS
  console.log('Suspicious files called.');
  const renamedFiles: RenamedFile[] = [];
  const deletedFiles: File[] = [];

  for await (const partition of partitionTable.partitions) {
    console.log(partition);
    const files = await runBufferedCliTool<File>(
      `fls -o ${partition.start} -l -p -r ${options.imagePath}`,
      fileListProcessor
    ).catch(() =>
      console.log(`Couldn't read partition: ${partition.description}`)
    );

    // eslint-disable-next-line no-continue
    if (!files) continue;

    for await (const file of files) {
      file.hash = await getFileHashAsync(
        options.imagePath,
        partition,
        file.inode,
        false
      );
      console.log(file.hash);

      // renamed
      const renamedFile = await processForRenamedFile(
        file,
        options.imagePath,
        partition
      );
      if (renamedFile) {
        renamedFiles.push(renamedFile);
      }

      // deleted
      if (file.deleted) {
        deletedFiles.push(file);
      }
    }
  }

  console.log(renamedFiles);
  console.log(deletedFiles);
  return { renamedFiles, deletedFiles };
};

export const orchestrator = async (
  orchestratorOptions: OrchestratorOptions,
  statusCallback: (msg: string) => void
): Promise<ReportDetails | null> => {
  try {
    await runCliTool(
      `[ -f ${orchestratorOptions.imagePath} ] && echo "$FILE exists."`
    );
  } catch (error) {
    throw new Error(`Couldn't find file: ${orchestratorOptions.imagePath}!`);
  }

  let hash: Hash = {} as Hash;
  statusCallback('Hashing Drive...');
  try {
    hash = await getHashAsync(orchestratorOptions.imagePath);
  } catch (error) {
    if (error instanceof Error) {
      statusCallback(error.message);
      throw error;
    }
  }

  statusCallback('Reading Partition Table...');
  const partitionTable = await getPartitionTable(orchestratorOptions.imagePath);

  statusCallback('Locating Timezone...');
  const timezone = await getTimeZone(
    partitionTable,
    orchestratorOptions.imagePath
  );

  let suspiciousFiles: SuspiciousFiles | undefined;
  if (
    orchestratorOptions.includeDeletedFiles ||
    orchestratorOptions.includeRenamedFiles
  ) {
    statusCallback('Processing Files...');
    suspiciousFiles = await getSuspiciousFiles(
      orchestratorOptions,
      partitionTable
    );
  }

  let keywordFiles: KeywordFile[] = [];
  if (orchestratorOptions.includeKeywordSearchFiles) {
    statusCallback('Searching for keyword matches. This might take a while...');

    try {
      keywordFiles = await getFilesForAllKeywords(
        orchestratorOptions.imagePath,
        orchestratorOptions.searchString,
        partitionTable.partitions
      );
    } catch (error) {
      if (error instanceof Error) {
        statusCallback(error.message);
        throw error;
      }
    }
  }

  let carvedFiles: CarvedFile[] = [];
  if (orchestratorOptions.includeCarvedFiles) {
    statusCallback('Carving Files...');

    carvedFiles = await getCarvedFiles(
      orchestratorOptions.imagePath,
      partitionTable.sectorSize,
      partitionTable.partitions.map((partition) => partition.start)
    );
  }

  let timeline: TimelineEntry[] | undefined;
  if (orchestratorOptions.showTimeline) {
    statusCallback('Building Timeline...');
    // consider some refactoring sprint 4
    const timelineFiles = [];
    if (suspiciousFiles !== undefined) {
      suspiciousFiles.renamedFiles.forEach((renamedFile) => {
        timelineFiles.push(renamedFile.file);
      });
      timelineFiles.push(...suspiciousFiles.deletedFiles);
    }
    timelineFiles.push(
      ...keywordFiles.map((keywordFile) => {
        return {
          fileNameFileType: keywordFile.fileAttributes,
          metadataFileType: keywordFile.fileAttributes,
          deleted: keywordFile.deleted,
          inode: keywordFile.inode,
          reallocated: keywordFile.deleted,
          fileName: keywordFile.filePath,
          mtime: new Date(keywordFile.mtime),
          atime: new Date(keywordFile.atime),
          ctime: new Date(keywordFile.ctime),
          crtime: new Date(keywordFile.ctime),
          size: Number(keywordFile.size),
          uid: 'N/A',
          gid: 'N/A',
          hash: keywordFile.hash,
        };
      })
    );

    timeline = await buildTimeline(
      timelineFiles,
      partitionTable,
      orchestratorOptions.imagePath
    );
  }

  let hashFinal: Hash = {} as Hash;
  statusCallback('Checking Integrity...');
  try {
    hashFinal = await getHashAsync(orchestratorOptions.imagePath);
  } catch (error) {
    if (error instanceof Error) {
      statusCallback(error.message);
      throw error;
    }
  }

  return {
    imageName: orchestratorOptions.imagePath,
    imageHash: hash || undefined,
    imageHashFinal: hashFinal || undefined,
    timezone,
    partitionTable: orchestratorOptions.showPartitions
      ? partitionTable
      : undefined,
    renamedFiles:
      orchestratorOptions.includeRenamedFiles && suspiciousFiles?.renamedFiles
        ? suspiciousFiles.renamedFiles
        : undefined,
    deletedFiles:
      orchestratorOptions.includeDeletedFiles && suspiciousFiles?.deletedFiles
        ? suspiciousFiles.deletedFiles
        : undefined,
    keywordFiles:
      orchestratorOptions.includeKeywordSearchFiles && keywordFiles
        ? keywordFiles
        : undefined,
    carvedFiles:
      orchestratorOptions.includeCarvedFiles && carvedFiles
        ? carvedFiles
        : undefined,
    timeline:
      orchestratorOptions.showTimeline && timeline ? timeline : undefined,
  };
};

export const validateImage = async (imagePath: string) => {
  let validType = false;
  const tskImageInfo = await runCliTool(
    `tsk_imageinfo ${imagePath}| grep "TSK Support"`
  ).catch(() => {
    return '';
  });
  if (tskImageInfo === '') return false;
  const zipfile = await runCliTool(`file -b --mime-type ${imagePath}`);
  if (
    tskImageInfo.trim() === 'TSK Support: Yes' ||
    zipfile.trim() === 'application/zip'
  ) {
    validType = true;
    return validType && fs.existsSync(imagePath);
  }
  return validType && fs.existsSync(imagePath);
};

export const validateZip = async (imagePath: string) => {
  let zipfile = '';
  const zipFileName = imagePath.replace(/^.*[\\/]/, '');
  let newImagePath = '';
  let validImageFileZip = '';

  zipfile = await runCliTool(`file -b --mime-type ${imagePath}`);
  if (zipfile.trim() === 'application/zip') {
    newImagePath = newImagePath.concat(
      path.dirname(imagePath),
      '/',
      zipFileName,
      '_extract'
    );
    await runCliTool(`unzip -o ${imagePath} -d ${newImagePath}`);
    const fileNames = fs.readdirSync(newImagePath);
    const filePaths = fileNames.map((fileName) =>
      path.join(newImagePath, fileName)
    );
    // Loop function
    for await (const files of filePaths) {
      const tskImageInfo = await runCliTool(
        `tsk_imageinfo ${files}| grep "TSK Support"`
      );
      if (tskImageInfo.trim() === 'TSK Support: Yes') {
        validImageFileZip = files;
      }
    }
    return validImageFileZip;
  }
  return imagePath;
};

export const deleteZipFile = async (imagePath: string) => {
  let deletingDir = '';
  deletingDir = deletingDir.concat(path.dirname(imagePath), '/');
  await runCliTool(`rm -r -f ${deletingDir}*.zip_extract"`);
};
