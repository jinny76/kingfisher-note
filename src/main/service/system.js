import {ipcMain} from 'electron';

const install = mainWindow => {
  ipcMain.handle('/system/info', (event, params) => ({
    code: 200,
    info: {
      platform: process.platform,
      home: process.env.HOME || process.env.USERPROFILE,
    },
  }));

  ipcMain.handle('/system/openDevTools', (event, params) => {
    event.sender.openDevTools();
    return {
      code: 200,
      message: '打开成功',
    };
  });

  ipcMain.handle('/system/fullscreen', (event, params) => {
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true);
    return {
      code: 200,
      message: '全屏成功',
    };
  });
};

export default {
  install,
};
