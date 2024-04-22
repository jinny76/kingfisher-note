import { ipcMain } from "electron";
import fs from "fs";

const rootPath = process.cwd();

let setting = {
  displayMode: "window",
  noteDir: "note",
  screenshotDir: "screenshot",
  pauseWhenWrite: true,
}

const install = () => {
  ipcMain.handle('/store/saveNote', (event, params) => {
    console.log("开始保存文件");
    // save file to "note" folder
    const { path, data } = JSON.parse(params);

    if (setting.noteDir) {
      if (!fs.existsSync(setting.noteDir)) {
        fs.mkdirSync(setting.noteDir);
      }

      fs.writeFileSync(`${setting.noteDir}/${path}`, data);
      return {
        code: 200,
        message: "保存成功"
      }
    } else {
      return {
        code: 500,
        message: "保存失败, 未设置笔记目录"
      }
    }
  })

  ipcMain.handle('/store/getNoteList', (event, params) => {
    console.log("开始获取文件列表")
    // get file list from "note" folder
    if (!fs.existsSync(setting.noteDir)) {
      return [];
    }

    let files = fs.readdirSync(setting.noteDir);
    return files.map(file => {
      return {
        name: file,
        time: fs.statSync(`${setting.noteDir}/${file}`).mtime
      }
    });
  });

  ipcMain.handle('/store/getNote', (event, params) => {
    console.log("开始获取文件")
    // get file from "note" folder
    const { path } = JSON.parse(params);

    if (!fs.existsSync(`${setting.noteDir}/${path}`)) {
      return "";
    }

    return {
      name : path,
      data : fs.readFileSync(`${setting.noteDir}/${path}`, "utf-8")
    };
  });

  ipcMain.handle('/store/updateSetting', (event, params) => {
    if (params) {
      let newSetting = JSON.parse(params);
      Object.keys(newSetting).forEach(key => {
        setting[key] = newSetting[key];
      });
    }
    return {
      code: 200
    };
  });

  console.log("注册存储服务")
}

export default {
  install, setting
};
