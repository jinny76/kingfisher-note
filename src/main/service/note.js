import {ipcMain} from 'electron';
import fs from 'fs';
import storeService from './store';
import {createWorker} from 'tesseract.js';
import {
  captureAudio,
  convert,
  extractSubtitle,
  fetchStream,
} from '../video/server';

const rootPath = process.cwd();
const log = require('electron-log');

const install = (mainWindow, windowManager) => {
  let processCb = (percent, timemark) => {
    mainWindow.webContents.send('/client/ffmpeg-progress',
        {percent, timemark});
  };

  ipcMain.handle('/note/insertAll', (event, params) => {
    log.log('开始插入内容');
    // save file to "note" folder
    const {time, screenshot, type} = JSON.parse(params);

    return insertAll(time, screenshot, type);
  });

  function insertAll(time, screenshot, type) {
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
        JSON.stringify({time, screenshotId, type}));

    return {
      code: 200, message: '保存成功',
    };
  }

  ipcMain.handle('/note/locateVideo', (event, params) => {
    log.log('开始定位视频', params);
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
        request.options.mp3 ? 'mp3' : null, processCb);
    return {
      code: 200,
    };
  });

  ipcMain.handle('/note/getStreams', async (event, params) => {
    let request = JSON.parse(params);
    try {
      let result = await fetchStream(request.files.path);
      return result;
    } catch (e) {
      return {
        code: 500, message: e.message,
      };
    }
  });

  ipcMain.handle('/note/captureAudio', async (event, params) => {
    let request = JSON.parse(params);
    await captureAudio(request.files, 'mp3', processCb);
    return {
      code: 200,
    };
  });

  ipcMain.handle('/note/extractSubtitle', async (event, params) => {
    let result = await extractSubtitle(JSON.parse(params), processCb);
    mainWindow.webContents.send('/client/captureSubtitle',
        JSON.stringify({fileName: result.result}));
    return result;
  });

  ipcMain.handle('/note/webInsertContent', (event, params) => {
    ws.send(JSON.stringify({
      action: 'insertContent', args: params,
    }));
    log.log('发送插入内容', params);
  });

  ipcMain.handle('/note/webLocateVideo', (event, params) => {
    ws.send(JSON.stringify({
      action: 'locateVideo', args: params,
    }));
    log.log('定位视频', params);
  });

  ipcMain.handle('/note/webPlayVideo', (event, params) => {
    ws.send(JSON.stringify({
      action: 'playVideo',
    }));
    log.log('播放视频', params);
  });

  ipcMain.handle('/note/webStopVideo', (event, params) => {
    ws.send(JSON.stringify({
      action: 'stopVideo',
    }));
    log.log('暂停视频', params);
  });

  ipcMain.handle('/note/webForward', (event, params) => {
    ws.send(JSON.stringify({
      action: 'forward', args: params,
    }));
    log.log('快进', params);
  });

  ipcMain.handle('/note/captureSubtitle', (event, params) =>
      ws.send(JSON.stringify({
        action: 'captureSubtitle',
      })));

  ipcMain.handle('/note/webBackward', (event, params) => {
    ws.send(JSON.stringify({
      action: 'backward', args: params,
    }));
    log.log('快退', params);
  });

  ipcMain.handle('/note/closeVideo', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.close();
    }
  });

  ipcMain.handle('/note/send', (event, params) => mainWindow.webContents.send(
      '/client/send', params));

  ipcMain.handle('/note/changePage', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/changePage', params);
      return {
        code: 200, params,
      };
    } else {
      return {
        code: 500, message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/note/getTimestamp', (event, params) =>
      ws.send(JSON.stringify({
        action: 'getTimestamp',
      })));

  ipcMain.handle('/note/ocr', async (event, params) => {
    let screenshot = `${storeService.setting.screenshotDir}/${params}.png`;

    if (worker) {
      const {data: {text}} = await worker.recognize(screenshot);
      log.log('识别结果', text);
      return {
        code: 200, message: '识别成功', data: text,
      };
    } else {
      return {
        code: 500, message: '识别失败',
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

  ipcMain.handle('/note/analysisSubtitle', async (event, params) => mainWindow.webContents.send(
      '/client/analysisSubtitle', params));

  const WebSocketServer = require('ws').Server;
  let wss = new WebSocketServer({port: 18888});
  let ws;
  wss.on('connection', _ws => {
    log.log('客户端已连接');
    ws = _ws;

    ws.on('message', message => {
      let data = JSON.parse(message);
      if (data.action === 'insertContent') {
        insertAll(data.time, data.screenshot, data.type);
      } else if (data.action === 'getTimestamp') {
        let videoWindow = windowManager.findWindowByRoute('/video/');
        if (videoWindow) {
          videoWindow.webContents.send('/client/getTimestamp',
              JSON.stringify({time: data.time}));
        }
      } else if (data.action === 'captureSubtitle') {
        let args = data.args;
        //fetch the movie id and page from "https://www.bilibili.com/video/BV1X7411F744?p=4&vd_source=e377439980a0887e8d521fa76a9a9e5c", return "BV1X7411F744-4"
        if (args.type === 'bilibili') {
          let url = args.url.replace('/?', '?');
          let movieId = url.substring(url.lastIndexOf('/') + 1,
              url.lastIndexOf('?'));
          let page = 1;
          let firstParam = url.substring(url.lastIndexOf('?') + 1,
              url.indexOf('&')).
              split('=');
          if (firstParam[0] === 'p') {
            page = firstParam[1];
          }

          fs.writeFileSync(
              `${storeService.setting.assetsDir}/${movieId}-${page}.bilibili.json`,
              JSON.stringify(args.subtitle),
              {encoding: 'utf-8', overwrite: true});

          let targetWindow;

          if (storeService.setting.displayMode === 'window') {
            targetWindow = windowManager.findWindowByRoute('/video/');
          } else {
            targetWindow = mainWindow;
          }

          targetWindow.webContents.send('/client/captureSubtitle',
              JSON.stringify({fileName: `${movieId}-${page}.bilibili.json`}));
        }
      }
    });
  });

  let worker = null;

  (async () => {
    worker = await createWorker('eng+chi_sim');
  })();

  log.log('注册笔记服务');
};

export default {
  install,
};
