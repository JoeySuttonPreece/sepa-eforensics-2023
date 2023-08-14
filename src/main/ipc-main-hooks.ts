import { ipcMain } from 'electron';
import { getMD5HashAsync } from '../app-core/domain/other-cli-tools';
/*
// Example API:

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
*/

ipcMain.on('other-cli:getMD5Hash', async (event, arg) => {
  const md5Hash = await getMD5HashAsync(arg[0]);

  event.reply('other-cli:getMD5Hash', md5Hash);
});

//
