import { runFileSystemTool } from './runner';

export const listFiles = async (volume: string, offset: number) => {
  // TODO: parse text output into object
  return runFileSystemTool(`fls ${volume} -o ${offset}`);
};
