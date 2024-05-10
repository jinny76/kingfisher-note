const {app} = require('electron');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
import storeService from './service/store';
import fs from 'fs';

const log = require('electron-log');

export const initHttpServer = () => {
  log.log('应用根路径', app.getAppPath());

  const server = express();
  server.use(cors());

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({extended: true}));

  let router = express.Router();
  router.use(fileUpload());

  router.post('/assets', storeService.storeAssets);

  server.use('/upload', router);

  if (!app.isPackaged) {
    server.use('/vditor', express.static('resources/vditor'));
  } else {
    let cdn = app.getAppPath() + '.unpacked/../../Resources/vditor';
    log.log('CDN', fs.existsSync(cdn));
    server.use('/vditor', express.static(cdn));
  }

  server.listen(13999, () => log.log(
      'HTTP 服务器启动 http://localhost:13999'));
};
