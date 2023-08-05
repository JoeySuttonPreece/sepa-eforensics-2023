import { ipcMain } from 'electron';
import { runFileSystemTool } from './runner';

//https://wiki.sleuthkit.org/index.php?title=Fls
//LONG FORMAT!!!
type File = {
  //x/y in output, these can be different for deleted files, cant come up with a better name
  fileNameFileType: string,
  metadataFileType: string,
  deleted: bool,
  inode: string,
  reallocated: bool,
  //THIS IS THE ACTUAL FILE NAME
  fileName: string,
  //maybe parse these to dates? help with timeline or something
  mtime: string,
  atime: string,
  ctime: string,
  crtime: string,
  size: int,
  uid: string,
  gid: string
}

//This may (also) become legacy
ipcMain.on('file-name:listFiles', async (event, arg) => {
  runFileSystemTool(`fls ${arg[0]} -o ${arg[1]}`, async (matrix) => {
    console.log(matrix);
    event.reply('file-name:listFiles', matrix);
  });
});
