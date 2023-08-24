import { RenamedFile, File } from "domain/file-system-tools";
import { ReportDetails } from "domain/orchestrator";
import { PartitionTable } from "domain/volume-system-tools";
import fs from "fs";
import path from "path";
type KeywordFile = any; //to be replaced with proper imort
type Writer = (data: string, section: string) => void;

export const OutputParser = (output: ReportDetails, destination: string) => {
    let writer = (data: string, section: string) => {
        if(destination == 'stdout'){
            process.stdout.write(data);
        } else {
            let filename = path.join(destination, `aeas-${section}.csv`)
            fs.appendFileSync(filename, data);
        }
    }

    formatImageDetails(output, writer);
    if(output.partitionTable) formatPartitionDetails(output.partitionTable, writer);
    if(output.keywordFiles) formatKeywordFile(output.keywordFiles, writer)
    if(output.renamedFiles) formatRenamedFile(output.renamedFiles, writer);
    if(output.deletedFiles) formatDeletedFile(output.deletedFiles, writer);
}

function formatImageDetails({imageHash, imageName} : ReportDetails, writer: Writer ) {
    const section = 'image-details';
    writer(`ImageName, ImageHash, FinalImageHash\n`, section);
    writer(`'${imageName}', ${imageHash},''\n`, section);
}

function formatPartitionDetails(partitionTable: PartitionTable, writer:Writer) {
    const section = 'partitions';
    writer(`TableType, SectorSize, Description, Start, Length, End\n`, section);
    for(let partition of partitionTable.partitions) {
        writer(`'${partitionTable.tableType}',${partitionTable.sectorSize},'${partition.description}',${partition.start},${partition.length},${partition.end}\n`, section)
    }
}

function formatRenamedFile(renamedFiles: RenamedFile[], writer:Writer) {
    const section = 'renamed-files';
    writer(`Inode,Filename,True Extension, Size, Modified, Accessed, Created, Hash\n`, section);
    for(let renamed of renamedFiles) {
        let extensions = renamed.trueExtensions.join(' ');
        writer(`${renamed.file.inode}, '${renamed.file.fileName}', ${extensions},${renamed.file.size},${renamed.file.mtime},${renamed.file.atime},${renamed.file.ctime},${renamed.file.hash}\n`, section)
    }
}

function formatDeletedFile(deletedFiles: File[], writer:Writer) {
    const section = 'deleted-files';
    writer(`Inode,Filename, Size, Modified, Accessed, Created, Hash\n`, section);
    for(let deleted of deletedFiles) {
        writer(`${deleted.inode}, '${deleted.fileName}',${deleted.size},${deleted.mtime},${deleted.atime},${deleted.ctime},${deleted.hash}\n`, section)
    }
}

function formatKeywordFile(keywordFiles: KeywordFile[], writer:Writer) {
    const section = 'keyword-match-files';
    writer(`Inode,Filename,Matches, Size, Modified, Accessed, Created, Hash\n`, section);
    for(let keyword of keywordFiles) {
        let matches = keyword.matches.join(':');
        writer(`${keyword.file.inode}, '${keyword.file.fileName}', ${matches},${keyword.file.size},${keyword.file.mtime},${keyword.file.atime},${keyword.file.ctime},${keyword.file.hash}\n`, section)
    }
}