<template>
  <div class="toolbar" id="idToolbar" v-show="contentType === 'video'">
    <div class="panel">
      <el-button title="插入时间" @click="insertContent('timestamp')" v-if="!embed" >
        <svg class="icon" height="20" p-id="5255" t="1713751961582" version="1.1"
             viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M512 1022.060606c281.69697 0 510.060606-228.363636 510.060606-510.060606S793.69697 1.939394 512 1.939394 1.939394 230.30303 1.939394 512 230.30303 1022.060606 512 1022.060606z m0-58.181818c-249.565091 0-451.878788-202.313697-451.878788-451.878788C60.121212 262.434909 262.434909 60.121212 512 60.121212c249.565091 0 451.878788 202.313697 451.878788 451.878788 0 249.565091-202.313697 451.878788-451.878788 451.878788z"
            fill="#FFFFFF" p-id="5256"></path>
          <path
            d="M326.120727 363.368727l166.787879 174.545455a29.090909 29.090909 0 1 0 42.061576-40.192l-166.787879-174.545455A29.090909 29.090909 0 0 0 326.120727 363.364848z"
            fill="#FFFFFF" p-id="5257"></path>
          <path
            d="M876.625455 665.755152l-347.849697-172.070788a29.090909 29.090909 0 1 0-25.79394 52.146424l347.845818 172.070788a29.090909 29.090909 0 0 0 25.79394-52.150303z"
            fill="#FFFFFF" p-id="5258"></path>
        </svg>
      </el-button>
      <el-button title="插入截图" @click="insertContent('screenshot')" v-if="!embed" >
        <svg class="icon" height="20" p-id="13508" t="1713752087666" version="1.1"
             viewBox="0 0 1280 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1184 1024H96c-52.928 0-96-43.072-96-96V96c0-52.928 43.072-96 96-96h1088c52.928 0 96 43.072 96 96v832c0 52.928-43.072 96-96 96zM128 128v768l297.376-297.376a32.096 32.096 0 0 1 45.248 0L576 704 1152 128H128z m224 320a96 96 0 1 1 0-192 96 96 0 0 1 0 192z"
            fill="#FFFFFF" p-id="13509"></path>
        </svg>
      </el-button>
      <el-button title="插入时间和截图" @click="insertContent('all')" v-if="!embed" >
        <svg class="icon" height="20" p-id="18671" t="1713752331119" version="1.1"
             viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M128 128h384v224l32 32H768v64h64V307.2l-9.6-23.04-209.92-211.2L590.08 64H96l-32 32v832l32 32H320v-64H128V128z m448 0l192 192H576V128z m352 384h-512l-32 32v384l32 32h512l32-32v-384l-32-32zM896 576v256l-104.32-102.4h-45.44l-74.24 74.88-136.32-136.32h-45.44L448 710.4V576h448z m-179.2 273.28l51.84-51.84L867.2 896h-103.68l-46.72-46.72zM448 896v-95.36l64-64L673.28 896H448z m352-224a32 32 0 1 0 0-64 32 32 0 0 0 0 64z"
            fill="#FFFFFF" p-id="18672"></path>
        </svg>
      </el-button>
      <el-button title="快进" @click="forward" v-if="!embed" >
        <svg class="icon" height="20" p-id="5223" t="1713840577418" version="1.1"
             viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-981.333333a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m213.333333 640a21.333333 21.333333 0 0 1-21.333333-21.333334v-112.170666l-224.277333 130.645333c-0.213333 0.128-0.448 0-0.661334 0.234667a21.077333 21.077333 0 0 1-4.864 1.642666 22.144 22.144 0 0 1-3.648 0.746667c-0.426667 0-0.789333 0.234667-1.216 0.234667a19.2 19.2 0 0 1-2.496-0.512 19.648 19.648 0 0 1-4.586666-0.917334 21.930667 21.930667 0 0 1-3.178667-1.557333 16.789333 16.789333 0 0 1-6.4-5.525333 22.634667 22.634667 0 0 1-1.877333-2.133334c-0.234667-0.405333-0.213333-0.853333-0.426667-1.258666a33.898667 33.898667 0 0 1-2.133333-8.128c0-0.448-0.256-0.832-0.256-1.28v-62.464l-138.944 80.938666c-0.213333 0.128-0.448 0-0.682667 0.234667a20.565333 20.565333 0 0 1-4.842667 1.642667 22.144 22.144 0 0 1-3.648 0.746666c-0.426667 0-0.789333 0.234667-1.216 0.234667a19.2 19.2 0 0 1-2.496-0.512 19.648 19.648 0 0 1-4.586666-0.917333 21.930667 21.930667 0 0 1-3.178667-1.557334 16.789333 16.789333 0 0 1-6.4-5.525333 22.634667 22.634667 0 0 1-1.877333-2.133333c-0.234667-0.405333-0.213333-0.853333-0.426667-1.258667a33.898667 33.898667 0 0 1-2.133333-8.128c0-0.448-0.256-0.832-0.256-1.28V362.666667c0-0.448 0.234667-0.832 0.256-1.28a33.898667 33.898667 0 0 1 2.133333-8.128c0.213333-0.405333 0.192-0.853333 0.426667-1.258667a19.968 19.968 0 0 1 1.877333-2.133333 23.104 23.104 0 0 1 9.536-7.082667 19.648 19.648 0 0 1 4.586667-0.917333A19.2 19.2 0 0 1 298.666667 341.333333c0.426667 0 0.789333 0.213333 1.216 0.234667a20.138667 20.138667 0 0 1 3.648 0.746667 20.565333 20.565333 0 0 1 4.842666 1.642666c0.234667 0.128 0.469333 0 0.682667 0.234667L448 425.130667V362.666667c0-0.448 0.234667-0.832 0.256-1.28a33.898667 33.898667 0 0 1 2.133333-8.128c0.213333-0.405333 0.192-0.853333 0.426667-1.258667a19.968 19.968 0 0 1 1.877333-2.133333 23.104 23.104 0 0 1 9.536-7.082667 19.648 19.648 0 0 1 4.586667-0.917333A19.2 19.2 0 0 1 469.333333 341.333333c0.426667 0 0.789333 0.213333 1.216 0.234667a20.138667 20.138667 0 0 1 3.648 0.746667 21.077333 21.077333 0 0 1 4.864 1.642666c0.213333 0.128 0.448 0 0.661334 0.234667L704 474.837333V362.666667a21.333333 21.333333 0 0 1 42.666667 0v298.666666a21.333333 21.333333 0 0 1-21.333334 21.333334z m-277.333333-208.277334l-128-74.666666v224.341333l128-74.666667v-75.221333z m42.666667-74.666666V624.213333L683.221333 512z"
            fill="#FFFFFF" p-id="5224"></path>
        </svg>
      </el-button>
      <el-button title="倒退" @click="backward" v-if="!embed" >
        <svg class="icon" height="20" p-id="1220" t="1713840644659" version="1.1"
             viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-981.333333a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m233.557333 624.106666a20.586667 20.586667 0 0 1-1.301333 3.968c-0.213333 0.405333-0.192 0.853333-0.426667 1.258667a20.288 20.288 0 0 1-1.877333 2.133333 20.864 20.864 0 0 1-2.645333 3.008 20.096 20.096 0 0 1-3.733334 2.517334 20.672 20.672 0 0 1-3.157333 1.557333 19.648 19.648 0 0 1-4.586667 0.917333A19.2 19.2 0 0 1 725.333333 682.666667c-0.426667 0-0.789333-0.213333-1.216-0.234667a22.144 22.144 0 0 1-3.648-0.746667 21.077333 21.077333 0 0 1-4.864-1.642666c-0.213333-0.128-0.448 0-0.661333-0.234667L576 598.869333V661.333333c0 0.448-0.234667 0.832-0.256 1.28a20.309333 20.309333 0 0 1-0.853333 4.16 20.586667 20.586667 0 0 1-1.301334 3.968c-0.213333 0.405333-0.192 0.853333-0.426666 1.258667a20.288 20.288 0 0 1-1.877334 2.133333 20.864 20.864 0 0 1-2.645333 3.008 20.096 20.096 0 0 1-3.733333 2.517334 20.672 20.672 0 0 1-3.157334 1.557333 19.648 19.648 0 0 1-4.586666 0.917333A19.2 19.2 0 0 1 554.666667 682.666667c-0.426667 0-0.789333-0.213333-1.216-0.234667a22.144 22.144 0 0 1-3.648-0.746667 21.077333 21.077333 0 0 1-4.864-1.642666c-0.213333-0.128-0.448 0-0.661334-0.234667L320 549.162667V661.333333a21.333333 21.333333 0 0 1-42.666667 0V362.666667a21.333333 21.333333 0 0 1 42.666667 0v112.170666l224.277333-130.645333c0.213333-0.128 0.448 0 0.661334-0.234667a21.077333 21.077333 0 0 1 4.864-1.642666 20.138667 20.138667 0 0 1 3.648-0.746667c0.426667 0 0.789333-0.234667 1.216-0.234667a19.2 19.2 0 0 1 2.496 0.512 19.648 19.648 0 0 1 4.586666 0.917334 21.930667 21.930667 0 0 1 3.178667 1.557333 16.789333 16.789333 0 0 1 6.4 5.525333 20.288 20.288 0 0 1 1.877333 2.133334c0.234667 0.405333 0.213333 0.853333 0.426667 1.258666a20.586667 20.586667 0 0 1 1.301333 3.968 20.309333 20.309333 0 0 1 0.853334 4.16c0 0.448 0.256 0.832 0.256 1.28v62.464l138.944-80.938666c0.213333-0.128 0.448 0 0.661333-0.234667a21.077333 21.077333 0 0 1 4.864-1.642667 20.138667 20.138667 0 0 1 3.648-0.746666c0.426667 0 0.789333-0.234667 1.216-0.234667a19.2 19.2 0 0 1 2.496 0.512 19.648 19.648 0 0 1 4.586667 0.917333 21.930667 21.930667 0 0 1 3.178666 1.557334 16.789333 16.789333 0 0 1 6.4 5.525333 20.288 20.288 0 0 1 1.877334 2.133333c0.234667 0.405333 0.213333 0.853333 0.426666 1.258667a20.586667 20.586667 0 0 1 1.301334 3.968 20.309333 20.309333 0 0 1 0.853333 4.16c0 0.448 0.256 0.832 0.256 1.28v298.666667c0 0.448-0.234667 0.832-0.256 1.28a20.309333 20.309333 0 0 1-0.938667 4.202666zM533.333333 426.666667v-26.837334L340.778667 512 533.333333 624.170667V426.666667z m170.666667-26.837334l-128 74.666667v75.221333l128 74.666667V399.829333z"
            fill="#FFFFFF" p-id="1221"></path>
        </svg>
      </el-button>
      <el-button title="录音" @click="record('audio')">
        <svg class="icon" height="20" p-id="27366" t="1714691109678" version="1.1"
             viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M512 624.298667c70.826667 0 127.573333-60.16 127.573333-134.741334L640 220.074667C640 145.493333 582.826667 85.333333 512 85.333333S384 145.493333 384 220.074667v269.482666c0 74.538667 57.173333 134.741333 128 134.741334z m226.133333-134.741334a226.858667 226.858667 0 0 1-226.133333 229.034667c-117.76 0-226.133333-94.293333-226.133333-229.034667H213.333333c0 153.173333 116.053333 279.808 256 301.781334V938.666667h85.333334v-147.328c139.946667-21.546667 256-148.181333 256-301.781334h-72.533334z"
            fill="#FFFFFF" p-id="27367"></path>
        </svg>
      </el-button>
      <el-button title="录像" @click="record('video')" v-if="!embed" >
        <svg class="icon" height="20" p-id="35629" t="1714691217630" version="1.1"
             viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M923.569231 257.969231l-216.615385 155.569231v-110.276924c0-29.538462-23.630769-53.169231-53.169231-53.16923H92.553846c-29.538462 0-53.169231 23.630769-53.169231 53.16923v419.446154c0 29.538462 23.630769 53.169231 53.169231 53.169231h563.2c29.538462 0 53.169231-23.630769 53.169231-53.169231v-108.307692L923.569231 768c13.784615 13.784615 37.415385 3.938462 37.415384-15.753846V273.723077c0-19.692308-23.630769-29.538462-37.415384-15.753846z"
            fill="#FFFFFF" p-id="35630"></path>
        </svg>
      </el-button>
      <el-button v-if="extendButtons.captureSubtitle" title="抓取字幕" @click="captureSubtitle">
        <svg class="icon" height="20" p-id="5662" t="1714908048845" version="1.1"
             viewBox="0 0 1105 1024" width="20" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M154.74688 883.69152C91.99616 883.69152 40.96 832 40.96 768.43008V115.26144C40.96 51.69152 91.99616 0 154.74688 0h796.42624C1013.92384 0 1064.96 51.69152 1064.96 115.26144v286.88384c0 21.21728-16.9984 38.44096-37.92896 38.44096-20.95104 0-62.8736-17.22368-62.8736-38.44096V140.63616c0-21.17632-13.76256-38.99392-34.67264-38.99392H173.6704c-20.8896 0-31.82592 17.8176-31.82592 38.99392v609.30048c0 21.1968 10.91584 30.59712 31.82592 30.59712H651.0592c20.93056 0 37.92896 43.52 37.92896 64.7168 0 21.23776-16.9984 38.44096-37.92896 38.44096H154.74688zM951.33696 576.512h-34.97984v303.77984c0 6.71744 0.57344 11.9808 1.80224 15.74912 1.20832 3.76832 3.21536 6.71744 6.02112 8.82688 2.80576 2.08896 7.04512 4.1984 12.67712 6.28736 5.632 2.10944 12.0832 3.15392 19.29216 3.15392h19.31264v16.32256c0 6.32832-5.05856 11.44832-11.30496 11.44832H788.8896a11.3664 11.3664 0 0 1-11.264-11.4688v-16.30208h22.89664c7.22944 0 13.27104-0.63488 18.08384-1.88416 4.83328-1.26976 8.84736-3.56352 12.0832-6.92224 3.21536-3.35872 5.40672-6.9632 6.61504-10.71104 1.20832-3.80928 1.8432-9.03168 1.8432-15.7696V576.512H811.4176c-8.86784 0-15.89248 0.8192-21.13536 2.4576-5.2224 1.59744-17.408 3.19488-24.33024 11.18208 0 0-11.55072 7.72096-16.0768 14.336-4.52608 6.63552-6.84032 19.7632-8.45824 28.71296l-4.8128 25.68192-2.41664 8.56064h-16.87552v-121.77408c0-7.65952 6.144-13.88544 13.70112-13.88544h288.52224c7.65952 0 13.824 6.2464 13.824 13.98784v121.67168h-18.10432l-2.39616-14.68416c-1.6384-8.94976-5.67296-45.60896-14.49984-54.35392-14.76608-14.7456-28.32384-17.6128-28.32384-17.6128a38.58432 38.58432 0 0 0-18.69824-4.3008z"
            fill="#EEEEEE" p-id="5663"></path>
        </svg>
      </el-button>
      <el-input v-model="content" style="margin-left: 20px; width: 400px;" @keydown="enterNote" @keydown.enter="send">
        <template #prefix>
          笔记>&nbsp;
        </template>
      </el-input>
    </div>
  </div>
  <div v-show="recording" class="record blink" id="idRecording">
    <svg class="icon" height="20" p-id="14885" t="1714691020090" version="1.1"
         viewBox="0 0 1024 1024" width="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M512 0a512 512 0 1 1 0 1024A512 512 0 0 1 512 0z m0 64a448 448 0 1 0 0 896A448 448 0 0 0 512 64z"
            fill="#FF0000" p-id="14886"></path>
      <path d="M512 512m-309.312 0a309.312 309.312 0 1 0 618.624 0 309.312 309.312 0 1 0-618.624 0Z" fill="#FF0000"
            p-id="14887"></path>
    </svg>
  </div>
  <vue3-video-player v-show="contentType === 'video' && initFlag" ref="playerDom"
                     controls
                     style="width: 100%; height: 100%;display: flex" v-bind="options"
                     @play="whenPlay"></vue3-video-player>
  <webview v-show="contentType === 'website' || contentType === 'document'" ref="webview" :src="options.src" style="width: 100%; height: 100%;display: flex"></webview>
</template>

<script lang="js">
import {nextTick, onUnmounted, ref, watch, onMounted} from 'vue';
import {useRoute} from 'vue-router';
import service from '../utils/service';
import {ElMessage, ElMessageBox} from 'element-plus';
import utils from '../utils/utils';
import website from '../utils/website';
import noteModel from '../model/note';

export default {
  name: 'Home',
  props: {
    urlStr: {
      type: String,
    },
    embed: {
      type: Boolean,
      default: false,
    },
  },
  emits: [],
  components: {},
  setup(props, {emit}) {
    const developEnv = import.meta.env.DEV;

    let route = useRoute();
    const initFlag = ref(true);
    const options = ref({
      crossorigin: 'Anonymous',
      muted: false,
      webFullScreen: true,
      speedRate: ['0.75', '1.0', '1.25', '1.5', '2.0'],
      autoPlay: false,
      loop: true,
      mirror: false,
      lightOff: false,
      control: false,
      title: route.params.path,
      src: '',
      //aspectRatio: "16:9",
    });

    const contentType = ref('video');
    const extendButtons = ref({
      captureSubtitle: false,
    });

    function handleSource() {
      let urlStr = props.urlStr || route.params.path;
      if (urlStr.endsWith('/')) {
        urlStr = urlStr.substring(0, urlStr.length - 1);
      }
      if (urlStr && urlStr.indexOf('://') === -1) { // 本地文件
        if (urlStr.endsWith('.html') || urlStr.endsWith('.htm') || urlStr.endsWith('.pdf')) {
          contentType.value = 'document';
          urlStr = 'kingfisher://' + urlStr.replaceAll('\\', '/');
        } else {
          contentType.value = 'video';
          if (urlStr.endsWith('.mp4') || urlStr.endsWith('.webm') || urlStr.endsWith('.ogg')
            || urlStr.endsWith('.mp3') || urlStr.endsWith('.wav')) {
            urlStr = 'kingfisher://' + urlStr.replaceAll('\\', '/');
          } else {
            urlStr = 'http://localhost:19555?t=' + new Date().getTime() + '&v=' + encodeURIComponent(urlStr);
            ElMessage.warning('视频格式限制，无法插入时间签和截图');
          }
        }
      } else { // 网络文件
        contentType.value = 'website';
        if (urlStr.startsWith('vhttp')) {
          urlStr = urlStr.substring(1);
        }
      }
      return urlStr;
    }

    watch(() => props.urlStr, () => {
      options.value.src = handleSource();
      afterSetUrl();
    });

    watch(noteModel.currPage, () => {
      if (noteModel.currPage.value != null && contentType.value === 'document') {
        let urlStr = options.value.src;
        if (urlStr.indexOf('#') !== -1) {
          urlStr = urlStr.substring(0, urlStr.indexOf('#'));
        }
        if (urlStr.endsWith('.pdf')) {
          urlStr = urlStr + '#page=' + noteModel.currPage.value + '&view=FitH,top';
          options.value.src = '_blank';
          setTimeout(() => {
            options.value.src = urlStr;
          }, 500);
        }
      }
    });

    onMounted(() => {
      if (noteModel.setting.value.displayMode === "same") {
        let toolbar = document.querySelector("#idToolbar");
        toolbar.style.top = "40px";
        toolbar.style.width = "30%";

        let recording = document.querySelector("#idRecording");
        recording.style.top = "40px";
      }
    });

    const afterSetUrl = () => {
      if (!options.value.src.startsWith('http://') && !options.value.src.startsWith('https://')) {
        nextTick(() => playVideo());
      } else {
        utils.runUntil(() => webview.value != null, () => {
          let targetWebsite = website.findWebsite(options.value.src);
          let videoQuery = targetWebsite?.videoId || 'video';

          webview.value.executeJavaScript(`
          window.kfsocket = new WebSocket("ws://localhost:18888");

          window.kfsocket.addEventListener("open", function (event) {
          });

          window.kfsocket.addEventListener("message", function (event) {
            console.log("服务器消息", event.data);
            let eventData = JSON.parse(event.data);
            if (window.KFEventHandler && window.KFEventHandler[eventData.action]){
              window.KFEventHandler[eventData.action](eventData.args);
            } else if (eventData.action === "insertContent") {
              if (eventData.args === 'timestamp') {
                let video = document.querySelector("${videoQuery}");
                if (video) {
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', type: eventData.args, time: video.currentTime - ${noteModel.setting.value.timestampOffset}}));
                }
              } else if (eventData.args === 'screenshot') {
                let video = document.querySelector("${videoQuery}");
                if (video) {
                  video.crossOrigin = "anonymous";
                  let canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;

                  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', type: eventData.args, screenshot: canvas.toDataURL()}));
                }
              } else if (eventData.args === 'all') {
                let video = document.querySelector("${videoQuery}");
                if (video) {
                  video.crossOrigin = "anonymous";
                  let canvas = document.createElement("canvas");
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;

                  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                  window.kfsocket.send(JSON.stringify({action: 'insertContent', type: eventData.args, time: video.currentTime - ${noteModel.setting.value.timestampOffset}, screenshot: canvas.toDataURL()}));
                }
              }
            } else if (eventData.action === "locateVideo") {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                let argObj = JSON.parse(eventData.args);
                video.currentTime = new Number(argObj.location);
              }
            } else if (eventData.action === 'getTimestamp') {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                video.crossOrigin = "anonymous";
                window.kfsocket.send(JSON.stringify({action: 'getTimestamp', time: video.currentTime - ${noteModel.setting.value.timestampOffset}}));
              }
            }else if (eventData.action === "stopVideo") {
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
                video.currentTime = video.currentTime + ${noteModel.setting.value.forwardStep};
              }
            } else if (eventData.action === "backward") {
              let video = document.querySelector("${videoQuery}");
              if (video) {
                video.currentTime = video.currentTime >= ${noteModel.setting.value.forwardStep} ? video.currentTime - ${noteModel.setting.value.forwardStep} : 0;
              }
            }
          });
      `);
          if (developEnv && targetWebsite?.debug) {
            webview.value.openDevTools();
          }
          if (targetWebsite?.loadScript) {
            webview.value.executeJavaScript(targetWebsite.loadScript);
          }

          if (targetWebsite?.captureSubtitle) {
            extendButtons.value.captureSubtitle = true;
          } else {
            extendButtons.value.captureSubtitle = false;
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
      let cover = playerDom.value.$el.querySelector('.play-pause-layer');
      if (!cover.added) {
        cover.addEventListener('dblclick', () => insertContent());
        cover.added = true;
      }
    };

    const insertContent = (type = 'all') => {
      if (contentType.value === 'video') {
        let video = playerDom.value.$el.childNodes[0];
        if (video) {
          let data = {
            type: type
          };

          if (type === 'timestamp' || type === 'all') {
            data.time = video.currentTime - noteModel.setting.value.timestampOffset;
          }

          if (type === 'screenshot' || type === 'all') {
            data.screenshot = getScreenshot(video);
          }

          service.invoke('/note/insertAll', JSON.stringify(data));
        } else {
          ElMessage.error('视频未加载');
        }
      } else if (contentType.value === 'website') {
        service.invoke('/note/webInsertContent', type);
      }
    };

    const getScreenshot = video => {
      video.crossOrigin = 'Anonymous';
      let canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL();
    };

    let locateVideoListener = function(event, arg) {
      console.log('定位视频', arg);
      let argObj = JSON.parse(arg);
      if (contentType.value === 'video' && playerDom.value?.$el?.childNodes[0]) {
        let video = playerDom.value.$el.childNodes[0];
        video.currentTime = Number(argObj.location);
      } else if (contentType.value === 'website') {
        service.invoke('/note/webLocateVideo', arg);
      }
    };
    window.electron.ipcRenderer.on('/client/locateVideo', locateVideoListener);

    let insertContentListener = function(event, arg) {
      let argObj = JSON.parse(arg);
      insertContent(argObj.type);
    };
    window.electron.ipcRenderer.on('/client/insertContent', insertContentListener);

    let stopVideoListener = function(event, arg) {
      stopVideo();
    };
    window.electron.ipcRenderer.on('/client/stopVideo', stopVideoListener);

    let playVideoListener = function(event, arg) {
      playVideo();
    };
    window.electron.ipcRenderer.on('/client/playVideo', playVideoListener);

    let forwardListener = function(event, arg) {
      forward();
    };
    window.electron.ipcRenderer.on('/client/forward', forwardListener);

    let backwardListener = function(event, arg) {
      backward();
    };
    window.electron.ipcRenderer.on('/client/backward', backwardListener);

    let changePageListener = function(event, arg) {
      let {page} = JSON.parse(arg);
      noteModel.currPage.value = page;
    };
    window.electron.ipcRenderer.on('/client/changePage', changePageListener);

    let getTimestampListene = function(event, arg) {
      let argObj = JSON.parse(arg);
      service.invoke('/note/send', `${content.value} ${formatTime(argObj.time)}\n`);
      content.value = '';
      playVideo();
    };
    window.electron.ipcRenderer.on('/client/getTimestamp', getTimestampListene);

    let captureSubtitleListener = function(event, arg) {
      if (noteModel.setting.value.displayMode === 'window') {
        ElMessageBox.confirm('字幕已经生成，要不要进行分析', '字幕分析', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          service.invoke('/note/analysisSubtitle', arg);
        }).catch(() => {
          service.invoke("/system/redirect", {
            target: "main",
            route: "/client/send",
            args: `\n\n[[字幕]](subtitle://${JSON.parse(arg).fileName})\n`
          })
        });
      }
    };
    electron.ipcRenderer.on('/client/captureSubtitle', captureSubtitleListener);

    const playVideo = () => {
      if (contentType.value === 'video') {
        let video = playerDom.value.$el.childNodes[0];
        video.crossOrigin = 'Anonymous';
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      } else if (contentType.value === 'website') {
        service.invoke('/note/webPlayVideo', '');
      }
    };

    const stopVideo = () => {
      if (contentType.value === 'video') {
        let video = playerDom.value.$el.childNodes[0];
        video.pause();
      } else if (contentType.value === 'website') {
        service.invoke('/note/webStopVideo', '');
      }
    };

    const forward = () => {
      if (contentType.value === 'video') {
        let video = playerDom.value.$el.childNodes[0];
        video.currentTime = video.currentTime + parseFloat(noteModel.setting.value.forwardStep);
      } else if (contentType.value === 'website') {
        service.invoke('/note/webForward', '');
      }
    };

    const backward = () => {
      if (contentType.value === 'video') {
        let video = playerDom.value.$el.childNodes[0];
        let forwardStep = parseFloat(noteModel.setting.value.forwardStep);
        video.currentTime = video.currentTime >= forwardStep ? video.currentTime - forwardStep : 0;
      } else if (contentType.value === 'website') {
        service.invoke('/note/webBackward', '');
      }
    };

    const webview = ref(null);

    onUnmounted(() => {
      if (webview.value) {
        webview.value.executeJavaScript(`
          window.kfsocket.close();
        `);
      }
      window.electron.ipcRenderer.removeListener('/client/locateVideo', locateVideoListener);
      window.electron.ipcRenderer.removeListener('/client/insertContent', insertContentListener);
      window.electron.ipcRenderer.removeListener('/client/stopVideo', stopVideoListener);
      window.electron.ipcRenderer.removeListener('/client/playVideo', playVideoListener);
      window.electron.ipcRenderer.removeListener('/client/forward', forwardListener);
      window.electron.ipcRenderer.removeListener('/client/backward', backwardListener);
      window.electron.ipcRenderer.removeListener('/client/changePage', changePageListener);
      window.electron.ipcRenderer.removeListener('/client/getTimestamp', getTimestampListene);
      window.electron.ipcRenderer.removeListener('/client/captureSubtitle', captureSubtitleListener);
    });

    const recording = ref(false);

    const record = (type) => {
      recording.value = !recording.value;
      if (recording.value) {
        service.invoke('/record/start', type);
      } else {
        service.invoke('/record/stop', '');
      }
    };

    const content = ref('');

    const send = () => {
      if (content.value) {
        if ((noteModel.setting.value.autoTimestamp === 'chapter' && content.value.startsWith('#')) ||
          noteModel.setting.value.autoTimestamp === 'any') {
          if (contentType.value === 'video') {
            let video = playerDom.value.$el.childNodes[0];
            let currentTime = video.currentTime - noteModel.setting.value.timestampOffset;
            service.invoke('/note/send', `${content.value} ${formatTime(currentTime)}\n`);
            content.value = '';
            playVideo();
          } else if (contentType.value === 'website') {
            service.invoke('/note/getTimestamp', '');
          }
        } else {
          service.invoke('/note/send', content.value + '\n');
          content.value = '';
          playVideo();
        }
      }
    };

    const enterNote = () => {
      if (noteModel.setting.value.pauseWhenWrite) {
        if (contentType.value === 'video' || contentType.value === 'website') {
          stopVideo();
        }
      }
    };

    function formatTime(second) {
      if (second < 0) {
        second = 0;
      }
      let h = Math.floor(second / 3600);
      let m = Math.floor((second % 3600) / 60);
      let s = Math.floor(second % 60);
      return `[[位置 ${h + ':' + m + ':' + s}]](timestamp://${second.toFixed(1)})`;
    }

    const captureSubtitle = () => {
      if (contentType.value === 'website') {
        service.invoke('/note/captureSubtitle', '');
      }
    };

    return {
      initFlag, options, whenPlay, playerDom, playVideo, stopVideo, insertContent, contentType, webview,
      forward, backward, recording, record, content, send, enterNote, extendButtons, captureSubtitle,
    };
  },
};

</script>

<style>

.record {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  width: 50px;
  z-index: 12;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
}

.toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  width: 100%;
  z-index: 12;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  pointer-events: none;

  .panel {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0.1;

    button {
      pointer-events: auto;
    }

    .el-input {
      pointer-events: auto;
    }
  }

  .panel:hover {
    opacity: 0.5;
  }

  .el-button {
    padding: 2px;
    margin: 2px;
    border: 0px;
  }
}


@keyframes blink {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

@-webkit-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-moz-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-ms-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@-o-keyframes blink {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.blink {
  color: red;
  font-size: 46px;
  animation: blink 2s linear infinite;
  -webkit-animation: blink 2s linear infinite;
  -moz-animation: blink 2s linear infinite;
  -ms-animation: blink 2s linear infinite;
  -o-animation: blink 2s linear infinite;
}

</style>
