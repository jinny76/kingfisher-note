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
    let videoWindow = windowManager.findWindowByRoute('/video');
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

  ipcMain.handle('/system/redirect', (event, params) => {
    if (typeof params === 'string' && params.length > 0 && (params[0] === '{' || params[0] === '[')) {
      params = JSON.parse(params);
    }

    let targetWindow;
    if (params.target !== 'main') {
      targetWindow = windowManager.findWindowByRoute(params.target);
    } else {
      targetWindow = mainWindow;
    }

    if (targetWindow) {
      if (params.route) {
        targetWindow.webContents.send(params.route, params.args);
        return {
          code: 200,
          message: '转发成功',
        };
      } else {
        return {
          code: 500,
          message: '未找到路由',
        };
      }
    } else {
      return {
        code: 500,
        message: '未找到窗口',
      };
    }
  });

  console.log('注册系统服务');
};

export default {
  install,
};
