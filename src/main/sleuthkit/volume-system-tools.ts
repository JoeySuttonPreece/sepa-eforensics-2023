import { ipcMain } from 'electron';
import { runTool } from './runner'

type Partition = {
  start: number,
  end: number,
  length: number,
  description: string
}

class PartitionTable {
  type: string;
  sectorSize: number;
  partitions: Partition[];
  constructor(matrix: string[][]) {
    this.type = matrix[0].join(' ');
    this.sectorSize = +matrix[2][3].split('-')[0];
    this.partitions = [];
    for(let i = 5; i < matrix.length - 1; i++) {
      this.partitions[i - 5] = {
        start: +matrix[i][2],
        end: +matrix[i][3],
        length: +matrix[i][4],
        description: matrix[i].slice(5).join(' ')
      }
    }
  }
}

ipcMain.on('volume-system:getPartitions', async(event, arg) => {
  runTool(`mmls ${arg[0]}`, async (matrix) => {
    let partitionTable = new PartitionTable(matrix);
    event.reply('volume-system:getPartitions', partitionTable);
  })  
});

export { Partition, PartitionTable }