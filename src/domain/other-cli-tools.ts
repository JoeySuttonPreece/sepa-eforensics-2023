/* eslint-disable no-await-in-loop */
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { ExifDateTime, exiftool } from 'exiftool-vendored';
import { runCliTool } from './runners';
import { Partition } from './volume-system-tools';

// -------------------------------------------------------------------------------------------------
// Hash Processing

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

  const hash = await getHashAsync(`.${inode}`);

  if (!keepFile) {
    await runCliTool(`rm .${inode}`);
  }

  return hash;
};

// -------------------------------------------------------------------------------------------------
// Keyword File Processing

type KeywordMatch = {
  offset: string;
  matchedString: string;
};

export const getImageInString = (imagePath: string): Promise<string> => {
  return runCliTool(`strings -t d ${imagePath}`);
};

const parseStringsOutputToMatches = (stringsOutput: string): KeywordMatch[] => {
  const keywordMatches: KeywordMatch[] = [];
  const lines = stringsOutput.split('\n');

  for (const line of lines) {
    const splittedLine = line.split(' ');
    keywordMatches.push({
      offset: splittedLine[0],
      matchedString: splittedLine[1],
    });
  }

  return keywordMatches;
};

export const getSearchStringAsync = async (
  imagePath: string,
  searchString: string,
  startSectorList: number[]
): Promise<string> => {
  const stringsOutput: string = await runCliTool(
    `strings -t d ${imagePath} | grep -I ${searchString}`
  );

  const keywordMatches = parseStringsOutputToMatches(stringsOutput);

  for (const match of keywordMatches) {
  }

  let leastOffsetDifference: number = 0;
  let leastOffsetDifferenceFinal: number = 0;
  let startSectorMain: number = 0;

  let loopValue: number = 10;
  const sectorSizeByte = 512;

  for (let i: number = 0; i < startSectorList.length; i++) {
    loopValue =
      startSectorList[i] * (sectorSizeByte - parseInt(stringsOutput, 10));

    if (loopValue >= 0) {
      leastOffsetDifference = loopValue;
    } else {
      leastOffsetDifferenceFinal = leastOffsetDifference;

      startSectorMain = startSectorList[i];

      console.log(
        `Found the partition. Its starting byte offset is: ${startSectorMain} ` +
          `and the difference is: ${leastOffsetDifferenceFinal}.`
      );

      break;
    }
  }

  const fsstatCommand: string = `fsstat -o expr ${startSectorMain} ${imagePath}`;
  const fileSystemTypeLine: string = await runCliTool(
    ` ${fsstatCommand} | grep 'File System Type'`
  );

  // possible output: File System Type: smth...So, need to split it to get the “smth”
  const fileSystemType: number = parseInt(fileSystemTypeLine.split(':')[1], 10);

  // limiting it to print only first instance of “Size:” as it can be block size or sector size
  const partitionBlockOrSectorSizeUnsplit: string = await runCliTool(
    `${fsstatCommand} | grep  -o 'Size:'`
  );

  // possible output: Block Size: number...So, need to split it to get the “number”
  const partitionBlockOrSectorSize: number = parseInt(
    partitionBlockOrSectorSizeUnsplit.split(':')[1],
    10
  );

  const blockNum: number =
    leastOffsetDifferenceFinal / partitionBlockOrSectorSize;

  const inode: string = await runCliTool(
    `ifind -f ${fileSystemType} -o ${startSectorMain} -d ${blockNum} ${imagePath}`
  );

  // Note: If it doesn’t come as an integer number, it will need to be carved out as the file
  // has been archived and deleted. Most probably if it's deleted, it will come
  // as a large number but not sure
  const fileDetails: string = await runCliTool(
    `icat -f ${fileSystemType} -o ${startSectorMain} ${imagePath} ${inode}`
  );

  return fileDetails;
};

export type CarvedFile = {
  filename: string;
  size: number;
  sector: number;
  modifiedDate?: Date;
  filetype?: string;
};

// BEHOLD THE ACCURSED RELIC OF A BYGONE AGE
// NEVER TO BE USED AGAIN
export type ArrayCarvedFile = {
  CarvedFileInstance: CarvedFile[];
};

const FOLDER_NAME = 'testFolder';

export const getCarvedFiles = async (
  imagePath: string,
  sectorSize: number,
  startSectorList: number[]
): Promise<CarvedFile[]> => {
  const results: CarvedFile[] = [];
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseAttributeValue: true,
    attributesGroupName: 'xml_attributes',
    attributeNamePrefix: '',
  });
  const now = Date.now();
  for (let i = 1; i < startSectorList.length; i++) {
    await runCliTool(
      // automatic create FOLDER_NAME with index. (FOLDER_NAME.1)
      `photorec /d ${FOLDER_NAME} /cmd ${imagePath} wholespace,${i},fileopt,everything,enable,options,paranoid,search `
    );

    const report = parser.parse(
      fs.readFileSync(`./${FOLDER_NAME}.1/report.xml`, 'utf8'),
      {}
    );

    const files: {
      filename: string;
      filesize: number;
      byte_runs: {
        byte_run: {
          xml_attributes: { img_offset: number; len: number; offset: number };
        };
      };
    }[] = Array.isArray(report.dfxml.fileobject)
      ? report.dfxml.fileobject
      : [report.dfxml.fileobject];

    await Promise.all(
      files.map(async (file) => {
        const exifData = await exiftool
          .read(`./${FOLDER_NAME}.1/${file.filename}`)
          .catch(() => console.log(`exiftool failed: ${file.filename}`));

        const modifiedDate = (
          exifData?.FileModifyDate as ExifDateTime
        )?.toDate();

        results.push({
          filename: file.filename,
          size: file.filesize,
          sector: file.byte_runs.byte_run.xml_attributes.img_offset,
          filetype: exifData?.FileType,
          modifiedDate:
            modifiedDate?.getTime() > now ? undefined : modifiedDate,
        });
      })
    );

    await runCliTool(`rm -rf ./${FOLDER_NAME}.*`);
  }

  return results;
};
