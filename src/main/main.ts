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
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  session,
  globalShortcut,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import Screenshots from 'electron-screenshots';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

// const customElectronTitlebar = require('custom-electron-titlebar/main');

// const { setupTitlebar, attachTitlebarToWindow } = customElectronTitlebar;

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    // autoUpdater.signals.progress((info) => this.sendStatusToWindow(info));
    autoUpdater.checkForUpdatesAndNotify({
      title: 'A new update is ready to install',
      body: '{appName} version {version} has been downloaded and will be automatically installed on exit',
    });
  }
}

let mainWindow: BrowserWindow | null = null;
let screenshots: Screenshots | null = null;

// setup the titlebar main process
// setupTitlebar();

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

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
    width: 1450,
    height: 900,
    icon: getAssetPath('icon.png'),
    // titleBarStyle: 'hidden',
    // transparent: true,
    webPreferences: {
      webSecurity: !isDebug,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });
  // attach fullscreen(f11 and not 'maximized') && focus listeners
  // attachTitlebarToWindow(mainWindow);

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
    screenshots?.$win?.close();
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    if (edata.features.includes('electron:true')) {
      return { action: 'allow' };
    }
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  const filter = {
    urls: ['https://*.xbcs.top/*', 'http://localhost:*/*'],
  };
  mainWindow.webContents.session.webRequest.onBeforeSendHeaders(
    filter,
    (details, callback) => {
      const url = new URL(details.url);
      details.requestHeaders.Referer = url.origin;
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    }
  );

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

app.commandLine.appendSwitch('--no-proxy-server');

app
  .whenReady()
  .then(() => {
    createWindow();

    screenshots = new Screenshots({
      singleWindow: true,
    });

    globalShortcut.register('ctrl+shift+a', () => {
      screenshots?.startCapture();
      // screenshots.$view.webContents.openDevTools();
    });
    // 点击确定按钮回调事件
    screenshots.on('ok', (e, buffer, bounds) => {
      console.log('capture', buffer, bounds);
      mainWindow?.show();
      // screenshots.endCapture();
      if (mainWindow !== null) {
        mainWindow.webContents.send('screenshots-ok', buffer);
      }
    });
    screenshots.on('cancel', (e) => {
      // 执行了preventDefault
      // 点击取消不会关闭截图窗口
      // e.preventDefault();
      console.log('capture', 'cancel2');
      mainWindow?.show();
    });
    // 点击保存按钮回调事件
    screenshots.on('save', (e, buffer, bounds) => {
      console.log('capture', buffer, bounds);
      mainWindow?.show();
    });
    // globalShortcut.register('esc', () => {
    //   console.log('esc');
    //   if (screenshots?.$win?.isFocused()) {
    //     screenshots.endCapture();
    //     mainWindow?.show();
    //   }
    // });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

app.setAppUserModelId('小白客服');

/**
 * TODO 迁移这些 ipcMain 到单独的文件
 */
ipcMain.on('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show();
  }
});

ipcMain.on('clear-all-cookies', async () => {
  await session.defaultSession.clearStorageData({ storages: ['cookies'] });
});

ipcMain.on('start-capture', () => {
  console.info('start-capture: %o', screenshots);
  screenshots?.startCapture();
});

ipcMain.on('minimize-main-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});
ipcMain.on('hide-main-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});
