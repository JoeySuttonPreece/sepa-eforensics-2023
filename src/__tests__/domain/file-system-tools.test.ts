import '@testing-library/jest-dom';
import { processForRenamedFile, File } from '../../domain/file-system-tools';
import { Partition } from '../../domain/volume-system-tools';

jest.mock('../../domain/runners', () => {
  return {
    runCliTool: jest
      .fn()
      .mockImplementationOnce(
        // header no signature match
        async () => 'aaaaaaaaaaaaaaaa'
      )
      .mockImplementationOnce(
        // header signature match correct extension
        async () => '89504e470d0a1a0a0000000d49484452' // png
      )
      .mockImplementationOnce(
        // header signature match mismatch extension
        async () => 'ffd8ffe000104a464946000101010048' // jpg
      ),
  };
});

test('Renamed File Processing', async () => {
  const partition: Partition = {
    start: 63,
    end: 128,
    length: 128 - 63,
    description: '',
  };
  const file: File = {
    inode: '143',
    fileName: 'user/images/renamed.png',
    fileNameFileType: '',
    metadataFileType: '',
    deleted: false,
    reallocated: false,
    crtime: new Date(),
    atime: new Date(),
    ctime: new Date(),
    mtime: new Date(),
    size: 64,
    uid: '',
    gid: '',
    hash: { md5sum: '', sha1sum: '', fileName: '' },
  };

  const noMatchResult = await processForRenamedFile(file, 'path', partition);
  expect(noMatchResult).toBe(false);
  const correctExtensionResult = await processForRenamedFile(
    file,
    'path',
    partition
  );
  expect(correctExtensionResult).toBe(false);
  const renamedResult = await processForRenamedFile(file, 'path', partition);
  if (renamedResult === false)
    throw new Error("Reneamed Result Shouldn't be false in this case");
  expect(renamedResult.trueExtensions[0]).toBe('jpg');
  expect(renamedResult.matchedSignature).toBe('ffd8ffe0');
});
