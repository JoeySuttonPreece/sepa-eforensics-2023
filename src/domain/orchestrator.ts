import { getMD5Hash } from './other-cli-tools';

export type OrchestratorOptions = {
  imagePath: string;
  output: {
    partitions: boolean;
  };
};

export const orchestrator = async (args: OrchestratorOptions) => {
  const { imagePath } = args;

  console.log(args);
  const hash = await getMD5Hash(imagePath);
  return { hash };
};
