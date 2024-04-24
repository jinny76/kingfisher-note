import { ipcMain } from "electron";
import fs from "fs";

const rootPath = process.cwd();

let noteMeta = {}

const loadNoteMeta = () => {
  if (fs.existsSync(`${rootPath}/noteMeta.json`)) {
    noteMeta = JSON.parse(fs.readFileSync(`${rootPath}/noteMeta.json`, "utf-8"));
  }
}

loadNoteMeta();

const saveNoteMeta = () => {
  fs.writeFileSync(`${rootPath}/noteMeta.json`, JSON.stringify(noteMeta));
}

let setting = {
  noteDir: "note",
  screenshotDir: "screenshot"
}

const install = () => {
  ipcMain.handle('/store/saveNote', (event, params) => {
    console.log("开始保存文件");
    // save file to "note" folder
    const { path, data, tags } = JSON.parse(params);

    if (tags) {
      noteMeta[path] = noteMeta[path] || {};
      noteMeta[path].tags = tags;
    }
    saveNoteMeta();

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
        tags: noteMeta[file] ? noteMeta[file].tags : [],
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
      tags: noteMeta[path] ? noteMeta[path].tags : [],
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

  ipcMain.handle('/store/newNote', (event, params) => {
    console.log("开始新建文件")
    if (setting.noteDir) {
      if (!fs.existsSync(setting.noteDir)) {
        fs.mkdirSync(setting.noteDir);
      }

      let file = `${params}.kfnote`;
      if (!fs.existsSync(`${setting.noteDir}/${file}`)) {
        fs.writeFileSync(`${setting.noteDir}/${file}`, "");
        return {
          code: 200,
          message: "保存成功"
        };
      } else {
        return {
          code: 500,
          message: "文件已存在"
        };
      }
    } else {
      return {
        code: 500,
        message: "保存失败, 未设置笔记目录"
      }
    }
    return setting;
  });

  console.log("注册存储服务")
}

export default {
  install, setting
};
