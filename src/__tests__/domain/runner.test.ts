import '@testing-library/jest-dom';
import { runBufferedCliTool } from '../../domain/runner';
import { File } from '../../types/types';

function lineProcessor(line: string): File {
  const split = line.split(/\s+/);

  const file: File = new File();

  const fileType = split[0].split('/');
  [file.fileNameFileType, file.metadataFileType] = fileType;

  file.deleted = split[1] === '*';

  let deletedOffset = 0;
  if (file.deleted) deletedOffset = 1;

  file.inode = split[1 + deletedOffset];
  // TODO: IMPLEMENT
  // Would be similar to deleted with a check for (REALLOCATED), no offset?
  file.reallocated = false;

  file.fileName = split[2 + deletedOffset];
  file.mtime = split.slice(3 + deletedOffset, 6 + deletedOffset).join(' ');
  file.atime = split.slice(6 + deletedOffset, 9 + deletedOffset).join(' ');
  file.ctime = split.slice(9 + deletedOffset, 12 + deletedOffset).join(' ');
  file.crtime = split.slice(12 + deletedOffset, 15 + deletedOffset).join(' ');
  file.size = +split[15 + deletedOffset];
  file.uid = split[16 + deletedOffset];
  file.gid = split[17 + deletedOffset];

  return file;
}

test('DEBUG: RUN FUNCTION', async () => {
  const output = await runBufferedCliTool(
    // 'fls /home/rob/Downloads/dfr-01-ntfs.dd -o 61 -l',
    'fls /home/admin/res/dfr-01-fat.dd -o 128 -l',
    lineProcessor
  );
  // This is now, an array of `File`s based on the output of the above command - WARNING: If used in production in its current state, reallocated files may not work as intended
  console.log(output);
  expect(output).toBe(''); // Put expected output here
}, 60000);
