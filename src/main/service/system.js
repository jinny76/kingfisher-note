import { ipcMain } from "electron";

const install = () => {
  ipcMain.handle("/system/info", (event, params) => {
    return {
      code: 200,
      info: {
        platform: process.platform,
        home: process.env.HOME || process.env.USERPROFILE
      }
    };
  });

  ipcMain.handle("/system/openDevTools", (event, params) => {
    event.sender.openDevTools();
    return {
      code: 200,
      message: "打开成功"
    };
  });
};

export default {
  install
};
