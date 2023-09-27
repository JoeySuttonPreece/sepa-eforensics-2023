import { runBufferedCliTool, runCliTool } from '../../domain/runners';
import { File } from '../../domain/file-system-tools';

async function getSomething() {
  const output = await runCliTool(`ls`);
  console.log(output);
}

async function listProcessor(line: string): Promise<File> {
  const split = line.split(/\s+/);

  const fileType = split[0].split('/');
  const [fileNameFileType, metadataFileType] = fileType;

  const deleted = split[1] === '*';

  let deletedOffset = 0;
  if (deleted) deletedOffset = 1;

  const inode = split[1 + deletedOffset].replace(':', '');
  // TODO: IMPLEMENT
  // Would be similar to deleted with a check for (REALLOCATED), no offset?
  const reallocated = false;

  const fileName = split[2 + deletedOffset];
  const mtime = split.slice(3 + deletedOffset, 6 + deletedOffset).join(' ');
  const atime = split.slice(6 + deletedOffset, 9 + deletedOffset).join(' ');
  const ctime = split.slice(9 + deletedOffset, 12 + deletedOffset).join(' ');
  const crtime = split.slice(12 + deletedOffset, 15 + deletedOffset).join(' ');
  const size = +split[15 + deletedOffset];
  const uid = split[16 + deletedOffset];
  const gid = split[17 + deletedOffset];

  const someData = await getSomething();

  return {
    fileNameFileType,
    metadataFileType,
    deleted,
    inode,
    reallocated,
    fileName,
    mtime,
    atime,
    ctime,
    crtime,
    size,
    uid,
    gid,
    hash: {
      fileName: '',
      md5sum: '',
      sha1sum: '',
    },
  };
}

// test('runBufferedCliTool', async () => {
//   const files = await runBufferedCliTool(
//     'fls /home/rob/Downloads/dfr-01-ntfs.dd -o 61 -l -p -r',
//     // 'fls /home/admin/res/backup/MyTestImage.dd -o 42008576 -l -p -r',
//     listProcessor
//   );

//   console.log(files);

//   for (let index = 0; index < files.length; index++) {
//     const element = files[index];
//     // processForRenamedFile('/home/rob/Downloads/dfr-01-ntfs.dd')
//     // const contents = await runBufferedCliTool(
//     //   `icat /home/rob/Downloads/dfr-01-ntfs.dd -o 61 ${element}`,
//     //   fileProcessor
//     // ).catch(reason => console.log(reason));
//   }

//   // This is now, an array of `File`s based on the output of the above command
//   // - WARNING: If used in production in its current state, reallocated files
//   // may not work as intended

//   expect(1).toBe(1);
// }, 60000);

test('runBufferedCliTool with async await callback', async () => {
  const files = await runBufferedCliTool(
    'fls /home/admin/res/backup/MyTestImage.dd -o 82048 -l -p -r',
    listProcessor
  );

  console.log(files);
  expect(1).toBe(1);
}, 60000);
