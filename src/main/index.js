import  { Window } from './window'
import { app, shell, protocol, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import StreamServer from "./video/server"
import storeService from './service/store'
import noteService from './service/note'
import { checkUpdate } from './update'

const isDevelopment = process.env.NODE_ENV !== "production";
const path = require('path')


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow = null;
function createMainWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    fullscreenable:true,
    simpleFullscreen:true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {icon}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webviewTag: true,
      nodeIntegration: true,
    }
  })

  Menu.setApplicationMenu(null);

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
    windowManager.main = mainWindow
    windowManager.createTray()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', e => {
    e.preventDefault();
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message:'确认退出？',
      buttons: ['确认', '取消'],
      cancelId: 1,
    }).then(idx => {
      if (idx.response == 1) {
        e.preventDefault();
      } else {
        mainWindow.webContents.send("/client/saveNote")
        setTimeout(() => {
          app.exit();
        }, 1000)
      }
    })
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  protocol.registerFileProtocol('kingfisher', (request, callback) => {
    const url = request.url.substr("kingfisher".length + 3)
    console.log("转换视频链接", decodeURI(path.normalize(url)))
    callback(decodeURI(path.normalize(url)))
  })

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createMainWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  storeService.install()
  noteService.install(windowManager)

  checkUpdate(mainWindow, ipcMain);
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  console.log("关闭窗口", process.platform);
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let windowManager = new Window()
windowManager.listen()


const streamServer = new StreamServer()
streamServer.start()


console.log("Websocket server started on ws://localhost:18888")
