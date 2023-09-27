import fs from 'fs';
import { Hash, getFileHashAsync, getHashAsync } from './other-cli-tools';
import { PartitionTable, getPartitionTable } from './volume-system-tools';
import { runBufferedCliTool, runCliTool } from './runners';
import {
  File,
  RenamedFile,
  processForRenamedFile,
  KeywordFile,
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
  partitionTable: PartitionTable | undefined;
  renamedFiles: RenamedFile[] | undefined;
  deletedFiles: File[] | undefined;
  keywordFiles: KeywordFile[] | undefined;
  carvedFile: CarvedFile[] | undefined;
  timeline: TimelineEntry[];
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
  args: OrchestratorOptions,
  partitionTable: PartitionTable
): Promise<SuspiciousFiles> => {
  // DON'T FORGET ORCHESTRATOR OPTIONS, CHECK IF WE WANT TO SEARCH FOR THINGS
  console.log('Suspicious files called.');
  const renamedFiles: RenamedFile[] = [];
  const deletedFiles: File[] = [];

  for await (const partition of partitionTable.partitions) {
    console.log(partition);
    const files = await runBufferedCliTool<File>(
      `fls -o ${partition.start} -l -p -r ${args.imagePath}`,
      fileListProcessor
    ).catch(() =>
      console.log(`Couldn't read partition: ${partition.description}`)
    );

    if (!files) continue;

    for await (const file of files) {
      file.hash = await getFileHashAsync(
        args.imagePath,
        partition,
        file.inode,
        false
      );
      console.log(file.hash);

      // renamed
      const renamedFile = await processForRenamedFile(
        file,
        args.imagePath,
        partition
      );
      if (renamedFile) {
        renamedFiles.push(renamedFile);
      }

      // deleted
      if (file.deleted) {
        deletedFiles.push(file);
      }

      // carved
      // if (carvedfile) {
      //   CarvedFiles.push(carvedfile);
      // }

      // keyword //////////// SUS

      /*
      const keyword = await getSearchStringAsync(
      args.imagePath,
      searchString,
      // Fix this -- call all start value of all partition in the partition table
      Partition.partiton.start,
    );
    */
      /*
      if (keywordFile) {
        keywordFiles.push(keywordFile);
      } */
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
      throw new Error(error.message);
    }
  }

  // console.log(imagePath);
  statusCallback('Reading Partition Table...');

  let partitionTable = {} as PartitionTable;
  try {
    partitionTable = await getPartitionTable(orchestratorOptions.imagePath);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }

  // TODO:
  // need to figure out how to exclude some of these depending on
  // orchestrator options
  let suspiciousFiles: SuspiciousFiles = {} as SuspiciousFiles;
  const keywordFiles: KeywordFile[] = [];

  statusCallback('Processing Files...');
  try {
    suspiciousFiles = await getSuspiciousFiles(
      orchestratorOptions,
      partitionTable
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }

  statusCallback('Searching for keyword files...');

  statusCallback('Building Timeline...');
  //consider some refactoring sprint 4
  const timelineFiles = suspiciousFiles.renamedFiles.map((renamedFile) => {
    return renamedFile.file;
  });
  timelineFiles.push(
    ...keywordFiles.map((keywordFile) => {
      return keywordFile.file;
    })
  );
  timelineFiles.push(...suspiciousFiles.deletedFiles);
  const timeline = await buildTimeline(
    timelineFiles,
    partitionTable,
    orchestratorOptions.imagePath
  );

  return {
    imageName: orchestratorOptions.imagePath,
    imageHash: hash || undefined,
    partitionTable: partitionTable || undefined,
    renamedFiles: suspiciousFiles.renamedFiles
      ? suspiciousFiles.renamedFiles
      : undefined,
    deletedFiles: suspiciousFiles.deletedFiles
      ? suspiciousFiles.deletedFiles
      : undefined,
    keywordFiles: keywordFiles || undefined,
    timeline: timeline || undefined,
  };
};

export const validateImage = (imagePath: string) => {
  const IMAGETYPES = ['dd', 'e01', 'l01', 'lef', 'dmg', 'zip'];
  const splitName = imagePath.split('.');
  const ext = splitName[splitName.length - 1].toLowerCase();
  console.log(ext);
  const validType = IMAGETYPES.includes(ext);

  return validType && fs.existsSync(imagePath);
};
