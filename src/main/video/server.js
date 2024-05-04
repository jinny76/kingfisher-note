import http from 'node:http';
import Ffmpeg from './ffmpeg';

class StreamServer {
  constructor(port = 19555) {
    this.port = port;
  }

  start() {
    const ffmpeg = new Ffmpeg();
    ffmpeg.init();
    const server = http.createServer((request, response) => {
      console.log(request.url);
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
          console.log('OPTION');
          return response.end();
        }
        ffmpeg.create(input).pipe(response, {end: true});
      }
    });
    server.listen(this.port, () => console.log(
        `video server listen on ${this.port}`));
  }
}

export const convert = async (videoList, vcodec, acodec) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init();
  console.log(videoList);
  for (let i = 0; i < videoList.length; i++) {
    await ffmpeg.convert(videoList[i].path, vcodec, acodec);
  }
  return {
    code: 200,
  };
};

export const captureAudio = async (videoList, acodec) => {
  const ffmpeg = new Ffmpeg();
  ffmpeg.init();
  console.log(videoList);
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

export default StreamServer;
