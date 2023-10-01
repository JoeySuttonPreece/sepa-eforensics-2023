import { ipcMain, dialog } from 'electron';

import { orchestrator, validateImage } from '../domain/orchestrator';
import { Print } from './output-parser';

ipcMain.on('do-everything', async (event, [options]) => {
  // insert loading while orchestrator is going, this means we can't await,
  // perhaps a callback is put into orchestrator to define what it should do??

  try {
    const output = await orchestrator(options, (msg) => {
      event.sender.send('status:update', msg);
    });

    ipcMain.on('select-dir', (event) => {
      const path = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
      });
      console.log(path);
      event.sender.send('select-dir', path);
    });

    ipcMain.on('print', (event, [format, destination]) => {
      if (output !== null) Print(output, format, destination);
    });

    // first send event that route should be changed to report then:
    event.sender.send('report:details', output);
  } catch (error: any) {
    event.sender.send('report:error', error.message);
  }
});

ipcMain.on('validate:imagePath', (event, [imagePath]) => {
  event.sender.send('validate:imagePath', validateImage(imagePath));
});
