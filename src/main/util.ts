/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function getFileExtension(filePath: string) {
  const regexDict: { [key: string]: RegExp } = {
    zip: /(\.zip$)/,
    e01: /(\.e01$)/,
    dd: /(\.dd$)/,
    lef: /(\.lef$)/,
    dmg: /(\.dmg$)/,
  };

  for (const [extensionName, extensionRegex] of Object.entries(regexDict)) {
    if (filePath.search(extensionRegex) !== -1) {
      return extensionName;
    }
  }

  throw Error('File type not supported!');
}
