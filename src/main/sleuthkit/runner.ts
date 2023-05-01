import { exec } from 'node:child_process';

async function runTool(bin: string, callback: (matrix: string[][]) => void) {
  exec(bin, (error, stdout, stderr) => {
    if(error) {
      console.log(error);
      return;
    }
    let lines = stdout.split('\n');
    let matrix = lines.map(line => line.split(/\s+/));
    callback(matrix);
  });
}

export { runTool };