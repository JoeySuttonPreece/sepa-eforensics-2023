import { exec } from 'node:child_process';
import util, { callbackify } from 'node:util';

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
 // async funciton buufered(cmd, callback) : {} {
//  let arrayresults
 // spawn> ()=> buffer {
  // buffer healing

  //
//  callbackresult = callback(line) -> callback is procesing
// if(callbackresult) {arrayreults.oush(callbakcresults)}
//}
//}
// return arrayresults;
 //}

async function runCliTool(cmdString: string) {
  const { stdout, stderr } = await promisifiedExec(cmdString);

  return { stdout, stderr };
}

export { runVolumeSystemTool, runFileSystemTool, runCliTool };
