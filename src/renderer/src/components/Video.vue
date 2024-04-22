<template>
  <vue3-video-player v-bind="options" controls v-show="initFlag"
                     style="width: 100%; height: 100%;display: flex"
                     ref="playerDom" @play="whenPlay" v-if="isVideo"></vue3-video-player>
  <webview v-else :src="options.src" style="width: 100%; height: 100%;display: flex" ref="webview"></webview>
</template>

<script lang="js">
import { computed, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import service from "../utils/service";
import noteModel from "../model/note";
import { ElMessage } from "element-plus";
import utils from "../utils/utils";

export default {
  name: "Home",
  props: {
    urlStr: {
      type: String
    }
  },
  emits: [],
  components: {},
  setup(props, { emit }) {
    let route = useRoute();
    const initFlag = ref(true);
    const options = ref({
      muted: false,
      webFullScreen: true,
      speedRate: ["0.75", "1.0", "1.25", "1.5", "2.0"],
      autoPlay: false,
      loop: true,
      mirror: false,
      lightOff: false,
      control: false,
      title: route.params.path,
      src: ""
      //aspectRatio: "16:9",
    });

    const isVideo = ref(true);

    function handleSource() {
      let urlStr = props.urlStr || route.params.path;
      if (urlStr.endsWith("/")) {
        urlStr = urlStr.substring(0, urlStr.length - 1);
      }
      if (urlStr && urlStr.indexOf("://") === -1) {
        isVideo.value = true;
        if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
          if (urlStr.endsWith(".mp4")) {
            urlStr = "kingfisher://" + urlStr.replaceAll("\\", "/");
          } else {
            urlStr = "http://localhost:9555?v=" + encodeURIComponent(urlStr);
            console.log(urlStr);
          }
        }
      } else {
        isVideo.value = false;
      }
      return urlStr;
    }

    watch(() => props.urlStr, () => {
      options.value.src = handleSource();
      afterSetUrl();
    });

    const afterSetUrl = () => {
      if (!options.value.src.startsWith("http://") && !options.value.src.startsWith("https://")) {
        nextTick(() => {
          playVideo();
        });
      } else {
        utils.runUntil(() => {
          return webview.value != null;
        }, () => {
          webview.value.executeJavaScript(`
          window.kfsocket = new WebSocket("ws://localhost:18888");

          window.kfsocket.addEventListener("open", function (event) {
          });

          window.kfsocket.addEventListener("message", function (event) {
            console.log("Message from server ", event.data);
            let eventData = JSON.parse(event.data);
            if (eventData.action === "insertContent") {
              if (eventData.args === 'timestamp') {
                let video = document.querySelector("video");
                if (video) {
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', time: video.currentTime}));
                }
              } else if (eventData.args === 'screenshot') {
                let video = document.querySelector("video");
                if (video) {
                  video.crossOrigin = "anonymous";
                  let canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;

                  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', screenshot: canvas.toDataURL()}));
                }
              } else if (eventData.args === 'all') {
                let video = document.querySelector("video");
                if (video) {
                  video.crossOrigin = "anonymous";
                  let canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;

                  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', time: video.currentTime, screenshot: canvas.toDataURL()}));
                }
              }
            } else if (eventData.action === "locateVideo") {
              let video = document.querySelector("video");
              if (video) {
                video.currentTime = new Number(eventData.args);
              }
            } else if (eventData.action === "stopVideo") {
              let video = document.querySelector("video");
              if (video) {
                video.pause();
              }
            } else if (eventData.action === "playVideo") {
              let video = document.querySelector("video");
              if (video) {
                video.play();
              }
            }
          });
      `);
          //webview.value.openDevTools();
          webview.value.executeJavaScript(`
            let timer = setInterval(() => {
              let button = document.querySelector(".bpx-player-ctrl-web");
              if (button) {
                clearInterval(timer);
                button.click();
              }
            }, 1000);
          `);
        });
      }
    };

    options.value.src = handleSource();
    nextTick(() => {
      if (options.value.src) {
        afterSetUrl();
      }
    });

    const playerDom = ref(null);

    const whenPlay = () => {
      let cover = playerDom.value.$el.querySelector(".play-pause-layer");
      if (!cover.added) {
        cover.addEventListener("dblclick", () => {
          insertContent();
        });
        cover.added = true;
      }
    };

    const insertContent = (type = "all") => {
      if (isVideo.value) {
        let video = playerDom.value.$el.childNodes[0];
        if (video) {
          let data = {};

          if (type === "timestamp" || type === "all") {
            data.time = video.currentTime;
          }

          if (type === "screenshot" || type === "all") {
            data.screenshot = getScreenshot(video);
          }

          service.invoke("/note/insertAll", JSON.stringify(data));
        } else {
          ElMessage.error("视频未加载");
        }
      } else {
        service.invoke("/note/webInsertContent", type);
      }
    };

    const getScreenshot = (video) => {
      video.crossOrigin = "anonymous";
      let canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL();
    };

    window.electron.ipcRenderer.on("/client/locateVideo", function(event, arg) {
      console.log("定位视频", arg);
      if (isVideo.value) {
        let video = playerDom.value.$el.childNodes[0];
        video.currentTime = new Number(arg);
      } else {
        service.invoke("/note/webLocateVideo", arg);
      }
    });

    window.electron.ipcRenderer.on("/client/insertContent", function(event, arg) {
      let argObj = JSON.parse(arg);
      insertContent(argObj.type);
    });

    window.electron.ipcRenderer.on("/client/stopVideo", function(event, arg) {
      stopVideo();
    });

    const playVideo = () => {
      if (isVideo.value) {
        let video = playerDom.value.$el.childNodes[0];
        video.play();
      } else {
        service.invoke("/note/webPlayVideo", "");
      }
    };

    const stopVideo = () => {
      if (isVideo.value) {
        let video = playerDom.value.$el.childNodes[0];
        video.pause();
      } else {
        service.invoke("/note/webStopVideo", "");
      }
    };

    const webview = ref(null);

    return {
      initFlag, options, whenPlay, playerDom, playVideo, stopVideo, insertContent, isVideo, webview
    };
  }
};

</script>
