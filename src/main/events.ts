import { ipcMain, dialog } from 'electron';

import { listFiles } from '../domain/file-system-tools';
import { orchestrator } from '../domain/orchestrator';
import { getHashAsync, getSearchStringAsync } from '../domain/other-cli-tools';
import { getPartitionTable } from '../domain/volume-system-tools';
import { OutputParser } from './output-parser';

ipcMain.on('do-everything', async (event, [options]) => {
  // insert loading while orchestrator is going, this means we can't await, perhaps a callback is put into orchestrator to define what it should do??
  const output = await orchestrator(options, (msg) => {
    event.sender.send('status:update', msg);
  });

  ipcMain.on('select-dir', (event) => {
    let path = dialog.showOpenDialogSync({
      properties: ['openDirectory'],
    });
    console.log(path);
    event.sender.send('select-dir', path);
  });

  ipcMain.on('print', (event, [format, destination]) => {
    OutputParser(output, format, destination);
  });

  // first send event that route should be changed to report then:
  event.sender.send('report:details', output);
});

//
// TO BE REMOVED (NOT NECESSARY IN FINAL APP)
//

ipcMain.on('volume-system:getPartitions', async (event, arg) => {
  const partitionTable = await getPartitionTable(arg[0]);
  event.reply('volume-system:getPartitions', partitionTable);
});

ipcMain.on('other-cli:getHash', async (event, arg) => {
  const hash = await getHashAsync(arg[0]);
  event.reply('other-cli:getHash', hash);
});

ipcMain.on(
  'file-name:listFiles',
  async (event, [volume, offset]: [string, number]) => {
    const files = await listFiles(volume, offset);
    event.reply('file-name:listFiles', files);
  }
);

ipcMain.on('other-cli: getSearchStringAsync ', async (event, arg) => {
  const searchString = await getSearchStringAsync(arg[0], arg[1], arg[3]);

  event.reply('other-cli: getSearchStringAsync ', searchString);
});

ipcMain.on(
  'file-name:listFiles',
  async (event, [volume, offset]: [string, number]) => {
    const files = await listFiles(volume, offset);
    event.reply('file-name:listFiles', files);
  }
);

const startSectorList: number[] = [];

ipcMain.on(' other-cli: getSearchStringAsync ', async (event, arg) => {
  const FileDetails = await getSearchStringAsync(
    arg[0],
    arg[1],
    startSectorList
  );

  event.reply(' other-cli: getSearchStringAsync ', FileDetails);
});
