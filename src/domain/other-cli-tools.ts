/* eslint-disable no-await-in-loop */
import fs from 'fs';
import { promisify } from 'util';
import { XMLParser } from 'fast-xml-parser';
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

    const offset: string = splittedLine.shift() as string;

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
  keyword: string,
  partitions: Partition[]
): Promise<KeywordFile[]> => {
  const result: KeywordFile[] = [];

  console.log(`Finding matches for keyword ${keyword}`);

  let stringsOutput: string = '';

  try {
    stringsOutput = await runCliTool(
      `strings -t d ${imagePath} | grep -i ${keyword}`
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

    // Partition not found.
    if (partitionContainingFile === null) {
      console.log(`Partition not found for match at offset ${match.offset}`);
      continue;
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
      console.log(`iNode not found for match at offset ${match.offset}`);
      continue;
    }

    console.log(`Found an iNode: ${fileiNode}`);

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

    if (fileInformationProcessed.deleted) {
      filePath.replace(/\*/g, '');
    }

    const hash = await getFileHashAsync(
      imagePath,
      partitionContainingFile,
      fileiNode,
      true
    );

    const resultFile: KeywordFile = {
      inode: fileiNode,
      deleted: fileInformationProcessed.deleted,
      fileAttributes: fileInformationProcessed.attributes,
      filePath,
      matchedKeywords: keyword,
      matches: match.matchedString,
      size: fileInformationProcessed.size,
      mtime: fileInformationProcessed.mtime,
      atime: fileInformationProcessed.atime,
      ctime: fileInformationProcessed.ctime,
      hash,
    };

    console.log(`Matched file found:`);
    console.log(resultFile);

    let fileAlreadyFound = false;

    for await (const file of result) {
      if (file.filePath === resultFile.filePath) {
        file.matchedKeywords += `, ${keyword}`;
        fileAlreadyFound = true;
        break;
      }
    }

    if (!fileAlreadyFound) {
      result.push(resultFile);
    }
  }

  console.log(`All matches for keyword ${keyword}: `);
  console.log(result);

  return result;
};

export const getFilesForAllKeywords = async (
  imagePath: string,
  searchString: string,
  partitions: Partition[]
): Promise<KeywordFile[]> => {
  let result: KeywordFile[] = [];

  const keywords = searchString.split(', ');

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
  filetype: string;
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
  const statAsync = promisify(fs.stat);
  await runCliTool(`rm -rf ./${FOLDER_NAME}.*`);

  for (let i = 1; i < startSectorList.length; i++) {
    await runCliTool(
      // automatic create FOLDER_NAME with index. (FOLDER_NAME.1)
      `photorec /d ${FOLDER_NAME} /cmd ${imagePath} wholespace,${i},options,paranoid,search `
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
      : [report.dfxml.fileobject].filter((file) => file !== undefined);
    // Get date type
    for (const file of files) {
      const carvedFilePath: string = `./${FOLDER_NAME}.1/${file.filename}`;
      try {
        const stats = await statAsync(carvedFilePath);
        const modifiedDate = stats.mtime;
        let filetype = await runCliTool(
          `file -b --extension ${carvedFilePath}`
        );
        if (filetype.trim() === '???' || filetype.trim() === null) {
          filetype = 'unknown';
        }
        results.push({
          filename: file.filename,
          size: file.filesize,
          sector: file.byte_runs.byte_run.xml_attributes.img_offset,
          filetype,
          modifiedDate:
            modifiedDate?.getTime() > now ? undefined : modifiedDate,
        });
      } catch (err: any) {
        console.error(`Error while getting file stats: ${err.message}`);
      }
    }
    await runCliTool(`rm -rf ./${FOLDER_NAME}.*`);
  }

  return results;
};
