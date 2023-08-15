import { runCliTool } from './runner';

export const listFiles = async (volume: string, offset: number) => {
  // TODO: parse text output into object
  return runCliTool(`fls ${volume} -o ${offset}`);
};

//https://wiki.sleuthkit.org/index.php?title=Fls
//LONG FORMAT!!!
export type File = {
  //x/y in output, these can be different for deleted files, cant come up with a better name
  fileNameFileType: string;
  metadataFileType: string;
  deleted: bool;
  inode: string;
  reallocated: bool;
  //THIS IS THE ACTUAL FILE NAME
  fileName: string;
  //maybe parse these to dates? help with timeline or something
  mtime: string;
  atime: string;
  ctime: string;
  crtime: string;
  size: int;
  uid: string;
  gid: string;
};

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

const getRenamedFile = async (file): Promise<RenamedFile[]> => {
  let renamedFiles = [];
  for (let file of fileList) {
    //get header
    let header = 0xff4fff5143453464363n; //from function
    let extensions = getExtensionFromHeader(header);
    let match = false;
    for (let ext of extensions) {
      if (ext == file.ext) {
        match = true;
        break;
      }
    }

    if (match) continue;

    renamedFiles.push({ file, true_ext: extensions.join(',') });
  }

  return renamedFiles;
};

const SIGNATURES = [
  { sig: 0x50575333, ext: ['psafe3'] },
  { sig: 0xd4c3b2a1, ext: ['pcap'] },
  { sig: 0xa1b2c3d4, ext: ['pcap'] },
  { sig: 0x4d3cb2a1, ext: ['pcap'] },
  { sig: 0xa1b23c4d, ext: ['pcap'] },
  { sig: 0x0a0d0d0a, ext: ['pcapng'] },
  { sig: 0xedabeedb, ext: ['rpm'] },
  {
    sig: 0x53514c69746520666f726d6174203300n,
    ext: ['sqlitedb', 'sqlite', 'db'],
  },
  { sig: 0x53503031, ext: ['bin'] },
  { sig: 0x49574144, ext: ['wad'] },
  { sig: 0x00000100, ext: ['ico'] },
  { sig: 0x69636e73, ext: ['icns'] },
  { sig: 0x667479703367, ext: ['3gp', '3g2'] },
  { sig: 0x1f9d, ext: ['tar.z', 'z'] },
  { sig: 0x1fa0, ext: ['tar.z', 'z'] },
  { sig: 0x2d686c302d, ext: ['lzh'] },
  { sig: 0x2d686c352d, ext: ['lzh'] },
  { sig: 0x425a68, ext: ['bz2'] },
  { sig: 0x47494638376147494638396n, ext: ['gif'] },
  { sig: 0x425047fb, ext: ['bpg'] },
  { sig: 0xffd8ffe0, ext: ['jpg', 'jpeg'] },
  { sig: 0xffd8ffee, ext: ['jpg', 'jpeg'] },
  {
    sig: 0x0000000c6a5020200d0a870an,
    ext: ['jp2', 'j2k', 'jpf', 'jpm', 'jpg2', 'j2c', 'jpc', 'jpx', 'mj2'],
  },
  {
    sig: 0xff4fff51,
    ext: ['jp2', 'j2k', 'jpf', 'jpm', 'jpg2', 'j2c', 'jpc', 'jpx', 'mj2'],
  },
  { sig: 0x4c5a4950, ext: ['lz'] },
  { sig: 0x303730373037, ext: ['cpio'] },
  {
    sig: 0x4d5a,
    ext: [
      'exe',
      'dll',
      'mui',
      'sys',
      'scr',
      'cpl',
      'ocx',
      'ax',
      'iec',
      'iec',
      'ime',
      'rs',
      'tsp',
      'fon',
      'efi',
    ],
  },
  { sig: 0x5a4d, ext: ['exe'] },
  {
    sig: 0x504b0304504b0506n,
    ext: [
      'zip',
      'aar',
      'apk',
      'docx',
      'epub',
      'ipa',
      'jar',
      'kmz',
      'maff',
      'msix',
      'odp',
      'ods',
      'odt',
      'pk3',
      'pk4',
      'pptx',
      'usdz',
      'vsdx',
      'xlsx',
      'xpi',
    ],
  },
  {
    sig: 0x504b070,
    ext: [
      'zip',
      'aar',
      'apk',
      'docx',
      'epub',
      'ipa',
      'jar',
      'kmz',
      'maff',
      'msix',
      'odp',
      'ods',
      'odt',
      'pk3',
      'pk4',
      'pptx',
      'usdz',
      'vsdx',
      'xlsx',
      'xpi',
    ],
  },
  { sig: 0x526172211a0700n, ext: ['rar'] },
  { sig: 0x526172211a070100n, ext: ['rar'] },
  { sig: 0x89504e470d0a1a0an, ext: ['png'] },
  { sig: 0xc9, ext: ['com'] },
  { sig: 0xcafebabe, ext: ['class'] },
  { sig: 0xefbbbf, ext: ['txt'] },
  { sig: 0xfffe, ext: ['txt'] },
  { sig: 0xfeff, ext: ['txt'] },
  { sig: 0xfffe0000, ext: ['txt'] },
  { sig: 0x0000feff, ext: ['txt'] },
  { sig: 0x0efeff, ext: ['txt'] },
  { sig: 0x255044462d, ext: ['pdf'] },
  { sig: 0x38425053, ext: ['psd'] },
  { sig: 0x424d, ext: ['bmp'] },
  { sig: 0xfffb, ext: ['mp3'] },
  { sig: 0xfff3, ext: ['mp3'] },
  { sig: 0xfff2, ext: ['mp3'] },
  { sig: 0x494433, ext: ['mp3'] },
  { sig: 0x4344303031, ext: ['iso'] },
  { sig: 0x4344303031, ext: ['cdi'] },
  { sig: 0xd0cf11e0a1b11ae1n, ext: ['doc', 'xls', 'ppt', 'msi', 'msg'] },
  { sig: 0x7573746172003030n, ext: ['tar'] },
  { sig: 0x7573746172202000n, ext: ['tar'] },
  { sig: 0x377abcaf271c, ext: ['7z'] },
  { sig: 0x1f8b, ext: ['gz', 'tar.gz'] },
  { sig: 0xfd377a585a00, ext: ['xz', 'tar.xz'] },
  { sig: 0x7b5c72746631, ext: ['rtf'] },
  { sig: 0x6674797069736f6dn, ext: ['mp4'] },
  { sig: 0x52656365697665643an, ext: ['eml'] },
];

const getExtensionFromHeader = (header: bigint | number): string[] => {
  if (typeof header == 'number') header = BigInt(header);
  for (let sig_ext of SIGNATURES) {
    let hexValuesInSignature = sig_ext.sig.toString(16).length; // can't do following cos bigints -> Math.ceil((Math.log2(sig_ext.sig)/4));
    // gets a mask if all ones that is the exact length of signature being checked.
    const mask = BigInt((1 << (hexValuesInSignature * 4)) - 1);

    if ((header & mask) == sig_ext.sig) {
      return sig_ext.ext;
    }
  }

  return [''];
};
