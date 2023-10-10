/* eslint-disable no-param-reassign */
/* eslint-disable new-cap */
/* eslint-disable no-use-before-define */
import fs from 'fs';
import path from 'path';
import jsPDF from 'jspdf';
import { applyPlugin, UserOptions } from 'jspdf-autotable';
import { RenamedFile, File, KeywordFile } from 'domain/file-system-tools';
import { ReportDetails } from 'domain/orchestrator';
import { PartitionTable } from 'domain/volume-system-tools';
import { TimelineEntry } from 'domain/timeline-tools';
import { CarvedFile } from 'domain/other-cli-tools';

applyPlugin(jsPDF);

type PDF = jsPDF & {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: { finalY: number };
};

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
    if (output.carvedFiles) csvCarvedFile(output.carvedFiles, writer);
    if (output.timeline) csvTimeline(output.timeline, writer);
  } else if (format === 'json') {
    writer(JSON.stringify(output, null, 2), 'report');
  } else if (format === 'pdf') {
    pdfReport(output, writer);
  }
};

function pdfReport(output: ReportDetails, writer: Writer) {
  const doc = new jsPDF('p', 'mm', 'a4') as PDF; // a4 is 210mm
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
  if (output.carvedFiles) y = pdfCarvedFile(output.carvedFiles, doc, y);
  if (output.timeline) y = pdfTimeline(output.timeline, doc, y);
  const arrayBuffer = doc.output('arraybuffer');
  writer(Buffer.from(arrayBuffer), 'report');
}

function pdfImage(
  { imageHash, imageName, imageHashFinal, timezone }: ReportDetails,
  doc: PDF,
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
  doc.text(
    doc.splitTextToSize(
      `Image Hash Final (md5): ${imageHashFinal?.md5sum}`,
      200
    ),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.text(
    doc.splitTextToSize(
      `Image Hash Final (sha1): ${imageHashFinal?.sha1sum}`,
      200
    ),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.text(
    doc.splitTextToSize(
      `Integrity: ${
        imageHashFinal?.md5sum === imageHash?.md5sum ? 'Passed' : 'Failed'
      } `,
      200
    ),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.text(
    doc.splitTextToSize(`Timezone: ${timezone ?? 'Could not Determine'} `, 200),
    10,
    height
  );
  height += doc.getLineHeight();
  doc.setFontSize(14);
  return height;
}

function pdfPartition(
  partitionTable: PartitionTable,
  doc: PDF,
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

function pdfDeletedFile(deletedFiles: File[], doc: PDF, y: number): number {
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
      deleted.mtime.toLocaleString(),
      deleted.atime.toLocaleString(),
      deleted.ctime.toLocaleString(),
      deleted.hash.sha1sum,
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
  }
  doc.text('No Deleted Files Found', 50, height);
  return height + doc.getLineHeight();
}

function pdfRenamedFile(
  renamedFiles: RenamedFile[],
  doc: PDF,
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
      renamed.file.mtime.toLocaleString(),
      renamed.file.atime.toLocaleString(),
      renamed.file.ctime.toLocaleString(),
      renamed.file.hash.sha1sum,
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
  }
  doc.text('No Renamed Files Found', 50, height);
  return height + doc.getLineHeight();
}

function pdfKeywordFile(
  keywordFiles: KeywordFile[],
  doc: PDF,
  y: number
): number {
  let height = y;
  const section = 'Keyword Files';
  const keywordBody: string[][] = [];
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();
  for (const keyword of keywordFiles) {
    keywordBody.push([
      keyword.inode,
      keyword.filePath,
      keyword.matches,
      `${keyword.size}`,
      keyword.mtime,
      keyword.atime,
      keyword.ctime,
      keyword.hash.sha1sum,
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
  }
  doc.text('No Keyword Files Found', 50, height);
  return height + doc.getLineHeight();
}

function pdfCarvedFile(carvedFiles: CarvedFile[], doc: PDF, y: number): number {
  let height = y;
  const section = 'Carved Files';
  const deletedBody: string[][] = [];
  doc.text(section, 105 - doc.getTextWidth(section) / 2, height);
  height += doc.getLineHeight();
  for (const carved of carvedFiles) {
    deletedBody.push([
      carved.filename,
      `${carved.size}`,
      `${carved.sector}`,
      carved.modifiedDate?.toLocaleString() ?? '',
      carved.filetype ?? '',
    ]);
  }
  if (deletedBody.length > 0) {
    doc.autoTable({
      head: [['Filename', 'Size', 'Sector', 'Modified', 'Filetype']],
      body: deletedBody,
      startY: height,
    });
    return doc.lastAutoTable.finalY + doc.getLineHeight();
  }
  doc.text('No Deleted Files Found', 50, height);
  return height + doc.getLineHeight();
}

function pdfTimeline(timeline: TimelineEntry[], doc: PDF, y: number): number {
  const section = 'Timeline';
  doc.text(section, 105 - doc.getTextWidth(section) / 2, y);
  y += doc.getLineHeight();
  doc.setFontSize(9);
  const details = 'date - inode - filename - user - operations';
  doc.text(details, 105 - doc.getTextWidth(details) / 2, y);
  y += doc.getLineHeight();
  const start = y;
  for (const entry of timeline) {
    doc.circle(27, y, 1);
    doc.text(doc.splitTextToSize(entry.date.toLocaleString(), 20), 5, y);
    doc.text(doc.splitTextToSize(`${entry.file.inode}`, 15), 35, y);
    doc.text(doc.splitTextToSize(entry.file.fileName, 50), 50, y);

    if (entry.suspectedUsers.length === 0) {
      y += doc.getLineHeight();
    }

    for (const user of entry.suspectedUsers) {
      if (entry.operations.length === 0) {
        doc.text(doc.splitTextToSize(user.name, 20), 105, y);
        y += doc.getLineHeight();
      }

      for (const op of entry.operations) {
        if (op.user.name === user.name) {
          doc.text(doc.splitTextToSize(user.name, 25), 105, y);
          doc.text(doc.splitTextToSize(op.command, 70), 130, y);
          y += doc.getLineHeight();
        }
      }
    }
    doc.line(30, y - doc.getLineHeight() / 2, 200, y - doc.getLineHeight() / 2);
  }
  doc.line(27, start, 27, y);
  doc.setFontSize(14);
  return y;
}

function csvImage(
  { imageHash, imageName, timezone, imageHashFinal }: ReportDetails,
  writer: Writer
) {
  const section = 'image-details';
  writer(
    `ImageName,Timezone, ImageHash (md5), ImageHash (sha1), FinalImageHash(md5), FinalImageHash{sha1}, Integrity Passed\n`,
    section
  );
  writer(
    `'${imageName}',${timezone}, ${imageHash?.md5sum}, ${imageHash?.sha1sum},${
      imageHashFinal?.md5sum
    }, ${imageHashFinal?.sha1sum}, ${
      imageHash?.md5sum === imageHashFinal?.md5sum
    } ''\n`,
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
      `${renamed.file.inode}, '${renamed.file.fileName}', ${extensions},${renamed.file.size},${renamed.file.mtime},${renamed.file.atime},${renamed.file.ctime},${renamed.file.hash.sha1sum}\n`,
      section
    );
  }
}

function csvDeletedFile(deletedFiles: File[], writer: Writer) {
  const section = 'deleted-files';
  writer(`Inode,Filename, Size, Modified, Accessed, Created, Hash\n`, section);
  for (const deleted of deletedFiles) {
    writer(
      `${deleted.inode}, '${deleted.fileName}',${deleted.size},${deleted.mtime},${deleted.atime},${deleted.ctime},${deleted.hash.sha1sum}\n`,
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
    const { matches } = keyword;
    writer(
      `${keyword.inode}, '${keyword.filePath}', ${matches},${keyword.size},${keyword.mtime},${keyword.atime},${keyword.ctime},${keyword.hash.sha1sum}\n`,
      section
    );
  }
}

function csvCarvedFile(carvedFiles: CarvedFile[], writer: Writer) {
  const section = 'carved-files';
  writer(`Filename,Size,Sector,Modified Date,Filetype\n`, section);
  for (const carved of carvedFiles) {
    writer(
      `${carved.filename}, '${carved.size}',${
        carved.sector
      },${carved.modifiedDate?.toLocaleString()},${carved.filetype}\n`,
      section
    );
  }
}

function csvTimeline(timeline: TimelineEntry[], writer: Writer) {
  const section = 'timeline';
  writer(
    `Modified Date, Inode, Filename, Suspected User, Operation\n`,
    section
  );
  for (const entry of timeline) {
    if (entry.suspectedUsers.length === 0) {
      writer(
        `${entry.date}, ${entry.file.inode}, ${entry.file.fileName}, none, none`,
        section
      );
    }
    for (const user of entry.suspectedUsers) {
      if (entry.operations.length === 0) {
        writer(
          `${entry.date}, ${entry.file.inode}, ${entry.file.fileName}, ${user.name}, none`,
          section
        );
      }

      for (const op of entry.operations) {
        if (op.user.name === user.name) {
          writer(
            `${entry.date}, ${entry.file.inode}, ${entry.file.fileName}, ${user.name}, ${op.command}`,
            section
          );
        }
      }
    }
  }
}
