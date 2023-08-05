function handleZIP(filePath: string): string {
  return '';
}

function handleE01(filePath: string): string {
  return '';
}

function handleDD(filePath: string): string {
  return '';
}

function handleLEF(filePath: string): string {
  return '';
}

function handleDMG(filePath: string): string {
  return '';
}

function tryGetMD5Hash(filePath: string): string {
  let output: string = '';

  const regex: RegExp = /(\.zip$)|(\.e01$)|(\.dd$)|(\.lef$)|(\.dmg$)/;

  if (filePath.search(regex) === -1) {
    throw new Error('File type not supported!');
  }

  const fileExtension: string = filePath.slice(-4);

  switch (fileExtension) {
    case '.zip':
      output = handleZIP(filePath);
      break;
    case '.e01':
      output = handleE01(filePath);
      break;
    case '.dd':
      // TODO: Due to slice(-4), this case won't be picked up
      // without some kind of '*.dd' syntax - fix needed.
      output = handleDD(filePath);
      break;
    case '.lef':
      output = handleLEF(filePath);
      break;
    case '.dmg':
      output = handleDMG(filePath);
      break;
    default:
      throw new Error('Unknown file extension!');
  }

  return output;
}

export default tryGetMD5Hash;
