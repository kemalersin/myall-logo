'use strict';

const setupEvents = require('./installers/win/setup-events.win');

if (
  process.platform === 'win32' &&
  setupEvents.handleSquirrelEvent()
) {
  return;
}

const env = process.env.NODE_ENV;
const electron = require('electron');
const updater = require('electron-simple-updater');

const isDevelopment = env === 'development';

updater.init();

require('electron-context-menu')({
  labels: {
    cut: 'Kes',
    copy: 'Kopyala',
    paste: 'Yapıştır',
    save: 'Görseli kaydet',
    copyLink: 'Bağlantıyı kopyala',
    inspect: 'İncele'
  },
  showInspectElement: isDevelopment
});

const app = electron.app;
const ipcMain = electron.ipcMain;
const appDir = `${__dirname}/app`;

let mainWindow;

if (isDevelopment) {
  require('electron-debug')();
}

require('dotenv').config({ path: `${__dirname}/.env` });

function onClosed() {
  mainWindow = null;
}

function createMainWindow() {
  const options = {
    width: 850,
    height: 650,
    show: false,
    frame: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      devTools: isDevelopment,
      preload: `${appDir}/scripts/preload.js`
    }
  };

  const win = new electron.BrowserWindow(options);

  win.setMenu(null);
  win.loadURL(`file://${appDir}/index.html`);
  win.on('closed', onClosed);

  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();

  mainWindow.show();

  if (isDevelopment) {
    require('electron-connect').client.create(mainWindow);
  };
});

ipcMain.on('close', () => {
  mainWindow.close();
});
