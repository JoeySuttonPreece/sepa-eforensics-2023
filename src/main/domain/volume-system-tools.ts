import { ipcMain } from 'electron';
import { runCliTool } from './runner'


type Partition = {
  start: number,
  end: number,
  length: number,
  description: string,
}

type PartitionTable = {
  tableType: string,
  sectorSize: number,
  partitions: Partition[]
}

const getPartitionTable = async (imagePath: string) : Promise<PartitionTable> => {
  const TABLESTARTINDEX = 5 // this is the line in mmls output where the beginning of the partion starts
  const output = await runCliTool(`mmls ${imagePath}`);
  
  //Parsing stdout to string matrix
  let lines = output.stdout.split('\n');
  let matrix = lines.map((line) => line.split(/\s+/));

  //Partition Table Info
  let tableType = matrix[0].join(' ');
  let sectorSize = Number(matrix[2][3].split('-')[0]);

  //Individual Partition Info
  let partitions = [];
  for(let i = TABLESTARTINDEX; i < matrix.length - 1; i++) {
    let start = Number(matrix[i][2]);
    let end = Number(matrix[i][3]);
    let length = Number(matrix[i][4]);
    let description = matrix[i].slice(5).join(' ');
    partitions[i - TABLESTARTINDEX] = {start, end, length, description};
  }

  return {tableType, sectorSize, partitions};
}

// This may become legacy.
ipcMain.on('volume-system:getPartitions', async(event, arg) => {
    const partitionTable = await getPartitionTable(arg[0]);
    event.reply('volume-system:getPartitions', partitionTable);
});

export { Partition, PartitionTable, getPartitionTable }