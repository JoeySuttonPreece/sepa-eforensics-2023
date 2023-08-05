import { exec } from 'node:child_process';

export const runVolumeSystemTool = async (bin: string): Promise<string[][]> => {
  return new Promise((resolve, reject) => {
    exec(bin, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        console.error(stderr);
        reject(error);
        return;
      }

      const lines = stdout.split('\n');
      const matrix = lines.map((line: string) => line.split(/\s+/));
      resolve(matrix);
    });
  });
};

export const runFileSystemTool = runVolumeSystemTool;
export const runOtherCliTool = runVolumeSystemTool;
