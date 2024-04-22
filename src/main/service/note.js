import { ipcMain } from "electron";
import fs from "fs";
import storeService from './store'

const rootPath = process.cwd();

let windowManager = null;

const install = (_windowManager) => {
  windowManager = _windowManager;

  ipcMain.handle('/note/insertAll', (event, params) => {
    console.log("开始插入内容");
    // save file to "note" folder
    const { time, screenshot } = JSON.parse(params);

    console.log(storeService.setting.screenshotDir)

    if (!fs.existsSync(storeService.setting.screenshotDir)) {
      fs.mkdirSync(storeService.setting.screenshotDir);
    };

    let screenshotId = 0;
    if (screenshot) {
      //save base64 to image
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
      const dataBuffer = Buffer.from(base64Data, "base64");
      screenshotId = new Date().getTime();
      fs.writeFileSync(`${storeService.setting.screenshotDir}/${screenshotId}.png`, dataBuffer);
    }

    windowManager.main.focus()
    windowManager.main.webContents.send('/client/insertAll', JSON.stringify({ time,  screenshotId}))

    return {
      code: 200,
      message: "保存成功"
    }
  })

  ipcMain.handle('/note/locateVideo', (event, params) => {
    console.log("开始定位视频", params);
    let videoWindow = windowManager.findWindowByRoute("/video/")
    if (videoWindow) {
      videoWindow.webContents.send('/client/locateVideo', params)
    } else {
      windowManager.main.webContents.send('/client/locateVideo', params)
    }
  });

  ipcMain.handle('/note/insertContent', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute("/video/")
    if (videoWindow) {
      videoWindow.webContents.send('/client/insertContent', params)
    }
  });

  ipcMain.handle('/note/stopVideo', (event, params) => {
    let videoWindow = windowManager.findWindowByRoute("/video/")
    if (videoWindow) {
      videoWindow.webContents.send('/client/stopVideo', params)
    }
  });

  console.log("注册笔记服务")
}

export default {
  install
};
