import { runVolumeSystemTool } from './runner';

export const getMD5Hash = async (
  imagePath: string
): Promise<string[][]> => {
  return runVolumeSystemTool(`md5sum ${imagePath}`);
};
