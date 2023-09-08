import fs from 'fs';
import { File } from '../types/types';
import { Hash, getFileHashAsync, getHashAsync } from './other-cli-tools';
import { PartitionTable, getPartitionTable } from './volume-system-tools';
import { runBufferedCliTool } from './runner';
import {
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

export const orchestrator = async (
  args: OrchestratorOptions,
  statusCallback: (msg: string) => void
): Promise<ReportDetails> => {
  const { imagePath, output } = args;

  statusCallback('Hashing Drive...');
  const hash = await getHashAsync(imagePath).catch((reason) => {
    statusCallback(reason as string);
  });

  // console.log(imagePath);
  statusCallback('Reading Partition Table...');
  const partitionTable = await getPartitionTable(imagePath);

  // TODO:
  // need to figure out how to exclude some of these depending on orchestrator options
  statusCallback('Processing Files...');

  const { renamedFiles, deletedFiles, keywordFiles } = await getSuspiciousFiles(
    args,
    partitionTable
  );

  return {
    imageName: imagePath,
    imageHash: hash || undefined,
    partitionTable: output.partitions ? partitionTable : undefined,
    renamedFiles: output.renamedFiles ? renamedFiles : undefined,
    deletedFiles: output.deletedFiles ? deletedFiles : undefined,
    keywordFiles: output.keywordFiles ? keywordFiles : undefined,
  };
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

  file.hash = await getFileHashAsync(); // can't be async :(

  return file;
};

export const getSuspiciousFiles = async (
  args: OrchestratorOptions,
  partitionTable: PartitionTable
): Promise<{
  renamedFiles: RenamedFile[];
  deletedFiles: File[];
  keywordFiles: KeywordFile[];
}> => {
  console.log('Suspicious files called');
  const renamedFiles: RenamedFile[] = [];
  const deletedFiles: File[] = [];
  const keywordFiles: KeywordFile[] = [];

  for await (const partition of partitionTable.partitions) {
    console.log(partition);
    const files = await runBufferedCliTool<File>(
      `fls -o ${partition.start} -l -p -r ${args.imagePath}`,
      fileListProcessor
    ).catch((reason) =>
      console.log(`runBufferedCliTool failed with: ${reason}`)
    );

    if (!files) continue;

    for await (const file of files) {
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
