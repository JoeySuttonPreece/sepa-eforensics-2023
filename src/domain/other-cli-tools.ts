import { runCliTool } from './runner';

export const getMD5HashAsync = async (imagePath: string): Promise<string> => {
  return runCliTool(`md5sum ${imagePath}`);
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
      startSectorList[i] * (sectorSizeByte - (byteOffsetOfString as number));

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
