/* eslint-disable no-await-in-loop */
import fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { ExifDateTime, exiftool } from 'exiftool-vendored';
import { runCliTool } from './runners';
import { Partition } from './volume-system-tools';
import { Hash, KeywordFile } from './file-system-tools';

// -------------------------------------------------------------------------------------------------
// Hash Processing

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

type iStatData = {
  deleted: boolean;
  attributes: string;
  size: string;
  mtime: string;
  atime: string;
  ctime: string;
};

export const getImageInString = (imagePath: string): Promise<string> => {
  return runCliTool(`strings -t d ${imagePath}`);
};

const parseStringsOutputToMatches = (stringsOutput: string): KeywordMatch[] => {
  const keywordMatches: KeywordMatch[] = [];
  const lines = stringsOutput.split('\n');

  for (const line of lines) {
    if (line === '') break;

    const splittedLine = line.split(' ');

    const offset: string = splittedLine.shift();

    const matchedString = splittedLine.join(' ');

    keywordMatches.push({
      offset,
      matchedString,
    });
  }

  return keywordMatches;
};

const processFileInformationRaw = (fileInformationRaw: string): iStatData => {
  const fileInformationSplitOnNewLines = fileInformationRaw.split('\n');

  const allocatedLine = fileInformationSplitOnNewLines[1];
  const fileAttributesLine = fileInformationSplitOnNewLines[2];
  const sizeLine = fileInformationSplitOnNewLines[3];

  const dateWrittenLine = fileInformationSplitOnNewLines[7];
  const dateAccessedLine = fileInformationSplitOnNewLines[8];
  const dateCreatedLine = fileInformationSplitOnNewLines[9];

  const deleted = allocatedLine === 'Not Allocated';
  const attributes = fileAttributesLine;
  const size = sizeLine.split(' ')[1];

  const mtime = dateWrittenLine.slice(11);
  const atime = dateAccessedLine.slice(12);
  const ctime = dateCreatedLine.slice(11);

  return {
    deleted,
    attributes,
    size,
    mtime,
    atime,
    ctime,
  };
};

const getFilesForKeyword = async (
  imagePath: string,
  searchString: string,
  partitions: Partition[]
): Promise<KeywordFile[]> => {
  const result: KeywordFile[] = [];

  console.log(`Finding matches for keyword ${searchString}`);

  let stringsOutput: string = '';

  try {
    stringsOutput = await runCliTool(
      `strings -t d ${imagePath} | grep -i ${searchString}`
    );
  } catch (error) {
    return result;
  }

  console.log(`Converted disk to strings.`);

  const keywordMatches = parseStringsOutputToMatches(stringsOutput);
  console.log(`Potential matches found:`);
  console.log(keywordMatches);

  const sectorSizeInBytes = 512; // assumption

  for (const match of keywordMatches) {
    // Convert the byte value to a sector offset using the sector size.
    const matchedFileSectorOffset =
      parseInt(match.offset, 10) / sectorSizeInBytes;
    let partitionContainingFile = null;

    // Find the partition that the file is in.
    for (let i: number = 0; i < partitions.length; i++) {
      if (matchedFileSectorOffset > partitions[i].start) {
        partitionContainingFile = partitions[i];
      }
    }

    if (partitionContainingFile === null) {
      break;
    }

    console.log(`Possible match found in partition:`);
    console.log(partitionContainingFile);

    // Find the sector number from the start of the partition.
    const matchedFileSectorOffsetFromPartitionStartSector = Math.round(
      matchedFileSectorOffset - partitionContainingFile.start
    );

    // Find the inode.
    const fileiNode = await runCliTool(
      `ifind -o ${partitionContainingFile.start} ${imagePath}` +
        ` -d ${matchedFileSectorOffsetFromPartitionStartSector} `
    );

    if (fileiNode === 'Inode not found\n') {
      break;
    }

    // Find the file path (relative to the partition).
    const filePath = await runCliTool(
      `ffind -o ${partitionContainingFile.start} ${imagePath} ${fileiNode}`
    );

    // Find further metadata.
    const fileInformationRaw = await runCliTool(
      `istat -o ${partitionContainingFile.start} ${imagePath} ${fileiNode}`
    );

    const fileInformationProcessed =
      processFileInformationRaw(fileInformationRaw);

    const hash = await getFileHashAsync(
      imagePath,
      partitionContainingFile,
      fileiNode,
      false
    );

    const resultFile: KeywordFile = {
      inode: fileiNode,
      deleted: fileInformationProcessed.deleted,
      fileAttributes: fileInformationProcessed.attributes,
      filePath,
      matches: match.matchedString,
      size: fileInformationProcessed.size,
      mtime: fileInformationProcessed.mtime,
      atime: fileInformationProcessed.atime,
      ctime: fileInformationProcessed.ctime,
      hash,
    };

    console.log(`Matched file found:`);
    console.log(resultFile);

    result.push(resultFile);
  }

  console.log(`All matches for keyword ${searchString}: `);
  console.log(result);

  return result;
};

export const getFilesForAllKeywords = async (
  imagePath: string,
  searchString: string,
  partitions: Partition[]
): Promise<KeywordFile[]> => {
  let result: KeywordFile[] = [];

  const keywords = searchString.split(',');

  for (const keyword of keywords) {
    const files: KeywordFile[] = await getFilesForKeyword(
      imagePath,
      keyword,
      partitions
    );

    result = result.concat(files);
  }

  return result;
};

// -------------------------------------------------------------------------------------------------
// Carved Processing

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
  await runCliTool(`rm -rf ./${FOLDER_NAME}.*`);
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

    /* Required fixing:
       Problem: When carving a result with null enclosed array, then program crashes.
       Potential solution: Create a if condition that detect array with null inside
    */
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
