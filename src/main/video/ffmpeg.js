import ffmpeg from "fluent-ffmpeg";

class Ffmepg {

  constructor() {
    this.instance = null
  }

  init() {
    ffmpeg.setFfmpegPath(require('@ffmpeg-installer/ffmpeg').path)
  }

  create(input) {
    this.instance = ffmpeg()
      .input(input)
      .nativeFramerate()
      .videoCodec('libx264')
      .audioCodec('mp3')
      .format('mp4')
      .outputOptions('-movflags', 'frag_keyframe+empty_moov+faststart')
      .on('progress', function (progress) {
        console.log('Timemark: ' + progress.timemark)
      })
      .on('error', function (err) {
        console.log('An error occurred: ' + err.message)
      })
      .on('end', function () {
        console.log('Processing finished!')
      })
    return this.instance
  }

  kill() {
    this.instance?.kill('')
  }
}

export default Ffmepg
