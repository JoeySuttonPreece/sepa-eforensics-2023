import { ipcMain } from 'electron';

import { listFiles } from '../domain/file-system-tools';
import { OrchestratorOptions, orchestrator } from '../domain/orchestrator';
import { getMD5Hash } from '../domain/other-cli-tools';
import { getPartitionTable } from '../domain/volume-system-tools';

ipcMain.on('do-everything', async (event, arg: OrchestratorOptions) => {
  const output = await orchestrator(arg);
  event.reply('do-everything', output);
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
