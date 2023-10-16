/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';

import { app, BrowserWindow, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
  orchestrator,
  validateDMG,
  validateImage,
  validateZip,
} from '../domain/orchestrator';
import './events';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Print } from './output-parser';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    let { commandLine, imagePath, include, out, report, keywords } = yargs(
      hideBin(process.argv)
    )
      .boolean('commandLine')
      .option('imagePath', {
        demandOption: false,
        type: 'string',
      })
      .option('include', {
        demandOption: false,
        type: 'string',
      })
      .option('out', {
        demandOption: false,
        type: 'string',
      })
      .options('report', {
        demandOption: false,
        type: 'string',
      })
      .options('keywords', {
        demandOption: false,
        type: 'string',
      }).argv;

    if (commandLine) {
      if ((await validateImage(imagePath)) === false || imagePath == null) {
        console.log(
          `Image could not be found or is incorrect type: imagePath was ${imagePath}}`
        );
        return;
      }
      imagePath = await validateZip(imagePath);
      imagePath = await validateDMG(imagePath);
      if (include == null) {
        include = ['p', 'd', 'r', 'c', 'k', 't']; // 's' (for save carved files)
      } else {
        include = include.split(',');
      }

      out = out ?? 'stdout';
      report = report ?? 'json';
      keywords = keywords ?? '';

      const showPartitions = include.includes('p');
      const includeDeletedFiles = include.includes('d');
      const includeRenamedFiles = include.includes('r');
      const includeCarvedFiles = include.includes('c');
      const includeKeywordSearchFiles = include.includes('k');
      const showTimeline = include.includes('t');
      const searchString = keywords;

      const output = await orchestrator({
        imagePath,
        searchString,
        showPartitions,
        showTimeline,
        includeRenamedFiles,
        includeDeletedFiles,
        includeKeywordSearchFiles,
        includeCarvedFiles,
      });
      if (output != null) {
        Print(output, report, out);
        console.log('AEAS done!!!');
      }
    } else {
      createWindow();
      app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) createWindow();
      });
    }
  })
  .catch(console.log);
