import { runCliTool } from './runner';

export const getMD5Hash = async (imagePath: string): Promise<string> => {
  return runCliTool(`md5sum ${imagePath}`);
};
