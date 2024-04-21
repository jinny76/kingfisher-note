<template>
  <vue3-video-player v-bind="options" controls v-show="initFlag"
                     style="width: 100%; height: 100%;display: flex"
                     ref="playerDom" @play="whenPlay"></vue3-video-player>
</template>

<script lang="js">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import service from "../utils/service";
import noteModel from "../model/note";

export default {
  name: "Home",
  props: {
    urlStr : {
      type: String
    }
  },
  emits: [],
  components: {},
  setup (props, {emit}) {
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
          console.log(urlStr)
        }
      }
      return urlStr;
    }

    watch(()=> props.urlStr, () => {
      options.value.src = handleSource();
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

    const playerDom = ref(null);

    const whenPlay = () => {
      let cover = playerDom.value.$el.querySelector(".play-pause-layer");
      if (!cover.added) {
        cover.addEventListener("dblclick", () => {
          let video = playerDom.value.$el.childNodes[0];
          service.invoke("/note/insertAll", JSON.stringify({
            time: video.currentTime,
            screenshot: getScreenshot(video)
          }));
        });
        cover.added = true;
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

    window.electron.ipcRenderer.on('/client/locateVideo', function(event, arg) {
      console.log("定位视频", arg);
      let video = playerDom.value.$el.childNodes[0];
      video.currentTime = new Number(arg);
    });

    return {
      initFlag, options, whenPlay, playerDom
    };
  }
};

</script>
