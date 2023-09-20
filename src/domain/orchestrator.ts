import fs from 'fs';
import { File } from '../types/types';
import { Hash, getFileHashAsync, getHashAsync } from './other-cli-tools';
import { PartitionTable, getPartitionTable } from './volume-system-tools';
import { runBufferedCliTool, runCliTool } from './runners';
import {
  File,
  RenamedFile,
  KeywordFile,
  processForRenamedFile,
} from './file-system-tools';

export type OrchestratorOptions = {
  imagePath: string;
  output: {
    partitions: boolean;
    renamedFiles: boolean;
    deletedFiles: boolean;
    keywordFiles: boolean;
    timeline: boolean;
    carvedFiles: boolean;
  };
  searchString: string;
};

export type ReportDetails = {
  imageName: string;
  imageHash: Hash | undefined;
  partitionTable: PartitionTable | undefined;
  renamedFiles: RenamedFile[] | undefined;
  deletedFiles: File[] | undefined;
  keywordFiles: KeywordFile[] | undefined;
};

export type SuspiciousFiles = {
  renamedFiles: RenamedFile[];
  deletedFiles: File[];
  keywordFiles: KeywordFile[];
};

export const orchestrator = async (
  args: OrchestratorOptions,
  statusCallback: (msg: string) => void
): Promise<ReportDetails | null> => {
  const {
    imagePath,
    renamedFiles,
    deletedFiles,
    keywordFiles,
    keepFiles,
    searchString,
  } = args;

  try {
    await runCliTool(`[ -f ${imagePath} ] && echo "$FILE exists."`);
  } catch (error) {
    throw new Error(`Couldn't find file: ${imagePath}!`);
  }

  let hash: Hash = {} as Hash;
  statusCallback('Hashing Drive...');
  try {
    hash = await getHashAsync(imagePath);
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
    partitionTable = await getPartitionTable(imagePath);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }

  // TODO:
  // need to figure out how to exclude some of these depending on
  // orchestrator options
  let suspiciousFiles: SuspiciousFiles = {} as SuspiciousFiles;

  statusCallback('Processing Files...');
  try {
    suspiciousFiles = await getSuspiciousFiles(args, partitionTable);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }

  return {
    imageName: imagePath,
    imageHash: hash || undefined,
    partitionTable: partitionTable || undefined,
    renamedFiles: suspiciousFiles.renamedFiles
      ? suspiciousFiles.renamedFiles
      : undefined,
    deletedFiles: suspiciousFiles.deletedFiles
      ? suspiciousFiles.deletedFiles
      : undefined,
    keywordFiles: suspiciousFiles.keywordFiles
      ? suspiciousFiles.keywordFiles
      : undefined,
  };
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
  // Basically takes the date output from fls, removes the timezone info (AEDT) // THIS IS THE CURRENT TIMEZONE OF THE SYSTEM
  // Converts it to a date object, which is also in the current system timezone anyway, so we dont need the timezone info
  // from fls
  const mtime = new Date(split[2].split('(')[0]);
  const atime = new Date(split[3].split('(')[0]);
  const ctime = new Date(split[4].split('(')[0]);
  const crtime = new Date(split[5].split('(')[0]);

  const size = Number(split[6]);
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
): Promise<{
  renamedFiles: RenamedFile[];
  deletedFiles: File[];
  keywordFiles: KeywordFile[];
}> => {
  // DONT FORGET ORCHESTRATOROPTIONS, CHECK IF WE WANTTO SEARCH FOR THINGS
  console.log('Suspicious files called');
  const renamedFiles: RenamedFile[] = [];
  const deletedFiles: File[] = [];
  const keywordFiles: KeywordFile[] = [];

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

      // keyword //////////// SUS
    }
  }

  console.log(renamedFiles);
  console.log(deletedFiles);
  console.log(keywordFiles);
  return { renamedFiles, deletedFiles, keywordFiles };
};

export const fileListProcessor = (line: string): File => {
  const split = line.split(/\s+/);

  const file: File = new File();

  const fileType = split[0].split('/');
  [file.fileNameFileType, file.metadataFileType] = fileType;

  file.deleted = split[1] === '*';

  let deletedOffset = 0;
  if (file.deleted) deletedOffset = 1;

  file.inode = split[1 + deletedOffset].replace(':', '');
  // TODO: IMPLEMENT
  // Would be similar to deleted with a check for (REALLOCATED), no offset?
  file.reallocated = false;

  file.fileName = split[2 + deletedOffset];
  file.mtime = split.slice(3 + deletedOffset, 6 + deletedOffset).join(' ');
  file.atime = split.slice(6 + deletedOffset, 9 + deletedOffset).join(' ');
  file.ctime = split.slice(9 + deletedOffset, 12 + deletedOffset).join(' ');
  file.crtime = split.slice(12 + deletedOffset, 15 + deletedOffset).join(' ');
  file.size = +split[15 + deletedOffset];
  file.uid = split[16 + deletedOffset];
  file.gid = split[17 + deletedOffset];

  return file;
};

export const validateImage = (imagePath: string) => {
  const IMAGETYPES = ['dd', 'e01', 'l01', 'lef', 'dmg', 'zip'];
  const splitName = imagePath.split('.');
  const ext = splitName[splitName.length - 1].toLowerCase();
  console.log(ext);
  const validType = IMAGETYPES.includes(ext);

  return validType && fs.existsSync(imagePath);
};
