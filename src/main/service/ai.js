import {ipcMain} from 'electron';
import fs from 'fs';
import storeService from './store';
import axios from 'axios';

const aiServer = 'https://ai.kingfisher.live/aiapi/';

const install = () => {
  ipcMain.handle('/ai/stt', async (event, params) => {
    console.log(params);
    if (!fs.existsSync(storeService.setting.assetsDir + '/' + params)) {
      return {code: 404, message: '文件不存在'};
    }

    const formData = new FormData();
    formData.append('file',
      fs.createReadStream(storeService.setting.assetsDir + '/' + params));
    await axios.post(aiServer + 'v1/sound/stt', formData);
  });

  console.log('注册AI服务');
};

export default {
  install,
};
