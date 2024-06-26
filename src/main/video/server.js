import http from 'node:http';
import Ffmpeg from './ffmpeg';

const log = require('electron-log');

class StreamServer {
  constructor(mainWindow, port = 19555) {
    this.port = port;
  }

  start() {
    const ffmpeg = new Ffmpeg();
    ffmpeg.init();
    const server = http.createServer((request, response) => {
      log.log('请求', request.url);
      ffmpeg.kill();
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const input = url.searchParams.get('v');
      if (input) {
        const headers = new Headers({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
          'Access-Control-Allow-Headers': 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization',
        });
        response.setHeaders(headers);
        //让options请求快速返回
        if (response.method === 'OPTIONS') {
          return response.end();
        }
        ffmpeg.create(input).pipe(response, {end: true});
      }
    });
    server.listen(this.port, () => log.log(`视频服务器启动 ${this.port}`));
  }
}

export const convert = async (videoList, vcodec, acodec, processCb) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init(processCb);
  for (let i = 0; i < videoList.length; i++) {
    await ffmpeg.convert(videoList[i].path, vcodec, acodec);
  }
  return {
    code: 200,
  };
};

export const captureAudio = async (videoList, acodec, processCb) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init(processCb);
  for (let i = 0; i < videoList.length; i++) {
    await ffmpeg.captureAudio(videoList[i].path, acodec);
  }
  return {
    code: 200,
  };
};
export const webmFix = async (file) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init();
  await ffmpeg.webmFix(file);
  return {
    code: 200,
  };
};

export const splitAudio = async (file, processCb) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init(processCb);
  let tempDir = await ffmpeg.splitAudio(file);
  return {
    target: tempDir, code: 200,
  };
};

export const fetchStream = async (file) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init();
  let streams = await ffmpeg.fetchStream(file);
  return {
    result: streams, code: 200,
  };
};

export const extractSubtitle = async (input, processCb) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init(processCb);
  let result = await ffmpeg.extractSubtitle(input);
  return {
    result: result, code: 200,
  };
};

export default StreamServer;
