import {ipcMain} from 'electron';
import fs from 'fs';
import storeService from './store';
import {createWorker} from 'tesseract.js';
import {convert} from '../video/server';

const rootPath = process.cwd();

let windowManager = null;

const install = _windowManager => {
  windowManager = _windowManager;

  ipcMain.handle('/note/insertAll', (event, params) => {
    console.log('开始插入内容');
    // save file to "note" folder
    const {time, screenshot} = JSON.parse(params);

    return insertAll(time, screenshot);
  });

  function insertAll(time, screenshot) {
    console.log(storeService.setting.screenshotDir);

    if (!fs.existsSync(storeService.setting.screenshotDir)) {
      fs.mkdirSync(storeService.setting.screenshotDir);
    }

    let screenshotId = 0;
    if (screenshot) {
      //save base64 to image
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
      const dataBuffer = Buffer.from(base64Data, 'base64');
      screenshotId = new Date().getTime();
      fs.writeFileSync(
          `${storeService.setting.screenshotDir}/${screenshotId}.png`,
          dataBuffer);
    }

    windowManager.main.focus();
    windowManager.main.webContents.send('/client/insertAll',
        JSON.stringify({time, screenshotId}));

    return {
      code: 200, message: '保存成功',
    };
  }

  ipcMain.handle('/note/locateVideo', (event, params) => {
    console.log('开始定位视频', params);
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/locateVideo', params);
    } else {
      windowManager.main.webContents.send('/client/locateVideo', params);
    }
  });

  ipcMain.handle('/note/insertContent', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/insertContent', params);
    }
  });

  ipcMain.handle('/note/stopVideo', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/stopVideo', params);
    }
  });

  ipcMain.handle('/note/playVideo', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/playVideo', params);
    }
  });

  ipcMain.handle('/note/forward', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/forward', params);
    }
  });

  ipcMain.handle('/note/backward', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/backward', params);
    }
  });

  ipcMain.handle('/note/convert', async (event, params) => {
    let request = JSON.parse(params);
    await convert(request.files, request.options.h264 ? 'h264' : null,
        request.options.mp3 ? 'mp3' : null);
    return {
      code: 200,
    };
  });

  ipcMain.handle('/note/webInsertContent', (event, params) => {
    ws.send(JSON.stringify({
      action: 'insertContent', args: params,
    }));
    console.log('发送插入内容', params);
  });

  ipcMain.handle('/note/webLocateVideo', (event, params) => {
    ws.send(JSON.stringify({
      action: 'locateVideo', args: params,
    }));
    console.log('定位视频', params);
  });

  ipcMain.handle('/note/webPlayVideo', (event, params) => {
    ws.send(JSON.stringify({
      action: 'playVideo',
    }));
    console.log('播放视频', params);
  });

  ipcMain.handle('/note/webStopVideo', (event, params) => {
    ws.send(JSON.stringify({
      action: 'stopVideo',
    }));
    console.log('暂停视频', params);
  });

  ipcMain.handle('/note/webForward', (event, params) => {
    ws.send(JSON.stringify({
      action: 'forward', args: params,
    }));
    console.log('快进', params);
  });

  ipcMain.handle('/note/webBackward', (event, params) => {
    ws.send(JSON.stringify({
      action: 'backward', args: params,
    }));
    console.log('快退', params);
  });

  ipcMain.handle('/note/closeVideo', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.close();
    }
  });

  ipcMain.handle('/note/changePage', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/changePage', params);
      return {
        code: 200,
        params,
      };
    } else {
      return {
        code: 500,
        message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/note/ocr', async (event, params) => {
    let screenshot = `${storeService.setting.screenshotDir}/${params}.png`;

    if (worker) {
      const {data: {text}} = await worker.recognize(screenshot);
      console.log(text);
      return {
        code: 200,
        message: '识别成功',
        data: text,
      };
    } else {
      return {
        code: 500,
        message: '识别失败',
      };
    }
  });

  ipcMain.handle('/note/openFile', async (event, params) => {
    let {path} = JSON.parse(params);
    let parentDir = path.substring(0, path.lastIndexOf('/'));
    //open the folder
    let childProcess = require('child_process');
    if (process.platform === 'win32') {
      parentDir = parentDir.replace(/\//g, '\\');
      childProcess.exec(`start explorer "${parentDir}"`);
    } else if (process.platform === 'darwin') {
      childProcess.exec(`open "${parentDir}"`);
    } else {
      childProcess.exec(`xdg-open "${parentDir}"`);
    }
  });

  const WebSocketServer = require('ws').Server;
  let wss = new WebSocketServer({port: 18888});
  let ws;
  wss.on('connection', _ws => {
    console.log('客户端已连接');
    ws = _ws;

    ws.on('message', message => {
      let data = JSON.parse(message);
      if (data.action === 'insertContent') {
        insertAll(data.time, data.screenshot);
      }
    });
  });

  let worker = null;

  (async () => {
    worker = await createWorker('eng+chi_sim');
  })();

  console.log('注册笔记服务');
};

export default {
  install,
};
