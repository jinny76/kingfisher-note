import { autoUpdater } from 'electron-updater'

let mainWin = null;

export const checkUpdate = (win, ipcMain) => {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  mainWin = win;
  // 检测是否有更新包并通知
  autoUpdater.checkForUpdatesAndNotify().catch();
  // 监听渲染进程的 install 事件，触发退出应用并安装
  ipcMain.handle('/update/install', () => autoUpdater.quitAndInstall());

  /*if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      mainWin.webContents.send('/client/updateAvailable', {});

      let progress = 0;
      let timer = setInterval(() => {
        progress += 5;
        mainWin.webContents.send('/client/updateProgress', {
          speed: 1000,
          percent: progress,
        });
        if (progress >= 100) {
          clearInterval(timer);
          mainWin.webContents.send('/client/downloaded');
        }
      }, 1000)
    }, 3000)
  }*/
};

autoUpdater.on('update-available', (info) => {
  console.log('有新版本需要更新', info);
  mainWin.webContents.send('/client/updateAvailable', info);
});
autoUpdater.on('update-not-available', (info) => {
  console.log('无需更新', info);
});

autoUpdater.on('download-progress', (prog) => {
  mainWin.webContents.send('/client/updateProgress', {
    speed: Math.ceil(prog.bytesPerSecond / 1000), // 网速
    percent: Math.ceil(prog.percent), // 百分比
  });
});
autoUpdater.on('update-downloaded', () => {
  mainWin.webContents.send('/client/downloaded');
});
