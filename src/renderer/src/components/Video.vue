<template>
  <vue3-video-player v-bind="options" controls v-show="initFlag"
                     style="width: 100%; height: 100%;display: flex"
                     ref="playerDom" @play="whenPlay" v-if="contentType === 'video'"></vue3-video-player>
  <webview v-else :src="options.src" style="width: 100%; height: 100%;display: flex" ref="webview"></webview>
</template>

<script lang="js">
import { nextTick, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import service from "../utils/service";
import { ElMessage } from "element-plus";
import utils from "../utils/utils";
import website from "../utils/website";
import noteModel from "../model/note"

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
      crossorigin: "Anonymous",
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

    const contentType = ref("video");

    function handleSource() {
      let urlStr = props.urlStr || route.params.path;
      if (urlStr.endsWith("/")) {
        urlStr = urlStr.substring(0, urlStr.length - 1);
      }
      if (urlStr && urlStr.indexOf("://") === -1) {
        if (urlStr.endsWith(".html") || urlStr.endsWith(".htm") || urlStr.endsWith(".pdf")) {
          contentType.value = "document";
          urlStr = urlStr += "#view=FitH,top";
        } else {
          contentType.value = "video";
          if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
            if (urlStr.endsWith(".mp4") || urlStr.endsWith(".webm") || urlStr.endsWith(".ogg")
              || urlStr.endsWith(".mp3") || urlStr.endsWith(".wav")) {
              urlStr = "kingfisher://" + urlStr.replaceAll("\\", "/");
            } else {
              urlStr = "http://localhost:19555?t=" + new Date().getTime() + "&v=" + encodeURIComponent(urlStr);
              ElMessage.warning("视频格式限制，无法插入时间签和截图");
            }
          }
        }
      } else {
          contentType.value = "website";
      }
      return urlStr;
    }

    watch(() => props.urlStr, () => {
      options.value.src = handleSource();
      afterSetUrl();
    });

    watch(noteModel.currPage, ()=>{
      if (noteModel.currPage.value != null && contentType.value === "document") {
        let urlStr = options.value.src;
        urlStr = urlStr.substring(0, urlStr.indexOf("#"));
        if (urlStr.endsWith(".pdf")) {
          urlStr = urlStr + "#page=" + noteModel.currPage.value + "&view=FitH,top";
          options.value.src = "_blank";
          setTimeout(() => {
            options.value.src = urlStr;
          }, 500);
        }
      }
    })

    const afterSetUrl = () => {
      if (!options.value.src.startsWith("http://") && !options.value.src.startsWith("https://")) {
        nextTick(() => {
          playVideo();
        });
      } else {
        utils.runUntil(() => {
          return webview.value != null;
        }, () => {
          let targetWebsite = website.findWebsite(options.value.src);
          let videoQuery = targetWebsite?.videoId || "video";

          webview.value.executeJavaScript(`
          window.kfsocket = new WebSocket("ws://localhost:18888");

          window.kfsocket.addEventListener("open", function (event) {
          });

          window.kfsocket.addEventListener("message", function (event) {
            console.log("Message from server ", event.data);
            let eventData = JSON.parse(event.data);
            if (eventData.action === "insertContent") {
              if (eventData.args === 'timestamp') {
                let video = document.querySelector("${videoQuery}");
                if (video) {
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', time: video.currentTime}));
                }
              } else if (eventData.args === 'screenshot') {
                let video = document.querySelector("${videoQuery}");
                if (video) {
                  video.crossOrigin = "anonymous";
                  let canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;

                  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', screenshot: canvas.toDataURL()}));
                }
              } else if (eventData.args === 'all') {
                let video = document.querySelector("${videoQuery}");
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
              let video = document.querySelector("${videoQuery}");
              if (video) {
                let argObj = JSON.parse(eventData.args);
                video.currentTime = new Number(argObj.location);
              }
            } else if (eventData.action === "stopVideo") {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                video.pause();
              }
            } else if (eventData.action === "playVideo") {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }
            } else if (eventData.action === "forward") {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                video.currentTime = video.currentTime + 5;
              }
            } else if (eventData.action === "backward") {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                video.currentTime = video.currentTime >= 5 ? video.currentTime - 5 : 0;
              }
            }
          });
      `);
          if (import.meta.env.DEV) {
            webview.value.openDevTools();
          }
          if (targetWebsite?.loadScript) {
            webview.value.executeJavaScript(targetWebsite.loadScript);
          }
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
      if (contentType.value === "video") {
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
      } else if (contentType.value === "website"){
        service.invoke("/note/webInsertContent", type);
      }
    };

    const getScreenshot = (video) => {
      video.crossOrigin = "Anonymous";
      let canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL();
    };

    let locateVideoListener = function(event, arg) {
      console.log("定位视频", arg);
      let argObj = JSON.parse(arg);
      if (contentType.value === "video" && playerDom.value?.$el?.childNodes[0]) {
        let video = playerDom.value.$el.childNodes[0];
        video.currentTime = new Number(argObj.location);
      } else if (contentType.value === "website"){
        service.invoke("/note/webLocateVideo", arg);
      }
    };
    window.electron.ipcRenderer.on("/client/locateVideo", locateVideoListener);

    let insertContentListener = function(event, arg) {
      let argObj = JSON.parse(arg);
      insertContent(argObj.type);
    };
    window.electron.ipcRenderer.on("/client/insertContent", insertContentListener);

    let stopVideoListener = function(event, arg) {
      stopVideo();
    };
    window.electron.ipcRenderer.on("/client/stopVideo", stopVideoListener);

    let playVideoListener = function(event, arg) {
      playVideo();
    };
    window.electron.ipcRenderer.on("/client/playVideo", playVideoListener);

    let forwardListener = function(event, arg) {
      forward();
    };
    window.electron.ipcRenderer.on("/client/forward", forwardListener);

    let backwardListener = function(event, arg) {
      backward();
    };
    window.electron.ipcRenderer.on("/client/backward", backwardListener);

    let changePageListener = function(event, arg) {
      let {page} = JSON.parse(arg);
      noteModel.currPage.value = page;
    };
    window.electron.ipcRenderer.on("/client/changePage", changePageListener);

    const playVideo = () => {
      if (contentType.value === "video") {
        let video = playerDom.value.$el.childNodes[0];
        video.crossOrigin = "Anonymous";
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      } else if (contentType.value === "website"){
        service.invoke("/note/webPlayVideo", "");
      }
    };

    const stopVideo = () => {
      if (contentType.value === "video") {
        let video = playerDom.value.$el.childNodes[0];
        video.pause();
      } else if (contentType.value === "website"){
        service.invoke("/note/webStopVideo", "");
      }
    };

    const forward = () => {
      if (contentType.value === "video") {
        let video = playerDom.value.$el.childNodes[0];
        video.currentTime = video.currentTime + 5;
      } else if (contentType.value === "website"){
        service.invoke("/note/webForward", "");
      }
    };

    const backward = () => {
      if (contentType.value === "video") {
        let video = playerDom.value.$el.childNodes[0];
        video.currentTime = video.currentTime >= 5 ? video.currentTime - 5 : 0;
      } else if (contentType.value === "website"){
        service.invoke("/note/webBackward", "");
      }
    };

    const webview = ref(null);

    onUnmounted(() => {
      if (webview.value) {
        webview.value.executeJavaScript(`
          window.kfsocket.close();
        `);
      }
      window.electron.ipcRenderer.removeListener("/client/locateVideo", locateVideoListener);
      window.electron.ipcRenderer.removeListener("/client/insertContent", insertContentListener);
      window.electron.ipcRenderer.removeListener("/client/stopVideo", stopVideoListener);
      window.electron.ipcRenderer.removeListener("/client/playVideo", playVideoListener);
      window.electron.ipcRenderer.removeListener("/client/forward", forwardListener);
      window.electron.ipcRenderer.removeListener("/client/backward", backwardListener);
      window.electron.ipcRenderer.removeListener("/client/changePage", changePageListener);
    });

    return {
      initFlag, options, whenPlay, playerDom, playVideo, stopVideo, insertContent, contentType, webview,
      forward, backward
    };
  }
};

</script>
