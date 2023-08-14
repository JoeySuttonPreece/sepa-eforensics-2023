import { exec } from 'node:child_process';
import util from 'node:util';

const promisifiedExec = util.promisify(exec);

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

export { runCliTool };
