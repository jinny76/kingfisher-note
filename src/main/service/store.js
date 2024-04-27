import { ipcMain } from "electron";
import fs from "fs";
import crypto from "crypto";
import md5 from "md5";

const algorithm = "aes-256-cbc";
const encryptPrefix = "!!!secure:";

// generate 16 bytes of random data
let iv = md5("kingisher note").substring(0, 16);
const initVector = Buffer.from(iv);

const rootPath = process.env.HOME || process.env.USERPROFILE;

console.log("当前路径", rootPath);

let setting = {
  noteDir: rootPath.replaceAll("\\", "/") + "/kfnote/note",
  screenshotDir: rootPath.replaceAll("\\", "/") + "/kfnote/screenshot",
  assetsDir: rootPath.replaceAll("\\", "/") + "/kfnote/assets"
};

let noteMeta = {};

const encrypt = (data, key) => {
  for (let i = 0; i < 16; i++) {
    key = md5(key);
  }
  const cipher = crypto.createCipheriv(algorithm, key, initVector);
  let encrypted = cipher.update(data);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  data = encrypted.toString("hex");
  return data;
};

const decrypt = (data, key) => {
  for (let i = 0; i < 16; i++) {
    key = md5(key);
  }
  const decipher = crypto.createDecipheriv(algorithm, key, initVector);
  let decrypted = decipher.update(Buffer.from(data, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const loadNoteMeta = () => {
  if (fs.existsSync(`${setting.noteDir}/noteMeta.json`)) {
    noteMeta = JSON.parse(fs.readFileSync(`${setting.noteDir}/noteMeta.json`, "utf-8"));
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
  if (!fs.existsSync(rootPath + "/kfnote")) {
    fs.mkdirSync(rootPath + "/kfnote");
  }
  fs.writeFileSync(`${rootPath}/kfnote/setting.json`, JSON.stringify(setting), "utf-8");
  console.log("设置文件已创建", setting);
  loadNoteMeta();
} else {
  let localSetting = JSON.parse(fs.readFileSync(`${rootPath}/kfnote/setting.json`, "utf-8"));
  Object.keys(localSetting).forEach(key => {
    setting[key] = localSetting[key];
  });
  console.log("设置文件已加载", setting);
  loadNoteMeta();
}

const install = () => {
  ipcMain.handle("/store/saveNote", (event, params) => {
    console.log("开始保存文件");
    // save file to "note" folder
    const { path, data, tags, key } = JSON.parse(params);

    if (tags) {
      noteMeta[path] = noteMeta[path] || {};
      noteMeta[path].tags = tags;
    }
    saveNoteMeta();

    if (setting.noteDir) {
      if (!fs.existsSync(setting.noteDir)) {
        fs.mkdirSync(setting.noteDir);
      }

      if (key) {
        fs.writeFileSync(`${setting.noteDir}/${path}`, encryptPrefix + encrypt(data, key));
        fs.writeFileSync(`${setting.noteDir}/${path}.${new Date().getTime()}.bak`, encryptPrefix + encrypt(data, key));
      } else {
        fs.writeFileSync(`${setting.noteDir}/${path}`, data);
        fs.writeFileSync(`${setting.noteDir}/${path}.${new Date().getTime()}.bak`, data);
      }
      return {
        code: 200, message: "保存成功"
      };
    } else {
      return {
        code: 500, message: "保存失败, 未设置笔记目录"
      };
    }
  });

  ipcMain.handle("/store/encryptNote", (event, params) => {
    console.log("开始加密文件");
    const { path, key } = JSON.parse(params);

    if (fs.existsSync(`${setting.noteDir}/${path}`)) {
      let data = fs.readFileSync(`${setting.noteDir}/${path}`, "utf-8");
      fs.writeFileSync(`${setting.noteDir}/${path}`, encryptPrefix + encrypt(data, key));
      //find all versions
      const files = fs.readdirSync(setting.noteDir);
      files.forEach(file => {
        if (file.startsWith(path) && file.endsWith(".bak")) {
          data = fs.readFileSync(`${setting.noteDir}/${file}`, "utf-8");
          fs.writeFileSync(`${setting.noteDir}/${file}`, encryptPrefix + encrypt(data, key));
        }
      });
      return {
        code: 200, message: "加密成功"
      };
    } else {
      return {
        code: 500, message: "加密成功, 未找到文件"
      };
    }
  });

  ipcMain.handle("/store/deleteNote", (event, params) => {
    const { path } = JSON.parse(params);

    if (!fs.existsSync(`${setting.noteDir}/${path}`)) {
      return {
        code: 500, message: "文件不存在"
      };
    } else {
      fs.unlinkSync(`${setting.noteDir}/${path}`);
      delete noteMeta[path];
      saveNoteMeta();
      return {
        code: 200, message: "删除成功"
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
    }).sort((a, b) => {
      return b.time - a.time;
    });
  });

  ipcMain.handle("/store/getNote", (event, params) => {
    console.log("开始获取文件");
    // get file from "note" folder
    let { path, time, key } = JSON.parse(params);

    let target = path;
    if (time) {
      target = `${target}.${time}.bak`;
    }

    if (fs.existsSync(`${setting.noteDir}/${target}`)) {
      let content = fs.readFileSync(`${setting.noteDir}/${target}`, "utf-8");
      if (content.startsWith(encryptPrefix)) {
        if (key != null) {
          content = decrypt(content.substring(encryptPrefix.length), key);
        } else {
          return {
            code: 500, message: "文件已加密"
          };
        }
      }
      return {
        code: 200,
        name: path,
        tags: noteMeta[path] ? noteMeta[path].tags : [],
        data: content,
        key: key
      };
    } else {
      return {
        code: 404,
        message: "笔记不存在"
      };
    }
  });

  ipcMain.handle("/store/getSetting", (event, params) => {
    return {
      code: 200, setting: setting
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
          code: 200, message: "保存成功"
        };
      } else {
        return {
          code: 500, message: "文件已存在"
        };
      }
    } else {
      return {
        code: 500, message: "保存失败, 未设置笔记目录"
      };
    }
  });

  ipcMain.handle("/store/searchAllLinesFromNotes", (event, params) => {
    console.log("开始搜索所有笔记");
    const { keyword } = JSON.parse(params);
    const files = fs.readdirSync(setting.noteDir);
    let result = [];
    if (keyword) {
      files.forEach(file => {
        if (file.endsWith(".kfnote")) {
          const data = fs.readFileSync(`${setting.noteDir}/${file}`, "utf-8");
          if (data && data.indexOf(encryptPrefix) !== 0) {
            const lines = data.split("\n");
            lines.every((line, index) => {
              if (line.toLowerCase().indexOf(keyword.toLowerCase()) !== -1) {
                result.push({
                  name: file, line: index + 1, content: line
                });
                return false;
              } else {
                return true;
              }
            });
          }
        }
      });
    }
    return {
      code: 200, result: result
    };
  });

  console.log("注册存储服务");
};

const storeAssets = async (req, res) => {
  if (!fs.existsSync(setting.assetsDir)) {
    fs.mkdirSync(setting.assetsDir);
  }

  console.log(req.files);
  let file = req.files["file[]"];
  let target = setting.assetsDir + "/" + Date.now() + file.name.substring(file.name.lastIndexOf("."));
  await file.mv(target);

  res.send({
    code: 200,
    result: {
      path: target
    }
  });
};

export default {
  install, setting, storeAssets
};
