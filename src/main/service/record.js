import {desktopCapturer, ipcMain} from 'electron';
import storeService from './store';
import {splitAudio, webmFix} from '../video/server';
import fs from 'fs';

const log = require('electron-log');

const install = (mainWindow, windowManager) => {
  //log.log(mainWindow.getMediaSourceId());
  desktopCapturer.getSources({
    types: ['screen', 'window'], // 设定需要捕获的是"屏幕"，还是"窗口"
    thumbnailSize: {
      height: 300, // 窗口或屏幕的截图快照高度
      width: 300, // 窗口或屏幕的截图快照宽度
    }, fetchWindowIcons: true, // 如果视频源是窗口且有图标，则设置该值可以捕获到的窗口图标
  }).then(sources => {
    let index = 0;
    sources.forEach(source => {
      //log.log('source' + index++, source);
    });
  });

  ipcMain.handle('/record/pop', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute('/video/');
    if (videoWindow) {
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
    let targetWindow;

    if (storeService.setting.displayMode === 'window') {
      targetWindow = windowManager.findWindowByRoute('/video/');
    } else {
      targetWindow = mainWindow;
    }

    if (targetWindow) {
      let fileName = storeService.setting.assetsDir + '/' +
          `${Date.now()}.webm`;
      targetWindow.webContents.send('/client/record-start', {
        mediaSourceId: targetWindow.getMediaSourceId(),
        fileName: fileName,
        type: params,
      });
      log.log('开始录制', fileName);
    } else {
      return {
        code: 500, message: '未找窗口',
      };
    }
  });

  ipcMain.handle('/record/stop', async (event, params) => {
    let targetWindow;

    if (storeService.setting.displayMode === 'window') {
      targetWindow = windowManager.findWindowByRoute('/video/');
    } else {
      targetWindow = mainWindow;
    }

    if (targetWindow) {
      targetWindow.webContents.send('/client/record-stop', {});
    } else {
      return {
        code: 500, message: '未找到视频窗口',
      };
    }
  });

  ipcMain.handle('/record/save', async (event, params) => {
    log.log('保存文件', params);
    await webmFix(params.fileName);
    fs.rmSync(params.fileName);
    params.fileName = params.fileName.replace('.webm', '.fixed.webm');
    params.fileName = params.fileName.replace(storeService.setting.assetsDir + '/', '');
    mainWindow.webContents.send('/client/record-save', params);
  });

  ipcMain.handle('/record/split', async (event, params) => {
    log.log('切割文件', params);
    let result = await splitAudio(params.fileName);
    let target = result.target;
    //list all files
    let files = fs.readdirSync(target);
    let resultFiles = [];
    files.forEach(file => {
      resultFiles.push(target + '/' + file);
    });
    params.files = resultFiles;
    return params;
  });
};

export default {
  install,
};
