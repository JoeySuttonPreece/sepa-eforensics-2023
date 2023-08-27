import { runCliTool } from './runner';

export const getMD5HashAsync = async (imagePath: string): Promise<string> => {
  return runCliTool(`md5sum ${imagePath}`);
};

export const getSearchStringAsync = async (
  imagePath: string,
  searchString: string
): Promise<string> => {
  return runCliTool(`grep ${searchString}  -f ${imagePath}`);
};
