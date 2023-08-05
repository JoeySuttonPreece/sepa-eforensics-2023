import { runVolumeSystemTool } from './runner';

export type Partition = {
  start: number;
  end: number;
  length: number;
  description: string;
};

export type PartitionTable = {
  type: string;
  sectorSize: number;
  partitions: Partition[];
};

export const parsePartitionTable = (matrix: string[][]): PartitionTable => {
  const type = matrix[0].join(' ');
  const sectorSize = Number(matrix[2][3].split('-')[0]);
  const partitions = [];

  for (let i = 5; i < matrix.length - 1; i++) {
    partitions[i - 5] = {
      start: Number(matrix[i][2]),
      end: Number(matrix[i][3]),
      length: Number(matrix[i][4]),
      description: matrix[i].slice(5).join(' '),
    };
  }

  return {
    type,
    sectorSize,
    partitions,
  };
};

export const getPartitionTable = async (
  imagePath: string
): Promise<PartitionTable> => {
  const matrix = await runVolumeSystemTool(`mmls ${imagePath}`);
  return parsePartitionTable(matrix);
};
