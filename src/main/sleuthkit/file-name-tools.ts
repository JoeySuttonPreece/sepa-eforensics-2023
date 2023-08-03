import { ipcMain } from 'electron';
import { runTool } from './runner'

ipcMain.on('file-name:listFiles', async (event, arg) => {
  runTool(`fls ${arg[0]} -o ${arg[1]}`, async (matrix) => {
    console.log(matrix);
    event.reply('file-name:listFiles', matrix);
  })  
});