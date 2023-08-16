import '@testing-library/jest-dom';
import { processForRenamedFile, File } from '../../domain/file-system-tools';
import { Partition } from '../../domain/volume-system-tools';

jest.mock('../../domain/runner', () => {
    return {
    runCliTool: jest.fn(
        ).mockImplementationOnce( // header no signautre match
         async () => "aaaaaaaaaaaaaaaa"
        ).mockImplementationOnce ( //header signatuer match correct extension
         async () => "89504e470d0a1a0a0000000d49484452" //png
        ).mockImplementationOnce ( //header signature match mismatch extension
        async () =>"ffd8ffe000104a464946000101010048" //jpg
        )
    }
});

test("Renamed File Processing", async () => {
    let partition : Partition = {start: 63, end: 128, length: 128-63, description: ""}
    let file : File = {inode: "143", fileName: "user/images/renamed.png", fileNameFileType:"", metadataFileType: "", deleted:false, reallocated:false, crtime: "", atime: "", ctime: "", mtime: "", size:64, uid: "", gid: ""}
    
    let noMatchResult = await processForRenamedFile("path", partition, file)
    expect(noMatchResult).toBe(false);
    let correctExtensionResult = await processForRenamedFile("path", partition, file)
    expect(correctExtensionResult).toBe(false);
    let renamedResult = await processForRenamedFile("path", partition, file)
    if(renamedResult !== false) {
        expect(renamedResult.trueExtensions[0]).toBe('jpg');
        expect(renamedResult.matchedSignature).toBe("ffd8ffe0");
    }

})