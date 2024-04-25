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
};

export default {
  install
};
