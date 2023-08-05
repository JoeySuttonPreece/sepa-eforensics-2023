import { ipcMain } from 'electron';

// MD5 Hashing function
ipcMain.on('other-cli:getMD5Hash', async (event, arg) => {
  let fileName: string = arg[0];

  const regex: RegExp = /(\.zip$)|(\.e01$)|(\.dd$)|(\.lef$)|(\.dmg$)/;

  if (fileName.search(regex) == -1) {
    console.log(fileName);

    event.reply('other-cli:getMD5Hash', 'File type not supported.');
    return;
  }

  // TODO:
  // Convert different file types to DD
  // Run MD5Sum

  // runTool(`md5sum ${arg[0]}`, async (matrix) => {
  //   event.reply('other-cli:getMD5Hash', partitionTable);
  // })
});
