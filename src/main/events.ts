import { ipcMain } from 'electron';

import { listFiles } from '../domain/file-system-tools';
import { OrchestratorOptions, orchestrator } from '../domain/orchestrator';
import { getMD5Hash } from '../domain/other-cli-tools';
import { getPartitionTable } from '../domain/volume-system-tools';

ipcMain.on('do-everything', async (event, [options]) => {
  const output = await orchestrator(options);
  // insert loading while orchestraotr is going, this means we can;t await, perhaps a callback is put into orchestroator to defien what it should do??
  
  //first send event that route should be changed to report then:
  event.sender.send('report:details', output);
});

ipcMain.on('volume-system:getPartitions', async (event, arg) => {
  const partitionTable = await getPartitionTable(arg[0]);
  event.reply('volume-system:getPartitions', partitionTable);
});

ipcMain.on('other-cli:getMD5Hash', async (event, arg) => {
  const md5Hash = await getMD5Hash(arg[0]);
  event.reply('other-cli:getMD5Hash', md5Hash);
})

ipcMain.on('file-name:listFiles', async (event, [volume, offset]: [string, number]) => {
  const files = await listFiles(volume, offset);
  event.reply('file-name:listFiles', files);
});
