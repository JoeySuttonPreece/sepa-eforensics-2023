import { File } from '../../types/types';

const file: File = new File();

test('file works', () => {
  expect(file.fileNameFileType).toBe('');
});
