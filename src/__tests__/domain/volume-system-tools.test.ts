import '@testing-library/jest-dom';
import { Partition, getPartitionTable } from '../../domain/volume-system-tools';

jest.mock('../../domain/runner', () => {
  return {
    runCliTool: jest.fn().mockImplementationOnce(
      // header no signautre match
      async () =>
        'DOS Partition Table\nOffset Sector: 0\nUnits are in 512-byte sectors\n\nSlot      Start        End          Length       Description\n000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)\n001:  -------   0000000000   0000000062   0000000063   Unallocated\n002:  000:000   0000000063   0003968054   0003967992   Win95 FAT32 (0x0b)\n003:  -------   0003968055   0003970047   0000001993   Unallocated'
    ),
  };
});

test('Get Partition', async () => {
  const partitionTable = await getPartitionTable('');
  expect(partitionTable.tableType).toBe('DOS Partition Table');
  expect(partitionTable.sectorSize).toBe(512);
  expect(partitionTable.partitions[1].length).toBe(63);
  expect(partitionTable.partitions[1].description).toBe('Unallocated');
  // let noMatchResult = await processForRenamedFile("path", partition, file)
  // expect(noMatchResult).toBe(false);
  // let correctExtensionResult = await processForRenamedFile("path", partition, file)
  // expect(correctExtensionResult).toBe(false);
  // let renamedResult = await processForRenamedFile("path", partition, file)
  // if(renamedResult !== false) {
  //     expect(renamedResult.trueExtensions[0]).toBe('jpg');
  //     expect(renamedResult.matchedSignature).toBe("ffd8ffe0");
  // }
});
