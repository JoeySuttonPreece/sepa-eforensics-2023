import { exec, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

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

// This function will return the an array of all the processed data, as computed by each lineProcessor function
export const runBufferedCliTool = async (bin: string, lineProcessor: (line: string) => any): Promise<any[]> => {
  return new Promise<string[]>((resolve, reject) => {
    let command = bin.split(' ');
    let process = spawn(command[0], command.slice(1));
    let outputArray = [];
    
    let lineReader = createInterface({
      input: process.stdout,
      terminal: false
    });

    lineReader.on('line', (line: string) => {
      let processedLine = lineProcessor(line);
      outputArray.push(processedLine);
    });

    process.on('exit', (code: number) => {
      if(code === 0) {
        resolve(outputArray);
      } else {
        reject(new Error(`Child process exited with code ${code}`))
      }
    });

    process.on('error', (err: Error) => {
      reject(err);
    });
  }); 
}