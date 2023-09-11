import { runCliTool } from './runners';
import { Partition } from './volume-system-tools';

export type Hash = {
  fileName: string;
  md5sum: string;
  sha1sum: string;
};

export const getHashAsync = async (imagePath: string): Promise<Hash> => {
  const [md5sumFull, sha1sumFull] = await Promise.all([
    runCliTool(`md5sum ${imagePath}`),
    runCliTool(`sha1sum ${imagePath}`),
  ]);

  // For some reason, this picks up an empty string as the 2nd element.
  const md5sumArray = md5sumFull.split(' ');
  const sha1sumArray = sha1sumFull.split(' ');

  const fileName: string = md5sumArray[md5sumArray.length - 1];
  const md5sum: string = md5sumArray[0];
  const sha1sum: string = sha1sumArray[0];

  return {
    fileName,
    md5sum,
    sha1sum,
  };
};

export const getFileHashAsync = async (
  imagePath: string,
  filePartition: Partition,
  inode: string,
  keepFile: boolean = true
): Promise<Hash> => {
  await runCliTool(
    `icat -o ${filePartition.start} ${imagePath} ${inode} > .${inode}`
  );

  const hash = getHashAsync(`.${inode}`);

  if (!keepFile) {
    await runCliTool(`rm .${inode}`);
  }

  return hash;
};

export const getImageInString = async (imagePath: string): Promise<string> => {
  return runCliTool(`strings -t d ${imagePath}`);
};

export const getSearchStringAsync = async (
  imagePath: string,
  searchString: string,
  startSectorList: number[]
): Promise<string> => {
  const byteOffsetOfString: string = await runCliTool(
    `strings -t d ${imagePath} | grep -I ${searchString}`
  );

  let leastOffsetDifference: number = 0;
  let leastOffsetDifferenceFinal: number = 0;
  let startSectorMain: number = 0;

  let loopValue: number = 10;
  const sectorSizeByte = 512;

  for (let i: number = 0; i < startSectorList.length; i++) {
    loopValue =
      startSectorList[i] * (sectorSizeByte - Number(byteOffsetOfString));

    if (loopValue >= 0) {
      leastOffsetDifference = loopValue;
    } else {
      leastOffsetDifferenceFinal = leastOffsetDifference;

      startSectorMain = startSectorList[i];

      console.log(
        `Found the partition. Its starting byte offset is: ${startSectorMain} and the difference is: ${leastOffsetDifferenceFinal}`
      );

      break;
    }
  }

  const fsstatCommand: string = `fsstat -o expr ${startSectorMain} ${imagePath}`;
  const fileSystemTypeLine: string = await runCliTool(
    ` ${fsstatCommand} | grep 'File System Type'`
  );

  // possible output: File System Type: smth...So, need to split it to get the “smth”

  const splitted: (string | number)[] = fileSystemTypeLine.split(':');
  const fileSystemType: number = splitted[1] as number;

  // limiting it to print only first instance of “Size:” as it can be block size or sector size

  const partitionBlockOrSectorSizeUnsplit: string = await runCliTool(
    `${fsstatCommand} | grep  -o 'Size:'`
  );

  // possible output: Block Size: number...So, need to split it to get the “number”

  const splitted2: (string | number)[] =
    partitionBlockOrSectorSizeUnsplit.split(':');

  const partitionBlockOrSectorSize: number = splitted2[1] as number;

  const blockNum: number =
    leastOffsetDifferenceFinal / partitionBlockOrSectorSize;

  const inode: string = await runCliTool(
    `ifind -f ${fileSystemType} -o ${startSectorMain} -d ${blockNum} ${imagePath}`
  );

  // Note: If it doesn’t come as an integer number, it will need to be carved out as the file has been archived and deleted. Most probably if its deleted, it will come as a large number but not sure

  const fileDetails: string = await runCliTool(
    `icat -f ${fileSystemType} -o ${startSectorMain} ${imagePath} ${inode}`
  );

  return fileDetails;
};
