import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { orchestrator } from 'domain/orchestrator';

const { commandLine, imagePath } = yargs(hideBin(process.argv))
  .boolean('commandLine')
  .option('imagePath', { demandOption: true, type: 'string' }).argv;

if (commandLine) {
  console.log(orchestrator({ imagePath, output: { partitions: true } }));
} else {
  import('./main/main');
}
