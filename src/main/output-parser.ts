import fs from 'fs';
import path from 'path';
import { RenamedFile, File, KeywordFile } from 'domain/file-system-tools';
import { ReportDetails } from 'domain/orchestrator';
import { PartitionTable } from 'domain/volume-system-tools';
import jsPDF from 'jspdf';

type Writer = (data: string, section: string) => void;

export const PrintPDF = (arrayBuffer: ArrayBuffer, destination: string) => {
  let filename = path.join(destination, `aeas-report.pdf`);
  fs.writeFileSync(filename, Buffer.from(arrayBuffer));
};

// format can be stdout, csv, json
export const PrintText = (
  output: ReportDetails,
  format: string,
  destination: string
) => {
  const writer = (data: string, section: string) => {
    if (destination === 'stdout') {
      process.stdout.write(data);
    } else {
      const filename = path.join(destination, `aeas-${section}.${format}`);
      fs.appendFileSync(filename, data);
    }
  };

  if (format === 'csv') {
    formatImageDetails(output, writer);
    if (output.partitionTable)
      formatPartitionDetails(output.partitionTable, writer);
    if (output.keywordFiles) formatKeywordFile(output.keywordFiles, writer);
    if (output.renamedFiles) formatRenamedFile(output.renamedFiles, writer);
    if (output.deletedFiles) formatDeletedFile(output.deletedFiles, writer);
  } else if (format === 'json') {
    writer(JSON.stringify(output), 'report');
  }
};

function formatImageDetails(
  { imageHash, imageName }: ReportDetails,
  writer: Writer
) {
  const section = 'image-details';
  writer(`ImageName, ImageHash, FinalImageHash\n`, section);
  writer(`'${imageName}', ${imageHash},''\n`, section);
}

function formatPartitionDetails(
  partitionTable: PartitionTable,
  writer: Writer
) {
  const section = 'partitions';
  writer(`TableType, SectorSize, Description, Start, Length, End\n`, section);
  for (const partition of partitionTable.partitions) {
    writer(
      `'${partitionTable.tableType}',${partitionTable.sectorSize},'${partition.description}',${partition.start},${partition.length},${partition.end}\n`,
      section
    );
  }
}

function formatRenamedFile(renamedFiles: RenamedFile[], writer: Writer) {
  const section = 'renamed-files';
  writer(
    `Inode,Filename,True Extension, Size, Modified, Accessed, Created, Hash\n`,
    section
  );
  for (const renamed of renamedFiles) {
    const extensions = renamed.trueExtensions.join(' ');
    writer(
      `${renamed.file.inode}, '${renamed.file.fileName}', ${extensions},${renamed.file.size},${renamed.file.mtime},${renamed.file.atime},${renamed.file.ctime},${renamed.file.hash}\n`,
      section
    );
  }
}

function formatDeletedFile(deletedFiles: File[], writer: Writer) {
  const section = 'deleted-files';
  writer(`Inode,Filename, Size, Modified, Accessed, Created, Hash\n`, section);
  for (const deleted of deletedFiles) {
    writer(
      `${deleted.inode}, '${deleted.fileName}',${deleted.size},${deleted.mtime},${deleted.atime},${deleted.ctime},${deleted.hash}\n`,
      section
    );
  }
}

function formatKeywordFile(keywordFiles: KeywordFile[], writer: Writer) {
  const section = 'keyword-match-files';
  writer(
    `Inode,Filename,Matches, Size, Modified, Accessed, Created, Hash\n`,
    section
  );
  for (const keyword of keywordFiles) {
    const matches = keyword.matches.join(':');
    writer(
      `${keyword.file.inode}, '${keyword.file.fileName}', ${matches},${keyword.file.size},${keyword.file.mtime},${keyword.file.atime},${keyword.file.ctime},${keyword.file.hash}\n`,
      section
    );
  }
}
