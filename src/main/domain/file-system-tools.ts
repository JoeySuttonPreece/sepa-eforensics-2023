import { ipcMain } from 'electron';
import { runCliTool, runFileSystemTool } from './runner'
import { Linter } from 'eslint';

//https://wiki.sleuthkit.org/index.php?title=Fls
//LONG FORMAT!!!
type File = {
  //x/y in output, these can be different for deleted files, cant come up with a better name
  fileNameFileType: string,
  metadataFileType: string,
  deleted: bool,
  inode: string,
  reallocated: bool,
  //THIS IS THE ACTUAL FILE NAME
  fileName: string,
  //maybe parse these to dates? help with timeline or something
  mtime: string,
  atime: string,
  ctime: string,
  crtime: string,
  size: int,
  uid: string,
  gid: string
}

//This may (also) become legacy
ipcMain.on('file-name:listFiles', async (event, arg) => {
  runFileSystemTool(`fls ${arg[0]} -o ${arg[1]}`, async (matrix) => {
    console.log(matrix);
    event.reply('file-name:listFiles', matrix);
  });
});






// /// Retrieve file header
// const getFileHeader = async (filecontent: string) : number => {
//   const HEADERBYTES = 16; // this determines the number of Headerbytes we will retrieve.
  



  
// }


// listfiles(){
//   foreach -> Line
// file : processFILe(line),
// content = getContent()
// renamedObject
//  getRenamedFile(File, content, renamedObject)
//   ifgetDeltedFile(line)

//runCliTool(callbakcs)

//reutrn renamed
//  }

const getRenamedFile = async (file) : Promise<RenamedFile[]> => {
  
  let renamedFiles = [];
  for(let file of fileList) {
    //get header
    let header = 0xFF4FFF5143453464363n; //from function
    let extensions = getExtensionFromHeader(header);
    let match = false;
    for(let ext of extensions) {
      if(ext == file.ext) {
        match = true;
        break;
      }
    }

    if(match) continue;

    renamedFiles.push({file, true_ext: extensions.join(",")})


  }


  return renamedFiles;
}

const SIGNATURES = [
  {sig: 0x50575333, ext: ["psafe3"]},
  {sig: 0xD4C3B2A1, ext: ["pcap"]},
  {sig: 0xA1B2C3D4, ext: ["pcap"]},
  {sig: 0x4D3CB2A1, ext: ["pcap"]},
  {sig: 0xA1B23C4D, ext: ["pcap"]},
  {sig: 0x0A0D0D0A, ext: ["pcapng"]},
  {sig: 0xEDABEEDB, ext: ["rpm"]},
  {sig: 0x53514C69746520666F726D6174203300n, ext: ["sqlitedb", "sqlite", "db"]},
  {sig: 0x53503031, ext: ["bin"]},
  {sig: 0x49574144, ext: ["wad"]},
  {sig: 0x00000100, ext: ["ico"]},
  {sig: 0x69636e73, ext: ["icns"]},
  {sig: 0x667479703367, ext: ["3gp", "3g2"]},
  {sig: 0x1F9D, ext: ["tar.z", "z"]},
  {sig: 0x1FA0, ext: ["tar.z", "z"]},
  {sig: 0x2D686C302D, ext: ["lzh"]},
  {sig: 0x2D686C352D, ext: ["lzh"]},
  {sig: 0x425A68, ext: ["bz2"]},
  {sig: 0x47494638376147494638396n, ext: ["gif"]},
  {sig: 0x425047FB, ext: ["bpg"]},
  {sig: 0xFFD8FFE0, ext: ["jpg", "jpeg"]},
  {sig: 0xFFD8FFEE, ext: ["jpg", "jpeg"]},
  {sig: 0x0000000C6A5020200D0A870An, ext: ["jp2", "j2k", "jpf", "jpm", "jpg2", "j2c", "jpc", "jpx", "mj2"]},
  {sig: 0xFF4FFF51, ext: ["jp2", "j2k", "jpf", "jpm", "jpg2", "j2c", "jpc", "jpx", "mj2"]},
  {sig: 0x4C5A4950, ext: ["lz"]},
  {sig: 0x303730373037, ext: ["cpio"]},
  {sig: 0x4D5A, ext: ["exe", "dll", "mui", "sys", "scr", "cpl", "ocx", "ax", "iec", "iec", "ime", "rs", "tsp", "fon", "efi"]},
  {sig: 0x5A4D, ext: ["exe"]},
  {sig: 0x504B0304504B0506n, ext: ["zip", "aar", "apk", "docx", "epub", "ipa", "jar", "kmz", "maff", "msix", "odp", "ods", "odt", "pk3", "pk4", "pptx", "usdz", "vsdx", "xlsx", "xpi"]},
  {sig: 0x504B070, ext: ["zip", "aar", "apk", "docx", "epub", "ipa", "jar", "kmz", "maff", "msix", "odp", "ods", "odt", "pk3", "pk4", "pptx", "usdz", "vsdx", "xlsx", "xpi"]},
  {sig: 0x526172211A0700n, ext: ["rar"]},
  {sig: 0x526172211A070100n, ext: ["rar"]},
  {sig: 0x89504E470D0A1A0An, ext: ["png"]},
  {sig: 0xC9, ext: ["com"]},
  {sig: 0xCAFEBABE, ext: ["class"]},
  {sig: 0xEFBBBF, ext: ["txt"]},
  {sig: 0xFFFE, ext: ["txt"]},
  {sig: 0xFEFF, ext: ["txt"]},
  {sig: 0xFFFE0000, ext: ["txt"]},
  {sig: 0x0000FEFF, ext: ["txt"]},
  {sig: 0x0EFEFF, ext: ["txt"]},
  {sig: 0x255044462D, ext: ["pdf"]},
  {sig: 0x38425053, ext: ["psd"]},
  {sig: 0x424D, ext: ["bmp"]},
  {sig: 0xFFFB, ext: ["mp3"]},
  {sig: 0xFFF3, ext: ["mp3"]},
  {sig: 0xFFF2, ext: ["mp3"]},
  {sig: 0x494433, ext: ["mp3"]},
  {sig: 0x4344303031, ext: ["iso"]},
  {sig: 0x4344303031, ext: ["cdi"]},
  {sig: 0xD0CF11E0A1B11AE1n, ext: ["doc", "xls", "ppt", "msi", "msg"]},
  {sig: 0x7573746172003030n, ext: ["tar"]},
  {sig: 0x7573746172202000n, ext: ["tar"]},
  {sig: 0x377ABCAF271C, ext: ["7z"]},
  {sig: 0x1F8B, ext: ["gz", "tar.gz"]},
  {sig: 0xFD377A585A00, ext: ["xz", "tar.xz"]},
  {sig: 0x7B5C72746631, ext: ["rtf"]},
  {sig: 0x6674797069736F6Dn, ext: ["mp4"]},
  {sig: 0x52656365697665643An, ext: ["eml"]}  
];

const getExtensionFromHeader = (header: bigint | number) : string[] => {
  if(typeof(header) == "number") 
    header = BigInt(header);
  for(let sig_ext of SIGNATURES) {
    let hexValuesInSignature = sig_ext.sig.toString(16).length;// can't do following cos bigints -> Math.ceil((Math.log2(sig_ext.sig)/4));
    // gets a mask if all ones that is the exact length of signature being checked.
    const mask = BigInt((1 << (hexValuesInSignature * 4)) - 1);
     
    if((header & mask) == sig_ext.sig) {return sig_ext.ext;}

  }

  return [""];

}
