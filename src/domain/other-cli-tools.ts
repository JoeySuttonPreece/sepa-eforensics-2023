import { number } from 'yargs';
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
  tmpfilename: string;
  tmpfilesize: string;
  tmpfilesector: string;
  tmpfilelength: string;
  tmpdate: string;
  tmpfiletype: string;
};

export type ArrayCarvedFile = {
  CarvedFileInstance: CarvedFile[];
};

function parser1(
  mainStringlist: string[],
  splitterStringStart: string,
  splitterStringEnd: string,
  position: number
): string[] {
  const fileFinalSanitisedArray: string[] = [];

  for (let k = 0; k < mainStringlist.length; k++) {
    const file: string[] = mainStringlist[k].split(splitterStringStart);
    file.shift(); /// to reomve the empty line created due to first slight of filename

    const filePrep: string[] = file[0].split(splitterStringEnd);
    fileFinalSanitisedArray.push(filePrep[position]);
  }

  return fileFinalSanitisedArray;
}

function parser2(
  mainStringlist: string,
  splitterStringStart: string,
  splitterStringEnd: string,
  position: number
): string {
  let fileFinalSanitised: string = '';

  const file: string[] = mainStringlist.split(splitterStringStart);
  file.shift(); /// to reomve the empty line created due to first slight of filename

  const filePrep: string[] = file[0].split(splitterStringEnd);
  fileFinalSanitised = filePrep[position];

  return fileFinalSanitised;
}

export const getCarvedFileAsync = async (
  imagePath: string,
  sectorSize: number,
  startSectorList: number[]
): Promise<ArrayCarvedFile> => {
  const partionNumber = startSectorList.length;
  const timenow = Date.now();
  let CarvedFileInstance: CarvedFile;
  const CarvedFileArray: Array<CarvedFile> = []; /// type will be carved file

  for (let i = 1; i < partionNumber; i++)
    runCliTool(
      // automatic create testFolder with index. (testFolder.1)
      `photorec /d testFolder /cmd ${imagePath} wholespace,${i},fileopt,everything,enable,options,paranoid,search `
    );

  const filename2: string = await runCliTool(`ls`);
  const fileNameArrayProper: string[] = filename2.split('\n');

  const index = fileNameArrayProper.indexOf('report.xml', 0);
  if (index > -1) {
    fileNameArrayProper.splice(index, 1);
  }
  // assuming no new line issue are in the array, we will need to loop through it
  const reportS: string = await runCliTool(
    `cat ./testFolder.1/report.xml|grep -Poz '(<fileobject>)(.*\n)*.*(</fileobject>)'|tr '\x00' ' '` // \000 ->\x00
  );

  const fileobjectStringLines: string[] = reportS.split('<fileobject>');

  fileobjectStringLines.shift(); /// to reomve the empty line created due to first slight of fileobj

  const filenameFinal: string[] = parser1(
    fileobjectStringLines,
    '<filename>',
    '</filename>',
    0
  );
  const filesizeFinal: string[] = parser1(
    fileobjectStringLines,
    '<filesize>',
    '</filesize>',
    0
  );
  const filesectorFinal: string[] = parser1(
    fileobjectStringLines,
    "<img_offset='>",
    "'",
    0
  );
  const fileLengthFinal: string[] = parser1(
    fileobjectStringLines,
    "len='",
    "'",
    0
  );

  const filedateFinal: string[] = [];
  const filetypeFinal: string[] = [];

  /// far future thoughts: functionality later on to convert length frombyte to sector by deviding 512 for general case .......sectorSize: number,
  /// far future thoughts: would need ot make all of them into ints or numbers before trying any cal stuff

  let tempfile: string;

  /// loop through the file names and run exifs on all of them
  filenameFinal.forEach(async (item) => {
    tempfile = await runCliTool(`exiftool ./testfolder.1/${item}`);

    let tempdate = parser2(
      tempfile,
      'Date/Time Original              : ',
      '/n',
      0
    );

    const convertDate = Date.parse(tempdate);
    if (convertDate > timenow) {
      tempdate = 'NaN';
      filedateFinal.push(tempdate);
    } else {
      filedateFinal.push(tempdate);
    }
    filetypeFinal.push(parser2(tempfile, 'File Type              : ', '/n', 0));
  });

  for (let i = 0; i < filenameFinal.length; i++) {
    const tmpfilename = filenameFinal[i];
    const tmpfilesize = filesizeFinal[i];
    const tmpfilesector = filesectorFinal[i];
    const tmpfilelength = fileLengthFinal[i];
    const tmpdate = filedateFinal[i];
    const tmpfiletype = filetypeFinal[i];

    CarvedFileInstance = {
      tmpfilename,
      tmpfilesize,
      tmpfilesector,
      tmpfilelength,
      tmpdate,
      tmpfiletype,
    };

    CarvedFileArray.push(CarvedFileInstance);
  }

  return CarvedFileArray;
};

/// just doublecheck whether we would need to say it as filenamefinal or if we can directly call it as item

/// now create the carved file objects using the 4 arrays and convert_datearray creating carved file objects that contains nthelement values from each values from the array
// store them into carved file array
// throw it back to orchestrator
/// would need to create switch case for this to consider all the other cases

//   })

//     }

//   }

// //test value
//   //loop exiftool every file except "report.xml"
//   //filename, file size, original date, file type
//   runCliTool(
//     >>carvedfile.xml'`
//   ),

//   //incase save recovered files for report/client
//   runCliTool(`rm -d -f testFolder.*`),

//   return { filedata }

//   ///this will be thown back to orchestrator---not done yet....will focuso on it on thursday

// }
