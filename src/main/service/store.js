import { ipcMain } from "electron";
import fs from "fs";

const rootPath = process.env.HOME || process.env.USERPROFILE;

console.log("当前路径", rootPath);

let setting;

let noteMeta = {};

const loadNoteMeta = () => {
  if (fs.existsSync(`${setting.noteDir}/noteMeta.json`)) {
    noteMeta = JSON.parse(fs.readFileSync(`${setting.noteDir}/kfnote/noteMeta.json`, "utf-8"));
  }
};

const saveNoteMeta = () => {
  if (!fs.existsSync(`${setting.noteDir}`)) {
    fs.mkdirSync(`${setting.noteDir}`);
  }
  fs.writeFileSync(`${setting.noteDir}/noteMeta.json`, JSON.stringify(noteMeta));
};

//获取设置
if (!fs.existsSync(`${rootPath}/kfnote/setting.json`)) {
  console.log("未找到设置文件");
  setting = {
    noteDir: rootPath.replaceAll("\\", "/") + "/kfnote/note",
    screenshotDir: rootPath.replaceAll("\\", "/") + "/kfnote/screenshot"
  };
  if (!fs.existsSync(rootPath + "/kfnote")) {
    fs.mkdirSync(rootPath + "/kfnote");
  }
  fs.writeFileSync(`${rootPath}/kfnote/setting.json`, JSON.stringify(setting), "utf-8");
  console.log("设置文件已创建", setting);

  loadNoteMeta();
} else {
  setting = JSON.parse(fs.readFileSync(`${rootPath}/kfnote/setting.json`, "utf-8"));
  console.log("设置文件已加载", setting);
}

const install = () => {
  ipcMain.handle("/store/saveNote", (event, params) => {
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
      fs.writeFileSync(`${setting.noteDir}/${path}.${new Date().getTime()}.bak`, data);
      return {
        code: 200,
        message: "保存成功"
      };
    } else {
      return {
        code: 500,
        message: "保存失败, 未设置笔记目录"
      };
    }
  });

  ipcMain.handle("/store/deleteNote", (event, params) => {
    const { path } = JSON.parse(params);

    if (!fs.existsSync(`${setting.noteDir}/${path}`)) {
      return {
        code: 500,
        message: "文件不存在"
      };
    } else {
      fs.unlinkSync(`${setting.noteDir}/${path}`);
      delete noteMeta[path];
      saveNoteMeta();
      return {
        code: 200,
        message: "删除成功"
      };
    }
  });

  ipcMain.handle("/store/getNoteVersions", (event, params) => {
    const { path } = JSON.parse(params);
    let versions = [];
    if (fs.existsSync(setting.noteDir)) {
      versions = fs.readdirSync(setting.noteDir).filter(file => file.startsWith(path + ".") && file.endsWith(".bak")).map(file => {
        return {
          name: file,
          time: parseInt(file.split(".")[2]),
          label: new Date(fs.statSync(`${setting.noteDir}/${file}`).mtime).toLocaleString()
        };
      });
      //sort by time desc
      versions.sort((a, b) => {
        return b.time - a.time;
      });
    }
    return versions;
  });

  ipcMain.handle("/store/getNoteList", (event, params) => {
    console.log("开始获取文件列表");
    // get file list from "note" folder
    if (!fs.existsSync(setting.noteDir)) {
      return [];
    }

    let files = fs.readdirSync(setting.noteDir);
    files = files.filter(file => file.endsWith(".kfnote"));
    return files.map(file => {
      return {
        name: file,
        tags: noteMeta[file] ? noteMeta[file].tags : [],
        time: fs.statSync(`${setting.noteDir}/${file}`).mtime
      };
    });
  });

  ipcMain.handle("/store/getNote", (event, params) => {
    console.log("开始获取文件");
    // get file from "note" folder
    let { path, time } = JSON.parse(params);

    if (!fs.existsSync(`${setting.noteDir}/${path}`)) {
      return "";
    }

    let target = path;
    if (time) {
      target = `${target}.${time}.bak`;
    }

    if (fs.existsSync(`${setting.noteDir}/${target}`)) {
      return {
        name: path,
        tags: noteMeta[path] ? noteMeta[path].tags : [],
        data: fs.readFileSync(`${setting.noteDir}/${target}`, "utf-8")
      };
    } else {
      return {
        name: path,
        tags: noteMeta[path] ? noteMeta[path].tags : [],
        data: ""
      }
    }
  });

  ipcMain.handle("/store/getSetting", (event, params) => {
    return {
      code: 200,
      setting: setting
    };
  });

  ipcMain.handle("/store/updateSetting", (event, params) => {
    if (params) {
      let newSetting = JSON.parse(params);
      Object.keys(newSetting).forEach(key => {
        setting[key] = newSetting[key];
      });
      console.log("更新设置", setting);
      fs.writeFileSync(`${rootPath}/kfnote/setting.json`, JSON.stringify(setting), "utf-8");
    }
    return {
      code: 200
    };
  });

  ipcMain.handle("/store/newNote", (event, params) => {
    console.log("开始新建文件");
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
      };
    }
  });

  console.log("注册存储服务");
};

export default {
  install, setting
};
