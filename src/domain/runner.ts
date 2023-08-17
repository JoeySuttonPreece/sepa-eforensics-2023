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

// This function takes in a string `bin`, which is the command to be run
// It also takes in a lineProcessor function. This function will be run for every line in the output of the command that is run
// NOTE: The return value for lineProcessor, and this function as a whole are both strings, this is purely for early development / demonstration / testing. This will be updated to a different type down the line

// This function will return the an array of all the processed data, as computed by each lineProcessor function
export const runBufferedCliTool = async (bin: string, lineProcessor: (line: string) => string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    
  }); 
}