import {desktopCapturer, ipcMain} from 'electron';
import storeService from './store';
import {webm2mp4, webmFix} from '../video/server';
import fs from 'fs';

let mainWindow = null;
let windowManager = null;

const install = (_mainWindow, _windowManager) => {
  mainWindow = _mainWindow;
  windowManager = _windowManager;
  console.log(mainWindow.getMediaSourceId());
  desktopCapturer.getSources({
    types: ['screen', 'window'], // 设定需要捕获的是"屏幕"，还是"窗口"
    thumbnailSize: {
      height: 300, // 窗口或屏幕的截图快照高度
      width: 300, // 窗口或屏幕的截图快照宽度
    }, fetchWindowIcons: true, // 如果视频源是窗口且有图标，则设置该值可以捕获到的窗口图标
  }).then(sources => {
    let index = 0;
    sources.forEach(source => {
      console.log('source' + index++, source);
    });
  });

  ipcMain.handle('/record/pop', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      console.log(videoWindow.getMediaSourceId());
      return {
        code: 200, message: videoWindow.getMediaSourceId(),
      };
    } else {
      return {
        code: 500, message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/record/start', async (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      let fileName = storeService.setting.assetsDir + "/" + `${Date.now()}.webm`;
      videoWindow.webContents.send('/client/record-start', {
        mediaSourceId: videoWindow.getMediaSourceId(),
        fileName: fileName,
        type: params
      });
    } else {
      return {
        code: 500, message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/record/stop', async (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
      videoWindow.webContents.send('/client/record-stop', {});
    } else {
      return {
        code: 500, message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/record/save', async (event, params) => {
    console.log('保存文件', params);
    await webmFix(params.fileName);
    fs.rmSync(params.fileName);
    params.fileName = params.fileName.replace('.webm', '.fixed.webm');
    mainWindow.webContents.send('/client/record-save', params);
  });
};

export default {
  install,
};
