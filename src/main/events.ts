import { ipcMain, dialog } from 'electron';

import {
  orchestrator,
  validateImage,
  validateZip,
  validateDMG,
} from '../domain/orchestrator';
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

ipcMain.on('validate:imagePath', async (event, [imagePath]) => {
  let valid = await validateImage(imagePath);
  let finalPath = imagePath;
  let reason = 'image ready for analysis';

  if (valid) {
    await validateZip(imagePath)
      .then((newPath) => {
        valid = true;
        finalPath = newPath;
      })
      .catch(() => {
        valid = false;
        reason =
          'image could not be extracted to a supported forensic file type';
      });
    await validateDMG(imagePath)
      .then((newPath) => {
        valid = true;
        finalPath = newPath;
      })
      .catch(() => {
        valid = false;
        reason =
          'image could not be extracted to a supported forensic file type';
      });
  } else {
    reason = "image couldn't be found or is not a supported file type";
  }

  event.sender.send('validate:imagePath', [valid, finalPath, reason]);
});

ipcMain.on('select:imagepath', (event) => {
  const path = dialog.showOpenDialogSync({
    properties: ['openFile'],
  });
  event.sender.send('select:imagepath', path);
});
