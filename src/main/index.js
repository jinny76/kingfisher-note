import {Window} from './window';
import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  protocol,
  shell,
  nativeTheme,
} from 'electron';
import {join} from 'path';
import {electronApp, is, optimizer} from '@electron-toolkit/utils';
import icon from '../../resources/icon.ico?asset';
import logo from './logo';
import StreamServer from './video/server';
import storeService from './service/store';
import noteService from './service/note';
import systemService from './service/system';
import aiService from './service/ai';
import recordService from './service/record';
import {checkUpdate} from './update';
import {initHttpServer} from './http';

const log = require('electron-log');
let date = new Date()
let dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
log.transports.file.resolvePathFn = () => 'log\\' + dateStr+ '.log';

const isDevelopment = process.env.NODE_ENV !== 'production';
const path = require('path');

initHttpServer();

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow = null;

function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    fullscreenable: true,
    simpleFullscreen: true,
    show: false,
    autoHideMenuBar: true, ...(process.platform === 'linux' ? {icon} : {icon}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true,
      nodeIntegration: true,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    windowManager.main = mainWindow;
    windowManager.createTray();
  });

  mainWindow.webContents.setWindowOpenHandler(details => {
    shell.openExternal(details.url);
    return {action: 'deny'};
  });

  nativeTheme.themeSource = 'dark';

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('close', e => {
    e.preventDefault();
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: '确认退出？',
      buttons: ['确认', '取消'],
      cancelId: 1,
    }).then(idx => {
      if (idx.response == 1) {
        e.preventDefault();
      } else {
        mainWindow.webContents.send('/client/saveNote');
        setTimeout(() => app.exit(), 1000);
      }
    });
  });

  globalShortcut.register('ESC', () => {
    mainWindow.setFullScreen(false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.maximize();
    mainWindow.webContents.send('/client/exitFullscreen');
  });
}

process.on('uncaughtException', function(error) {
  log.error('未捕获错误', error);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('/client/error', JSON.stringify(error));
  }
});

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  protocol.registerFileProtocol('kingfisher', (request, callback) => {
    const url = request.url.substr('kingfisher'.length + 3);
    log.log('转换视频链接', decodeURI(path.normalize(url)));
    callback(decodeURI(path.normalize(url)));
  });

  protocol.registerFileProtocol('vhttp', (request, callback) => {
    const url = request.url.replace('vhttp://', 'http://');
    callback(url);
  });

  protocol.registerFileProtocol('vhttps', (request, callback) => {
    const url = request.url.replace('vhttps://', 'https://');
    callback(url);
  });

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created',
      (_, window) => optimizer.watchWindowShortcuts(window));

  createMainWindow();

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  storeService.install(mainWindow, windowManager);
  noteService.install(mainWindow, windowManager);
  systemService.install(mainWindow, windowManager);
  aiService.install(mainWindow, windowManager);
  recordService.install(mainWindow, windowManager);

  checkUpdate(mainWindow, ipcMain);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  log.log('关闭窗口', process.platform);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

let windowManager = new Window();
windowManager.listen();

const streamServer = new StreamServer();
streamServer.start();

log.log('Websocket 服务器启动 ws://localhost:18888');
