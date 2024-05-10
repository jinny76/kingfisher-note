import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const log = require('electron-log');

class Ffmepg {

  constructor() {
    this.instance = null;
  }

  init(processCb) {
    //ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
    ffmpeg.setFfmpegPath('./resources/ffmpeg/ffmpeg');
    this.processCb = processCb;
  }

  create(input) {
    this.instance = ffmpeg().
        input(input).
        nativeFramerate().
        videoCodec('libx264').
        audioCodec('mp3').
        format('mp4').
        outputOptions('-movflags', 'frag_keyframe+empty_moov+faststart').
        on('progress', function(progress) {
          log.log('处理时间: ' + progress.timemark);
        }).
        on('error', function(err) {
          log.log('发生错误: ' + err.message);
        }).
        on('end', function() {
          log.log('处理完成');
        });
    return this.instance;
  }

  captureAudio(input, audioc = 'copy') {
    const _self = this;
    return new Promise((resolve, reject) => {
      if (audioc === 'mp3') {
        audioc = 'libmp3lame';
      }
      if (audioc == null) {
        audioc = 'copy';
      }
      this.instance = ffmpeg().
          input(input).
          audioCodec(audioc).
          on('progress', function(progress) {
            log.log('处理时间: ' + progress.timemark);
            if (_self.processCb) {
              _self.processCb(progress.percent, progress.timemark);
            }
          }).
          on('error', function(err) {
            log.log('发生错误: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            log.log('处理完成');
            resolve();
          }).
          save(`${input}.mp3`);
    });
  }

  convert(input, videoc = 'copy', audioc = 'copy') {
    const _self = this;
    return new Promise((resolve, reject) => {
      if (videoc === 'h264') {
        videoc = 'libx264';
      }
      if (videoc == null) {
        videoc = 'copy';
      }
      if (audioc === 'mp3') {
        audioc = 'libmp3lame';
      }
      if (audioc == null) {
        audioc = 'copy';
      }
      this.instance = ffmpeg().
          input(input).
          videoCodec(videoc).
          audioCodec(audioc).
          format('mp4').
          on('progress', function(progress) {
            log.log('处理时间: ' + progress.timemark);
            if (_self.processCb) {
              _self.processCb(progress.percent, progress.timemark);
            }
          }).
          on('error', function(err) {
            log.log('发生错误: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            log.log('处理完成');
            resolve();
          }).
          save(`${input}.mp4`);
    });
  }

  splitAudio(input) {
    const _self = this;
    return new Promise((resolve, reject) => {
      let tempDir = Date.now().toString();
      fs.mkdirSync(tempDir, {recursive: true});
      this.instance = ffmpeg().
          input(input).
          audioCodec('copy').
          outputOptions('-f', 'segment', '-segment_time', '20').
          on('progress', function(progress) {
            if (_self.processCb) {
              _self.processCb(progress.percent, progress.timemark);
            }
            log.log('处理时间: ' + progress.timemark);
          }).
          on('error', function(err) {
            log.log('发生错误: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            log.log('处理完成');
            resolve(tempDir);
          }).
          save(`${tempDir}/out%03d.${input.substring(
              input.lastIndexOf('.') + 1)}`);
    });
  }

  webmFix(input) {
    const _self = this;
    return new Promise((resolve, reject) => {
      this.instance = ffmpeg().
          input(input).
          videoCodec('copy').
          audioCodec('copy').
          format('webm').
          on('progress', function(progress) {
            if (_self.processCb) {
              _self.processCb(progress.percent, progress.timemark);
            }
            log.log('处理时间: ' + progress.timemark);
          }).
          on('error', function(err) {
            log.log('发生错误: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            log.log('处理完成');
            resolve();
          }).
          save(`${input.replace('.webm', '.fixed.webm')}`);
    });
  }

  fetchStream(input) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(input, function(err, metadata) {
        if (err) {
          reject(err);
        } else {
          if (metadata.streams) {
            resolve(metadata.streams);
          } else {
            reject('没有流信息');
          }
        }
      });
    });
  }

  extractSubtitle(input) {
    const _self = this;
    return new Promise((resolve, reject) => {
      this.instance = ffmpeg().
          input(input.path).
          outputOptions('-map', '0:' + input.index).
          on('progress', function(progress) {
            if (_self.processCb) {
              _self.processCb(progress.percent, progress.timemark);
            }
            log.log('处理时间: ' + progress.timemark);
          }).
          on('error', function(err) {
            log.log('发生错误: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            log.log('处理完成');
            resolve(`${input.path}.${input.title}.${input.codecName}`);
          }).
          save(`${input.path}.${input.title}.${input.codecName}`);
    });
  }

  kill() {
    this.instance?.kill('');
  }
}

export default Ffmepg;
