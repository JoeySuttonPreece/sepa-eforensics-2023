import { ipcMain } from 'electron';

import { OrchestratorOptions, orchestrator } from 'domain/orchestrator';

ipcMain.on('do-everything', async (event, arg: OrchestratorOptions) => {
  const output = await orchestrator(arg);
  event.reply('do-everything', output);
});

// ipcMain.on('file-name:listFiles', async (event, [volume, offset]: [string, number]) => {
//   const matrix = await listFiles(volume, offset);
//   event.reply('file-name:listFiles', matrix);
// });

// // MD5 Hashing function
// ipcMain.on('other-cli:getMD5Hash', async (event, arg) => {

//   let fileName: string = arg[0];

//   const regex: RegExp = /(\.zip$)|(\.e01$)|(\.dd$)|(\.lef$)|(\.dmg$)/

//   if (fileName.search(regex) == -1) {
//     console.log(fileName);

//     event.reply('other-cli:getMD5Hash', 'File type not supported.')
//     return;
//   }

//   // TODO:
//   // Convert different file types to DD
//   // Run MD5Sum

//   // runTool(`md5sum ${arg[0]}`, async (matrix) => {
//   //   event.reply('other-cli:getMD5Hash', partitionTable);
//   // })

// });

// ipcMain.on('volume-system:getPartitions', async(event, arg) => {
//   runVolumeSystemTool(`mmls ${arg[0]}`, async (matrix) => {
//     let partitionTable = new PartitionTable(matrix);
//     event.reply('volume-system:getPartitions', partitionTable);
//   })
// });
