import '@testing-library/jest-dom';
import { getTimeZone } from '../../domain/file-system-tools';
import { PartitionTable } from '../../domain/volume-system-tools';

jest.mock('../../domain/runners', () => {
  return {
    runCliTool: jest
      .fn()
      .mockImplementationOnce(
        // header no signature match
        async () => {
          throw Error("Can't find at all");
        }
      )
      .mockImplementationOnce(
        // header no signature match
        async () => {
          throw Error("Can't find at all");
        }
      )
      .mockImplementationOnce(
        // header no signature match
        async () => {
          throw Error("Can't find at inode");
        }
      )
      .mockImplementationOnce(
        async () =>
          'd/d 11: lost+found\nd/d 1572865:    etc\nd/d 7077889:    media\nd/d 5505025:    home\nl/l 14: lib\nd/d 3407873:    mnt\nd/d 3145729:    usr\nd/d 5898241:    var'
      )
      .mockImplementationOnce(
        async () =>
          'd/d 5900627:    backups\nd/d 5900630:    timezone\nd/d 5900631:    local\nd/d 5900633:    log\nl/l 5900636:    run\nd/d 5900639:    tmp\nd/d 5900812:    www'
      )
      .mockImplementationOnce(
        // header no signature match
        async () => {
          throw Error('Icat Fail');
        }
      )
      .mockImplementationOnce(
        async () =>
          'd/d 11: lost+found\nd/d 1572865:    etc\nd/d 7077889:    media\nd/d 5505025:    home\nl/l 14: lib\nd/d 3407873:    mnt\nd/d 3145729:    usr\nd/d 5898241:    var'
      )
      .mockImplementationOnce(
        async () =>
          'd/d 5900627:    backups\nd/d 5900630:    timezone\nd/d 5900631:    local\nd/d 5900633:    log\nl/l 5900636:    run\nd/d 5900639:    tmp\nd/d 5900812:    www'
      )
      .mockImplementation(async () => 'Australia/Sydney'),
  };
});

test('Timezone', async () => {
  const partitionTable: PartitionTable = {
    sectorSize: 512,
    tableType: 'DOS',
    partitions: [
      { start: 0, end: 0, length: 0, description: '' },
      { start: 63, end: 100, length: 37, description: '' },
    ],
  };

  const noTimezone = await getTimeZone(partitionTable, '');
  expect(noTimezone).toBe(undefined);
  const timezoneFailicat = await getTimeZone(partitionTable, '');
  expect(timezoneFailicat).toBe(undefined);
  const timezone = await getTimeZone(partitionTable, '');
  expect(timezone).toBe('Australia/Sydney');
});
