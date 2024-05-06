// config.resourceType            :媒体类型(可传'system'|'device'指定获取系统/麦克风声音)
// config.bufferHanduler          :buffer处理回调函数
// config.getMediaSuccessCallback :获取媒体设备(系统声道或这麦克风)成功后的回调函数
// config.errorHanduler           :异常处理函数

class Recorder {
  constructor(desktopCapturer, config) {
    this.audioContext = null;
    this.desktopCapturer = desktopCapturer; // electron的desktopCapturer对象
    this.config = config;
  }

  start() {
    if (this.audioContext && this.audioContext.state == 'running') {
      this.stop();
    }
    if (!(navigator.getUserMedia && AudioContext)) {
      return false;
    }

    if (!this.AudioContext || this.audioContext.state == 'closed') {
      this.audioContext = new AudioContext();
      // audioContext.onstatechange = function(e){
      //     console.log(e);
      // }
      let audioNode = this.audioContext.createScriptProcessor(0, 1, 1);

      let _self = this;
      let getMediaSuccess = function(stream) {
        console.log('success get ===========');
        let mediaSource = _self.audioContext.createMediaStreamSource(stream);

        mediaSource.connect(audioNode);
        audioNode.connect(_self.audioContext.destination);

        audioNode.onaudioprocess = (e) => {
          // 好了，这里就获取到了音频流的buffer，你可以为所欲为了，嘿嘿。。
          // 我这里发给另个一个线程把buffer转成pcm编码
          _self.config.bufferHanduler &&
          _self.config.bufferHanduler(e.inputBuffer.getChannelData(0));

        };

        // 获取媒体成功,执行回调
        _self.config.getMediaSuccessCallback &&
        _self.config.getMediaSuccessCallback();
      };

      // 获取音视频媒体
      // 系统音频流
      if (this.config.resourceType == 'system') {
        this.desktopCapturer.getSources(
            {types: ['screen']},
        ).then(async sources => {
          for (const source of sources) {
            console.log(source.name);
            if (source.name === 'Entire screen' || source.name ===
                'Entire Screen') {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    mandatory: {
                      // cursor:"never",
                      chromeMediaSource: 'desktop',
                    },
                  },
                  audio: {
                    mandatory: {
                      chromeMediaSource: 'desktop',
                    },
                  },
                });
                getMediaSuccess(stream);
              } catch (err) {
                this.config.errorHanduler && this.config.errorHanduler(err);
              }
            }
          }
        });
        // 麦克风音频流
      } else if (this.config.resourceType == 'device') {
        navigator.mediaDevices.getUserMedia({video: false, audio: true}).
            then(function(stream) {
              if (!stream) {
                this.config.errorHanduler && this.config.errorHanduler(
                    '读取设备失败，请确认你的设备是否已经正确连接好麦克风设备！');
                return;
              }
              getMediaSuccess(stream);
            }).
            catch(function(err) {
              this.config.errorHanduler && this.config.errorHanduler(err);
            });
      } else {
        this.config.errorHanduler && this.config.errorHanduler('不支持此类型!');
      }
    }
  }

  stop() {
    try {
      this.audioContext.close();
    } catch (e) {
      console.log(e);
    }
  }

  restart() {
    if (this.audioContext && this.audioContext.state == 'running') {
      this.stop();
    }
    this.start();
  }

}

export default Recorder;