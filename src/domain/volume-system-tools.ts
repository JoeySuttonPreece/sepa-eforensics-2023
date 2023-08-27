import { runCliTool } from './runner';

export type Partition = {
  start: number;
  end: number;
  length: number;
  description: string;
};

export type PartitionTable = {
  tableType: string;
  sectorSize: number;
  partitions: Partition[];
};

export const getPartitionTable = async (
  imagePath: string
): Promise<PartitionTable> => {
  const TABLESTARTINDEX = 5; // this is the line in mmls output where the beginning of the partion starts
  const output = await runCliTool(`mmls ${imagePath}`);

  // Parsing stdout to string matrix
  const lines = output.split('\n');
  const matrix = lines.map((line) => line.split(/\s+/));

  // Partition Table Info
  const tableType = matrix[0].join(' ');
  const sectorSize = Number(matrix[2][3].split('-')[0]);

  // Individual Partition Info
  const partitions = [];
  for (let i = TABLESTARTINDEX; i < matrix.length - 1; i++) {
    const start = Number(matrix[i][2]);
    const end = Number(matrix[i][3]);
    const length = Number(matrix[i][4]);
    const description = matrix[i].slice(5).join(' ');
    partitions[i - TABLESTARTINDEX] = { start, end, length, description };
  }

  return { tableType, sectorSize, partitions };
};
