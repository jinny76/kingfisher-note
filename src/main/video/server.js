import http from "node:http";
import Ffmpeg from "./ffmpeg";

class StreamServer {
  constructor(port = 9555) {
    this.port = port;
  }

  start() {
    const ffmpeg = new Ffmpeg();
    ffmpeg.init();
    const server = http.createServer((request, response) => {
      console.log(request.url);
      ffmpeg.kill();
      const url = new URL(request.url || "", `http://${request.headers.host}`);
      const input = url.searchParams.get("v");
      if (input) {
        //设置允许跨域的域名，*代表允许任意域名跨域
        response.setHeader("Access-Control-Allow-Origin","*");
        //跨域允许的header类型
        response.setHeader("Access-Control-Allow-Headers","Content-type,Content-Length,Authorization,Accept,X-Requested-Width");
        //跨域允许的请求方式
        response.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
        //设置响应头信息
        response.setHeader("X-Powered-By",' 3.2.1')
        //让options请求快速返回
        if(response.method == "OPTIONS"){return response.end();}
        ffmpeg.create(input).pipe(response, { end: true });
      }
    });
    server.listen(this.port, () => {
      console.log(`video server listen on ${this.port}`);
    });
  }
}

export default StreamServer;
