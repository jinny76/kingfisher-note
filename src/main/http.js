const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
import storeService from './service/store';

export const initHttpServer = () => {
  const server = express();
  server.use(cors());

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({extended: true}));

  let router = express.Router();
  router.use(fileUpload());

  router.post('/assets', storeService.storeAssets);

  server.use('/upload', router);

  server.use('/vditor', express.static('./resources/vditor'));

  server.listen(13999, () => console.log(
      'HTTP 服务器启动 http://localhost:13999'));
};
