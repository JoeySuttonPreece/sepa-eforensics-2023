import { exec } from 'node:child_process';

export const runCliTool = async (bin: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(bin, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        console.error(stderr);
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
};
