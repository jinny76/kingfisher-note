import {autoUpdater} from 'electron-updater';

let mainWin = null;

const log = require('electron-log');

export const checkUpdate = (win, ipcMain) => {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  mainWin = win;

  autoUpdater.checkForUpdatesAndNotify().then(res => {
    log.log('检测更新成功', res);
    if (res) {
      mainWin.webContents.send('/client/updateAvailable', res);
    } else {
      mainWin.webContents.send('/client/updateNotAvailable', res);
    }
  }).catch(e => log.log('检测更新失败', e));

  ipcMain.handle('/update/install', () => autoUpdater.quitAndInstall());
};

autoUpdater.on('update-available', info => {
  log.log('有新版本需要更新', info);
  mainWin.webContents.send('/client/updateAvailable', info);
});
autoUpdater.on('update-not-available', info => {
  mainWin.webContents.send('/client/updateNotAvailable', info);
  log.log('无需更新', info);
});

autoUpdater.on('download-progress', prog =>
    mainWin.webContents.send('/client/updateProgress', {
      speed: Math.ceil(prog.bytesPerSecond / 1000), // 网速
      percent: Math.ceil(prog.percent), // 百分比
    }));
autoUpdater.on('update-downloaded', () => mainWin.webContents.send(
    '/client/downloaded'));
