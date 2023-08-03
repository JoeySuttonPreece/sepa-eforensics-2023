import { exec } from 'node:child_process';

async function runVolumeSystemTool(bin: string, callback: (matrix: string[][]) => void) {
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

async function runFileSystemTool(bin: string, callback: (matrix: string[][]) => void) {
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

async function runOtherCliTool(bin: string) {

}

export { 
  runVolumeSystemTool,
  runFileSystemTool 
};