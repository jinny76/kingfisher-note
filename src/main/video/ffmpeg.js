import ffmpeg from 'fluent-ffmpeg';
import {captureAudio} from './server';

class Ffmepg {

  constructor() {
    this.instance = null;
  }

  init() {
    ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path);
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
          console.log('Timemark: ' + progress.timemark);
        }).
        on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        }).
        on('end', function() {
          console.log('Processing finished!');
        });
    return this.instance;
  }

  captureAudio(input, audioc = 'copy') {
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
            console.log('Timemark: ' + progress.timemark);
          }).
          on('error', function(err) {
            console.log('An error occurred: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            console.log('Processing finished!');
            resolve();
          }).
          save(`${input}.mp3`);
    });
  }

  convert(input, videoc = 'copy', audioc = 'copy') {
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
            console.log('Timemark: ' + progress.timemark);
          }).
          on('error', function(err) {
            console.log('An error occurred: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            console.log('Processing finished!');
            resolve();
          }).
          save(`${input}.mp4`);
    });
  }

  webmFix(input) {
    return new Promise((resolve, reject) => {
      this.instance = ffmpeg().
          input(input).
          videoCodec('copy').
          audioCodec('copy').
          format('webm').
          on('progress', function(progress) {
            console.log('Timemark: ' + progress.timemark);
          }).
          on('error', function(err) {
            console.log('An error occurred: ' + err.message);
            reject(err);
          }).
          on('end', function() {
            console.log('Processing finished!');
            resolve();
          }).
          save(`${input.replace('.webm', '.fixed.webm')}`);
    });
  }

  kill() {
    this.instance?.kill('');
  }
}

export default Ffmepg;
