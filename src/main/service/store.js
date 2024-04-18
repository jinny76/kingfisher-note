import { ipcMain } from "electron";
import fs from "fs";

const rootPath = process.cwd();

const install = (electron) => {
  ipcMain.handle('/store/saveNote', (event, params) => {
    console.log("开始保存文件");
    // save file to "note" folder
    const { path, data } = JSON.parse(params);

    if (!fs.existsSync(`${rootPath}/note`)) {
      fs.mkdirSync(`${rootPath}/note`);
    }

    fs.writeFileSync(`${rootPath}/note/${path}`, data);
    return {
      code: 200,
      message: "保存成功"
    }
  })

  ipcMain.handle('/store/getNoteList', (event, params) => {
    console.log("开始获取文件列表")
    // get file list from "note" folder
    if (!fs.existsSync(`${rootPath}/note`)) {
      return [];
    }

    return fs.readdirSync(`${rootPath}/note`);
  });

  ipcMain.handle('/store/getNote', (event, params) => {
    console.log("开始获取文件")
    // get file from "note" folder
    const { path } = JSON.parse(params);

    if (!fs.existsSync(`${rootPath}/note/${path}`)) {
      return "";
    }

    return {
      name : path,
      data : fs.readFileSync(`${rootPath}/note/${path}`, "utf-8")
    };
  });

  console.log("注册存储服务")
}

export default {
  install
};
