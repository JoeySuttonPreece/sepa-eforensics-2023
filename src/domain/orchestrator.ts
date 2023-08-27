import { File, RenamedFile } from './file-system-tools';
import { getMD5Hash } from './other-cli-tools';
import { PartitionTable, getPartitionTable } from './volume-system-tools';

export type OrchestratorOptions = {
  imagePath: string;
  output: {
    partitions: boolean;
    renamedFiles: boolean;
    deletedFiles: boolean;
    keywordFiles: boolean;
  };
};

export type ReportDetails = {
  imageName: string;
  imageHash: string;
  partitionTable: PartitionTable | undefined;
  renamedFiles: RenamedFile[] | undefined;
  deletedFiles: File[] | undefined;
  keywordFiles: any; // KeywordFile[] | undefined;
};

export const orchestrator = async (
  args: OrchestratorOptions
): Promise<ReportDetails> => {
  const { imagePath, output } = args;

  // console.log(imagePath);
  const hash = await getMD5Hash(imagePath);
  const partitionTable = await getPartitionTable(imagePath);

  // need to figure out how to exclude some of these depending on orchestrator options
  const {
    renamedFiles,
    deletedFiles,
    keywordFiles,
  }: { renamedFiles: RenamedFile[]; deletedFiles: File[]; keywordFiles: any } =
    { renamedFiles: [], deletedFiles: [], keywordFiles: [] }; //= await getSuspiciousFiles();

  return {
    imageName: imagePath,
    imageHash: hash,
    partitionTable: output.partitions ? partitionTable : undefined,
    renamedFiles: output.renamedFiles ? renamedFiles : undefined,
    deletedFiles: output.deletedFiles ? deletedFiles : undefined,
    keywordFiles: output.keywordFiles ? keywordFiles : undefined,
  };
};
