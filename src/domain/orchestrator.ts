import { getPartitionTable } from './volume-system-tools';

export type OrchestratorOptions = {
  imagePath: string;
  output: {
    partitions: boolean;
  };
};

export const orchestrator = async (args: OrchestratorOptions) => {
  const { imagePath } = args;

  console.log(args);
  const partitions = await getPartitionTable(imagePath);
  return { partitions };
};
