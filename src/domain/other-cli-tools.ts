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
      startSectorList[i] * (sectorSizeByte - parseInt(byteOffsetOfString, 10));

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
  filedata: string;

  // will need to formatted properly later with split string and stuff
};

export const getCarvedFileAsync = async (
  imagePath: string
  startSectorList: number[]
): Promise<CarvedFile> => {

  const partionNumber = startSectorList.length;

for (let i = 1; i < partionNumber; i++) {
  await Promise.all([
    runCliTool(
      `photorec /d testFolder /cmd ${imagePath} wholespace,${i},fileopt,everything,enable,options,paranoid,search `
    )],

  const filenames: string = await runCliTool(`ls`);
  const const; fileNameArrayProper: string[]=filenames.split('\n')


  const index =fileNameArrayProper.indexOf("report.xml",0)
  if (index > -1){
    console.log(index)
    console.log(fileNameArrayProper.at(index))
    fileNameArrayProper.splice(index,1)
  }
//assuming no new line issue are in the array, we will need to loop through it



      console.log(filenames.split())

      runCliTool('yq -p=xml -o=json  report.xml>./carved.json'),



  for (let j = 0; j<fileNameArrayProper.length;j++)
  {
    ///const generateFileMetaData :string =
    runCliTool(
      `exiftool  ${fileNameArrayProper[j]} > tmpfile`,
    ),

    convertTextToJSON : json  =   runCliTool(
      'yq -o=json tmpfile`,
    ),

    const value: Key = Date/Time Original

    const arr = object.phaseExecutions.convertTextToJSON.map(item => item.value)

  }


///
///  json file =





    }


  )



    //loop exiftool every file except "report.xml"
    //filename, file size, original date, file type
    runCliTool(
      `cat ./testFolder.1/report.xml|grep -Poz '(<fileobject>)(.*\n)*.*(</fileobject>)'|tr '\000' ' '>>carvedfile.xml'`
    ),

    //incase save recovered files for report/client
    runCliTool(`rm -d -f testFolder.1`),
  ]);
};

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/carvedfile.xml', function(err: any, data: any) {
    parser.parseString(data, function (err: any, result: any) {
      fs.writeFile('carvedfile.json',result,(err:any) =>{
        if (err) throw err;
        console.log('The file has been saved!');
      });
    });
});

  const [filedata] = await Promise.all([
    // check the name of the file where the data was outputted
    (filedata = runCliTool(`cat testFolder/audit.txt `);),

    // remove the complied xml file after it was extracted
    runCliTool(`rm -f carvedfile.xml`),
  ]);
  return { filedata };

};

