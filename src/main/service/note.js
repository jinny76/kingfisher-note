import { ipcMain, BrowserWindow} from "electron";
import fs from "fs";

const rootPath = process.cwd();

let windowManager = null;

const install = (_windowManager) => {
  windowManager = _windowManager;

  ipcMain.handle('/note/insertAll', (event, params) => {
    console.log("开始插入内容");
    // save file to "note" folder
    const { time, screenshot } = JSON.parse(params);

    if (!fs.existsSync(`${rootPath}/screenshot`)) {
      fs.mkdirSync(`${rootPath}/screenshot`);
    };

    let screenshotId = 0;
    if (screenshot) {
      //save base64 to image
      const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, "");
      const dataBuffer = Buffer.from(base64Data, "base64");
      screenshotId = new Date().getTime();
      fs.writeFileSync(`${rootPath}/screenshot/${screenshotId}.png`, dataBuffer);
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
      console.log("找到视频窗口")
      videoWindow.webContents.send('/client/locateVideo', params)
    } else {
      windowManager.main.webContents.send('/client/locateVideo', params)
    }
  });

  console.log("注册笔记服务")
}

export default {
  install
};
