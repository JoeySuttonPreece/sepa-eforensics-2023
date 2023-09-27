import fs from 'fs';
import path from 'path';
import { RenamedFile, File, KeywordFile } from 'domain/file-system-tools';
import { ReportDetails } from 'domain/orchestrator';
import { PartitionTable } from 'domain/volume-system-tools';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type Writer = (data: string | Buffer, section: string) => void;

// format can be stdout, csv, json, pdf
export const Print = (
  output: ReportDetails,
  format: string,
  destination: string
) => {
  const writer = (data: string | Buffer, section: string) => {
    if (destination === 'stdout') {
      process.stdout.write(data);
    } else {
      const filename = path.join(destination, `aeas-${section}.${format}`);
      if (format === 'csv') fs.appendFileSync(filename, data);
      else fs.writeFileSync(filename, data);
    }
  };

  if (format === 'csv') {
    csvImage(output, writer);
    if (output.partitionTable) csvPartition(output.partitionTable, writer);
    if (output.keywordFiles) csvKeywordFile(output.keywordFiles, writer);
    if (output.renamedFiles) csvRenamedFile(output.renamedFiles, writer);
    if (output.deletedFiles) csvDeletedFile(output.deletedFiles, writer);
  } else if (format === 'json') {
    writer(JSON.stringify(output), 'report');
  } else if (format === 'pdf') {
    pdfReport(output, writer);
  }
};

function pdfReport(output: ReportDetails, writer: Writer) {
  const doc = new jsPDF('p', 'mm', 'a4'); //a4 is 210mm
  doc.setFontSize(14);
  let y = 5;
  doc.setFontSize(20);
  const section = 'AEAS Generated Report';
  doc.text(section, 105 - doc.getTextWidth(section) / 2, y);
  y += doc.getLineHeight();
  doc.setFontSize(14);
  y = pdfImage(output, doc, y);
  if (output.partitionTable) y = pdfPartition(output.partitionTable, doc, y);
  if (output.deletedFiles) y = pdfDeletedFile(output.deletedFiles, doc, y);
  if (output.renamedFiles) y = pdfRenamedFile(output.renamedFiles, doc, y);
  if (output.keywordFiles) y = pdfKeywordFile(output.keywordFiles, doc, y);
  const arrayBuffer = doc.output('arraybuffer');
  writer(Buffer.from(arrayBuffer), 'report');
}

function pdfImage(
  { imageHash, imageName }: ReportDetails,
  doc: jsPDF,
  y: number
): number {
  let height = y;
  const section = 'Image Details';
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();

  doc.setFontSize(9);
  doc.text(doc.splitTextToSize(`Image Name: ${imageName}`, 200), 10, height);
  height += doc.getLineHeight();
  doc.text(
    doc.splitTextToSize(`Image Hash (md5): ${imageHash?.md5sum}`, 200),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.text(
    doc.splitTextToSize(`Image Hash (sha1): ${imageHash?.sha1sum}`, 200),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.text(doc.splitTextToSize(`Image Hash Final: `, 200), 10, height);
  height += doc.getLineHeight();
  doc.setFontSize(14);
  return height;
}

function pdfPartition(
  partitionTable: PartitionTable,
  doc: jsPDF,
  y: number
): number {
  let height = y;
  const section = 'Partition Details';
  const partitionBody: string[][] = [];
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();

  doc.setFontSize(9);
  doc.text(
    doc.splitTextToSize(
      `Table Type: ${partitionTable.tableType}, Sector Size: ${partitionTable.sectorSize}`,
      200
    ),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.setFontSize(14);
  for (const partition of partitionTable.partitions) {
    partitionBody.push([
      partition.description,
      `${partition.start}`,
      `${partition.length}`,
      `${partition.end}`,
    ]);
  }
  doc.autoTable({
    head: [['Description', 'Start', 'Length', 'End']],
    body: partitionBody,
    startY: height,
  });
  return doc.lastAutoTable.finalY + doc.getLineHeight();
}

function pdfDeletedFile(deletedFiles: File[], doc: jsPDF, y: number): number {
  let height = y;
  const section = 'Deleted Files';
  const deletedBody: string[][] = [];
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();
  for (const deleted of deletedFiles) {
    deletedBody.push([
      deleted.inode,
      deleted.fileName,
      `${deleted.size}`,
      deleted.mtime,
      deleted.atime,
      deleted.ctime,
      deleted.hash,
    ]);
  }
  if (deletedBody.length > 0) {
    doc.autoTable({
      head: [
        ['Inode', 'Filename', 'Size', 'Modified', 'Accessed', 'Create', 'Hash'],
      ],
      body: deletedBody,
      startY: height,
    });
    return doc.lastAutoTable.finalY + doc.getLineHeight();
  } else {
    doc.text('No Deleted Files Found', 50, height);
    return height + doc.getLineHeight();
  }
}

function pdfRenamedFile(
  renamedFiles: RenamedFile[],
  doc: jsPDF,
  y: number
): number {
  let height = y;
  const section = 'Renamed Files';
  const renamedBody: string[][] = [];
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();
  for (const renamed of renamedFiles) {
    renamedBody.push([
      renamed.file.inode,
      renamed.file.fileName,
      renamed.trueExtensions.join(','),
      `${renamed.file.size}`,
      renamed.file.mtime,
      renamed.file.atime,
      renamed.file.ctime,
      renamed.file.hash,
    ]);
  }

  if (renamedBody.length > 0) {
    doc.autoTable({
      head: [
        [
          'Inode',
          'Filename',
          'True Ext.',
          'Size',
          'Modified',
          'Accessed',
          'Create',
          'Hash',
        ],
      ],
      body: renamedBody,
      startY: height,
    });
    return doc.lastAutoTable.finalY + doc.getLineHeight();
  } else {
    doc.text('No Renamed Files Found', 50, height);
    return height + doc.getLineHeight();
  }
}

function pdfKeywordFile(
  keywordFiles: KeywordFile[],
  doc: jsPDF,
  y: number
): number {
  let height = y;
  const section = 'Keyword Files';
  const keywordBody: string[][] = [];
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();
  for (const keyword of keywordFiles) {
    keywordBody.push([
      keyword.file.inode,
      keyword.file.fileName,
      keyword.matches.join(','),
      `${keyword.file.size}`,
      keyword.file.mtime,
      keyword.file.atime,
      keyword.file.ctime,
      keyword.file.hash,
    ]);
  }
  if (keywordBody.length > 0) {
    doc.autoTable({
      head: [
        [
          'Inode',
          'Filename',
          'Matches',
          'Size',
          'Modified',
          'Accessed',
          'Create',
          'Hash',
        ],
      ],
      body: keywordBody,
      startY: height,
    });
    return doc.lastAutoTable.finalY + doc.getLineHeight();
  } else {
    doc.text('No Keyword Files Found', 50, height);
    return height + doc.getLineHeight();
  }
}

function csvImage({ imageHash, imageName }: ReportDetails, writer: Writer) {
  const section = 'image-details';
  writer(
    `ImageName, ImageHash (md5), ImageHash (sha1) FinalImageHash\n`,
    section
  );
  writer(
    `'${imageName}', ${imageHash.md5sum}, ${imageHash?.sha1sum},''\n`,
    section
  );
}

function csvPartition(partitionTable: PartitionTable, writer: Writer) {
  const section = 'partitions';
  writer(`TableType, SectorSize, Description, Start, Length, End\n`, section);
  for (const partition of partitionTable.partitions) {
    writer(
      `'${partitionTable.tableType}',${partitionTable.sectorSize},'${partition.description}',${partition.start},${partition.length},${partition.end}\n`,
      section
    );
  }
}

function csvRenamedFile(renamedFiles: RenamedFile[], writer: Writer) {
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

function csvDeletedFile(deletedFiles: File[], writer: Writer) {
  const section = 'deleted-files';
  writer(`Inode,Filename, Size, Modified, Accessed, Created, Hash\n`, section);
  for (const deleted of deletedFiles) {
    writer(
      `${deleted.inode}, '${deleted.fileName}',${deleted.size},${deleted.mtime},${deleted.atime},${deleted.ctime},${deleted.hash}\n`,
      section
    );
  }
}

function csvKeywordFile(keywordFiles: KeywordFile[], writer: Writer) {
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
