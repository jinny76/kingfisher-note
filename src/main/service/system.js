import {ipcMain} from 'electron';

const install = (mainWindow, windowManager) => {
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

  ipcMain.handle('/system/openPopDevTools', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute("/video")
    if (videoWindow) {
      videoWindow.webContents.openDevTools();
      return {
        code: 200,
        message: '打开成功',
      };
    } else {
      return {
        code: 500,
        message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/system/fullscreen', (event, params) => {
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true);
    return {
      code: 200,
      message: '全屏成功',
    };
  });

  console.log('注册系统服务');
};

export default {
  install,
};
