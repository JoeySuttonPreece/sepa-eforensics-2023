import { runCliTool } from './runner';
import { Partition } from './volume-system-tools';

export const listFiles = async (volume: string, offset: number) => {
  // TODO: parse text output into object
  return runCliTool(`fls ${volume} -o ${offset}`);
};

// https://wiki.sleuthkit.org/index.php?title=Fls
// LONG FORMAT!!!
export type File = {
  // x/y in output, these can be different for deleted files, cant come up with a better name
  fileNameFileType: string;
  metadataFileType: string;
  deleted: boolean;
  inode: string;
  reallocated: boolean;
  // THIS IS THE ACTUAL FILE NAME
  fileName: string;
  // maybe parse these to dates? help with timeline or something
  mtime: Date;
  atime: Date;
  ctime: Date;
  crtime: string;
  size: number;
  uid: string;
  gid: string;

  hash: string;
};

export type RenamedFile = {
  file: File;
  matchedSignature: string;
  trueExtensions: string[];
};

export type KeywordFile = {
  file: File;
  matches: string[];
};

// listfiles(){
//   foreach -> Line
// file : processFILe(line),
// content = getContent()
// renamedObject
//  getRenamedFile(File, content, renamedObject)
//   ifgetDeltedFile(line)

// runCliTool(callbakcs)

// reutrn renamed
//  }

/// / ---------------------------- Renamed Processing ---------------------------------------------

const SIGNATURES = [
  { sig: '50575333', ext: ['psafe3'] },
  { sig: 'd4c3b2a1', ext: ['pcap'] },
  { sig: 'a1b2c3d4', ext: ['pcap'] },
  { sig: '4d3cb2a1', ext: ['pcap'] },
  { sig: 'a1b23c4d', ext: ['pcap'] },
  { sig: '0a0d0d0a', ext: ['pcapng'] },
  { sig: 'edabeedb', ext: ['rpm'] },
  {
    sig: '53514c69746520666f726d6174203300',
    ext: ['sqlitedb', 'sqlite', 'db'],
  },
  { sig: '53503031', ext: ['bin'] },
  { sig: '49574144', ext: ['wad'] },
  { sig: '00000100', ext: ['ico'] },
  { sig: '69636e73', ext: ['icns'] },
  { sig: '667479703367', ext: ['3gp', '3g2'] },
  { sig: '1f9d', ext: ['tar.z', 'z'] },
  { sig: '1fa0', ext: ['tar.z', 'z'] },
  { sig: '2d686c302d', ext: ['lzh'] },
  { sig: '2d686c352d', ext: ['lzh'] },
  { sig: '425a68', ext: ['bz2'] },
  { sig: '47494638376147494638396', ext: ['gif'] },
  { sig: '425047fb', ext: ['bpg'] },
  { sig: 'ffd8ffe0', ext: ['jpg', 'jpeg'] },
  { sig: 'ffd8ffee', ext: ['jpg', 'jpeg'] },
  {
    sig: '0000000c6a5020200d0a870a',
    ext: ['jp2', 'j2k', 'jpf', 'jpm', 'jpg2', 'j2c', 'jpc', 'jpx', 'mj2'],
  },
  {
    sig: 'ff4fff51',
    ext: ['jp2', 'j2k', 'jpf', 'jpm', 'jpg2', 'j2c', 'jpc', 'jpx', 'mj2'],
  },
  { sig: '4c5a4950', ext: ['lz'] },
  { sig: '303730373037', ext: ['cpio'] },
  {
    sig: '4d5a',
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
  { sig: '5a4d', ext: ['exe'] },
  {
    sig: '504b0304504b0506',
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
    sig: '504b070',
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
  { sig: '526172211a0700', ext: ['rar'] },
  { sig: '526172211a070100', ext: ['rar'] },
  { sig: '89504e470d0a1a0a', ext: ['png'] },
  { sig: 'c9', ext: ['com'] },
  { sig: 'cafebabe', ext: ['class'] },
  { sig: 'efbbbf', ext: ['txt'] },
  { sig: 'fffe', ext: ['txt'] },
  { sig: 'feff', ext: ['txt'] },
  { sig: 'fffe0000', ext: ['txt'] },
  { sig: '0000feff', ext: ['txt'] },
  { sig: '0efeff', ext: ['txt'] },
  { sig: '255044462d', ext: ['pdf'] },
  { sig: '38425053', ext: ['psd'] },
  { sig: '424d', ext: ['bmp'] },
  { sig: 'fffb', ext: ['mp3'] },
  { sig: 'fff3', ext: ['mp3'] },
  { sig: 'fff2', ext: ['mp3'] },
  { sig: '494433', ext: ['mp3'] },
  { sig: '4344303031', ext: ['iso'] },
  { sig: '4344303031', ext: ['cdi'] },
  { sig: 'd0cf11e0a1b11ae1', ext: ['doc', 'xls', 'ppt', 'msi', 'msg'] },
  { sig: '7573746172003030', ext: ['tar'] },
  { sig: '7573746172202000', ext: ['tar'] },
  { sig: '377abcaf271c', ext: ['7z'] },
  { sig: '1f8b', ext: ['gz', 'tar.gz'] },
  { sig: 'fd377a585a00', ext: ['xz', 'tar.xz'] },
  { sig: '7b5c72746631', ext: ['rtf'] },
  { sig: '6674797069736f6d', ext: ['mp4'] },
  { sig: '52656365697665643a', ext: ['eml'] },
];

const matchSignature = (
  header: string
): { result: boolean; extensions: string[]; match: string } => {
  for (const sigExt of SIGNATURES) {
    if (header.includes(sigExt.sig))
      return { result: true, extensions: sigExt.ext, match: sigExt.sig };
  }

  return { result: false, extensions: [''], match: '' };
};

// imagePath: path to the image being investigated
// partition: the partition that the file is located in
// file: file to be investigated
///
export const processForRenamedFile = async (
  file: File,
  imagePath: string,
  partition: Partition
): Promise<RenamedFile | false> => {
  const HEADERBYTES = 16;
  const header = await runCliTool(
    `icat -o ${partition.start} ${imagePath} ${file.inode} | xxd -l ${HEADERBYTES}  --plain`
  );
  const match = matchSignature(header);

  if (!match.result) return false;

  const splitFileName = file.fileName.split('.');
  const suspectExtension = splitFileName[splitFileName.length - 1];

  if (match.extensions.includes(suspectExtension)) return false;

  return {
    file,
    matchedSignature: match.match,
    trueExtensions: match.extensions,
  };
};
