import { exec, spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

/**
 * This function does runs a single command in the terminal, and returns the
 * result as a Promise.
 * The command is run asynchronously.
 */
export const runCliTool = async (bin: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(
      bin,
      {
        maxBuffer: 10 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      }
    );
  });
};

/** This function takes in a string `bin`, which is the command to be run.
 * It also takes in a lineProcessor function. This function will be run for
 * every line in the output of the command that is run.
 * This function will return the an array of all the processed data,
 * as computed by each lineProcessor function.
 */
export const runBufferedCliTool = <Type>(
  bin: string,
  lineProcessor: (line: string) => Type
): Promise<Type[]> => {
  return new Promise<Type[]>((resolve, reject) => {
    // Spawn expects a command, and then an array of arguments - this just
    // allows us to run commands the same way as runCliTool/exec
    const command = bin.split(' ');
    const process = spawn(command[0], command.slice(1));

    const outputArray: Type[] = [];

    // Create a readline interface based on the stdout stream produced by the
    // spawned process - this is how we get output line by line
    const lineReader = createInterface({
      input: process.stdout,
      terminal: false,
    });

    // For every line, run the callback function and append its return value to
    // the final outputArray
    // TODO: support / prioritise async callbacks?
    lineReader.on('line', (line: string) => {
      const processedLine = lineProcessor(line);
      outputArray.push(processedLine);
    });

    // Once the process is finished executing, we can 'return' the output array
    // One thing that I have no verified, is if the lineProcessor performs a
    // long-running task, what actually happens here - theoretically this
    // should wait for it to finish
    process.on('exit', (code: number) => {
      if (code === 0) {
        resolve(outputArray);
      } else {
        reject(new Error(`Child process exited with code ${code}`));
      }
    });

    process.on('error', (err: Error) => {
      reject(err);
    });
  });
};
