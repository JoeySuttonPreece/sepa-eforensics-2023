import { runCliTool } from './runner';

async function handleZIPAsync(filePath: string): Promise<string> {
  const output = await runCliTool(`md5sum ${filePath}`);
  return output.stdout;
}

async function handleE01Async(filePath: string): Promise<string> {
  const output = await runCliTool(`md5sum ${filePath}`);
  return output.stdout;
}

async function handleDDAsync(filePath: string): Promise<string> {
  const output = await runCliTool(`md5sum ${filePath}`);
  return output.stdout;
}

async function handleLEFAsync(filePath: string): Promise<string> {
  const output = await runCliTool(`md5sum ${filePath}`);
  return output.stdout;
}

async function handleDMGAsync(filePath: string): Promise<string> {
  const output = await runCliTool(`md5sum ${filePath}`);
  return output.stdout;
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
    // console.log(extensionName, extensionRegex);
    if (filePath.search(extensionRegex) !== -1) {
      return extensionName;
    }
  }

  throw Error('File type not supported!');
}

async function getMD5HashAsync(filePath: string): Promise<string> {
  let output: string = '';

  const regex: RegExp = /(\.zip$)|(\.e01$)|(\.dd$)|(\.lef$)|(\.dmg$)/;

  if (filePath.search(regex) === -1) {
    throw new Error('File type not supported!');
  }

  switch (getFileExtension(filePath)) {
    case 'zip':
      output = await handleZIPAsync(filePath);
      break;
    case 'e01':
      output = await handleE01Async(filePath);
      break;
    case 'dd':
      output = await handleDDAsync(filePath);
      break;
    case 'lef':
      output = await handleLEFAsync(filePath);
      break;
    case 'dmg':
      output = await handleDMGAsync(filePath);
      break;
    default:
      throw new Error('Unknown file extension!');
  }

  return output;
}

export default getMD5HashAsync;
