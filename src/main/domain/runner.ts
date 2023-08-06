import { exec } from 'node:child_process';
import util from 'node:util';

const promisifiedExec = util.promisify(exec);

async function runVolumeSystemTool(
  bin: string,
  callback: (matrix: string[][]) => void
) {
  exec(bin, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return;
    }
    let lines = stdout.split('\n');
    let matrix = lines.map((line) => line.split(/\s+/));
    callback(matrix);
  });
}

async function runFileSystemTool(
  bin: string,
  callback: (matrix: string[][]) => void
) {
  exec(bin, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return;
    }
    let lines = stdout.split('\n');
    let matrix = lines.map((line) => line.split(/\s+/));
    callback(matrix);
  });
}

async function runCliTool(cmdString: string) {
  const { stdout, stderr } = await promisifiedExec(cmdString);

  return { stdout, stderr };
}

export { runVolumeSystemTool, runFileSystemTool };
