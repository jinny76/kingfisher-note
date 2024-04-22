<template>
  <vue3-video-player v-bind="options" controls v-show="initFlag"
                     style="width: 100%; height: 100%;display: flex"
                     ref="playerDom" @play="whenPlay"></vue3-video-player>
</template>

<script lang="js">
import { computed, ref, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import service from "../utils/service";
import noteModel from "../model/note";
import { ElMessage } from "element-plus";

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

    function handleSource() {
      let urlStr = props.urlStr || route.params.path;
      if (urlStr.endsWith("/")) {
        urlStr = urlStr.substring(0, urlStr.length - 1);
      }
      if (urlStr && urlStr.indexOf("://") === -1) {
        if (urlStr.endsWith(".mp4")) {
          urlStr = "kingfisher://" + urlStr.replaceAll("\\", "/");
        } else {
          urlStr = "http://localhost:9555?v=" + encodeURIComponent(urlStr);
          console.log(urlStr);
        }
      }
      return urlStr;
    }

    watch(() => props.urlStr, () => {
      options.value.src = handleSource();
      playVideo();
    });

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
      src: handleSource()
      //aspectRatio: "16:9",
    });

    nextTick(() => {
      if (options.value.src) {
        playVideo();
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
      let video = playerDom.value.$el.childNodes[0];
      video.currentTime = new Number(arg);
    });

    window.electron.ipcRenderer.on("/client/insertContent", function(event, arg) {
      let argObj = JSON.parse(arg);
      insertContent(argObj.type);
    });

    window.electron.ipcRenderer.on("/client/stopVideo", function(event, arg) {
      stopVideo();
    });

    const playVideo = () => {
      let video = playerDom.value.$el.childNodes[0];
      video.play();
    };

    const stopVideo = () => {
      let video = playerDom.value.$el.childNodes[0];
      video.pause();
    };

    return {
      initFlag, options, whenPlay, playerDom, playVideo, stopVideo, insertContent
    };
  }
};

</script>
