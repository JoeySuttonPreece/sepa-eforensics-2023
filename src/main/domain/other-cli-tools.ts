function handleZIP(filePath: string): string {
  output = run('md5sum ' + filePath);
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

function getFileExtension(filePath: string): string {
  const regexDict: { [key: string]: RegExp } = {
    zip: /(\.zip$)/,
    e01: /(\.e01$)/,
    dd: /(\.dd$)/,
    lef: /(\.lef$)/,
    dmg: /(\.dmg$)/,
  };

  for (const [extensionName, extensionRegex] of Object.entries(regexDict)) {
    console.log(extensionName, extensionRegex);
    if (filePath.search(extensionRegex) !== -1) {
      return extensionName;
    }
  }

  throw Error('File type not supported!');
}

function tryGetMD5Hash(filePath: string): string {
  let output: string = '';

  const regex: RegExp = /(\.zip$)|(\.e01$)|(\.dd$)|(\.lef$)|(\.dmg$)/;

  if (filePath.search(regex) === -1) {
    throw new Error('File type not supported!');
  }

  switch (getFileExtension(filePath)) {
    case 'zip':
      output = handleZIP(filePath);
      break;
    case 'e01':
      output = handleE01(filePath);
      break;
    case 'dd':
      output = handleDD(filePath);
      break;
    case 'lef':
      output = handleLEF(filePath);
      break;
    case 'dmg':
      output = handleDMG(filePath);
      break;
    default:
      throw new Error('Unknown file extension!');
  }

  return output;
}

export default tryGetMD5Hash;
