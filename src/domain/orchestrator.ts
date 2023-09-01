import { File } from '../types/types';
import { getMD5HashAsync, getSearchStringAsync } from './other-cli-tools';
import { PartitionTable, getPartitionTable } from './volume-system-tools';
import { runBufferedCliTool } from './runner';

export type OrchestratorOptions = {
  imagePath: string;
  output: {
    partitions: boolean;
    renamedFiles: boolean;
    deletedFiles: boolean;
    keywordFiles: boolean;
  };
  searchString: string;
};

export type ReportDetails = {
  imageName: string;
  imageHash: string;
  partitionTable: PartitionTable | undefined;
  renamedFiles: RenamedFile[] | undefined;
  deletedFiles: File[] | undefined;
  keywordFiles: any; // KeywordFile[] | undefined;
};

const getDeletedAndRenamedFiles = (line: string): File => {
  const file = new File();

  const lineElements: string[] = line.split(' ');

  if (lineElements[1] === '*') {
    console.log('Deleted file found.');
  } else {
    console.log('Checking for renamed file...');
  }

  return file;
};

export const orchestrator = async (
  args: OrchestratorOptions,
  statusCallback: (msg: string) => void
): Promise<ReportDetails> => {
  const { imagePath, output } = args;

  statusCallback('Hashing Drive...');
  const hash = await getMD5HashAsync(imagePath).catch((reason) => {
    statusCallback(reason as string);
    return '';
  });

  // console.log(imagePath);
  statusCallback('Reading Partition Table...');
  const partitionTable = await getPartitionTable(imagePath);

  // TODO:
  // need to figure out how to exclude some of these depending on orchestrator options
  statusCallback('Processing Files...');
  const [renamedFiles, deletedFiles, keywordFiles] =
    await runBufferedCliTool<File>(
      `fls -f ${partitionTable.tableType} -o ${partitionTable.partitions[1]} -r ${imagePath}`,
      getDeletedAndRenamedFiles
    );

  return {
    imageName: imagePath,
    imageHash: hash,
    partitionTable: output.partitions ? partitionTable : undefined,
    renamedFiles: output.renamedFiles ? renamedFiles : undefined,
    deletedFiles: output.deletedFiles ? deletedFiles : undefined,
    keywordFiles: output.keywordFiles ? keywordFiles : undefined,
  };
};
