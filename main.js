const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    show: false, // important: don't show right away
    width: 400,
    height: 500,
    frame: false,
    resizable: false,
    transparent: true,
    hasShadow: false,
    acceptFirstMouse: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

  // wait until your renderer signals it's done
  ipcMain.once('ready-to-show-ui', () => {
    mainWindow.show();
  });

  ipcMain.on('minimize-app', () => {
    mainWindow.minimize();
  });

  ipcMain.on('close-app', () => {
    app.quit();
  });
}

app.whenReady().then(createMainWindow);