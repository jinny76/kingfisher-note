<template>
  <el-container style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-aside :width="videoWidth" style="margin: 0px; padding: 0px;">
      <video-window v-if="videoUrl != ''" :url-str="videoUrl"></video-window>
    </el-aside>
    <el-main style="margin: 0px; padding: 0px;">
      <div ref="noteEditor" id="idNoteEditor"></div>
    </el-main>
  </el-container>
  <input type="file" @change="selectFileAndPlay" style="display: none" ref="fileInput" accept="video/mp4"/>
</template>

<script lang="js">
import { ref, watch, computed, onUnmounted } from "vue";
import Vditor from "vditor";
import VideoWindow from "./Video.vue";
import keyManager from "../utils/keys";
import service from "../utils/service";
import noteModel from "../model/note";
import { ElMessage } from "element-plus";

export default {
  name: "NoteMain",
  components: { VideoWindow },
  setup() {
    const noteEditor = ref();

    const showVideo = computed(() => {
      return "same" === noteModel.setting.value.displayMode;
    });

    let editor;

    const doSave = () => {
      event.preventDefault();
      noteModel.currNote.value.data = editor.getValue();
      localStorage.setItem("NOTE", JSON.stringify(noteModel.currNote.value));
      service.invoke("/store/saveNote", JSON.stringify({
        path: noteModel.currNote.value.name,
        data: noteModel.currNote.value.data
      }), (result) => {
        console.log("保存笔记成功", result);
        ElMessage.success("保存笔记成功");
      });
    };

    keyManager.registerHotkeyProcessor("ctrl+s", (event, handler) => {
      doSave()
    }, "保存笔记");

    const fileInput = ref(null);

    const selectFileAndPlay = (event) => {
      const file = event.target.files[0];
      openVideo(file.path, true);
    };

    const openVideo = (video, insertNote=false)=>{
      if ("same" === noteModel.setting.value.displayMode) {
        noteModel.videoUrl.value = video;
      } else {
        service.send("window-new", { route: "/video/" + encodeURIComponent(video), alwaysOnTop: true });
      }

      if (insertNote) {
        let fileName = video.substring(video.lastIndexOf("\\") + 1);
        let newContent = `\n\n[[视频文件 ${fileName}]](kingfisher://${encodeURIComponent(video + "/")})\n`;
        if (editor.getValue().indexOf(newContent) === -1) {
          editor.insertValue(newContent);
        }
      }
    }

    keyManager.registerHotkeyProcessor("ctrl+o", (event, handler) => {
      event.preventDefault();
      fileInput.value.click();
    }, "打开视频");

    watch(noteModel.currNote, () => {
      if (noteModel.currNote.value?.data) {
        editor.setValue(noteModel.currNote.value.data);
      }
    });

    watch(() => noteEditor.value, () => {
      if (noteEditor.value) {
        editor = new Vditor("idNoteEditor", {
          cdn: "https://dev.kingfisher.live/resource",
          theme: "dark",
          width: "100%",
          height: "100%",
          mode: "sv",
          icon: "material",
          keydown: () => {
            console.log("keydown");
          },
          preview: {
            delay: 200,
            theme: {
              current: "dark"
            },
            actions: []
          },
          link: {
            click: (dom) => {
              if (dom.href.startsWith("timestamp://")) {
                service.invoke("/note/locateVideo", dom.href.replace("timestamp://", ""));
              } else if (dom.href.startsWith("kingfisher://")) {
                openVideo(decodeURIComponent(dom.href.replace("kingfisher://", "")));
              }
            }
          },
          toolbar: [
            "emoji", "headings", "bold", "italic", "strike", "|", "line", "quote",
            "list", "ordered-list", "check", "outdent", "indent", "code", "inline-code",
            "insert-after", "insert-before", "undo", "redo", "link", "table", 'help',
            {
              hotkey: '⇧S',
              name: 'save',
              tipPosition: 's',
              tip: '保存',
              className: 'right',
              icon: '<svg t="1713601492576" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5395" width="200" height="200"><path d="M714.8 6.8H98.6C48 6.8 6.8 48 6.8 98.6v826.7c0 50.7 41.2 91.9 91.9 91.9h826.7c50.7 0 91.9-41.2 91.9-91.9v-616L714.8 6.8zM557.9 98.6v321.5H282.4V98.6h275.5zM98.6 925.4V98.6h91.9v344.3c0 38.1 31 69.1 69.1 69.1h321.1c38.1 0 69.1-31 69.1-69.1V98.6h26.9l248.7 248.7 0.1 578.1H98.6z" fill="#FFFFFF" p-id="5396"></path></svg>',
              click () {
                doSave();
              },
            },
            {
              hotkey: '⇧⌘V',
              name: 'open-video',
              tipPosition: 'ov',
              tip: '打开视频',
              className: 'right',
              icon: '<svg t="1713601614404" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6562" width="200" height="200"><path d="M157.538462 689.230769v-11.815384 23.630769-11.815385zM905.846154 39.384615H118.153846C74.830769 39.384615 39.384615 74.830769 39.384615 118.153846v708.923077c0 43.323077 35.446154 78.769231 78.769231 78.769231h236.307692c11.815385 0 19.692308-7.876923 19.692308-19.692308v-78.769231c0-11.815385-7.876923-19.692308-19.692308-19.692307H187.076923c-15.753846 0-29.538462-13.784615-29.538461-29.538462v-492.307692c0-15.753846 13.784615-29.538462 29.538461-29.538462h649.846154c15.753846 0 29.538462 13.784615 29.538461 29.538462v492.307692c0 15.753846-13.784615 29.538462-29.538461 29.538462H669.538462c-11.815385 0-19.692308 7.876923-19.692308 19.692307v78.769231c0 11.815385 7.876923 19.692308 19.692308 19.692308h236.307692c43.323077 0 78.769231-35.446154 78.769231-78.769231V118.153846c0-43.323077-35.446154-78.769231-78.769231-78.769231z m-167.384616 641.969231l41.353847-41.353846c11.815385-11.815385 11.815385-29.538462 0-41.353846L531.692308 350.523077c-11.815385-11.815385-29.538462-11.815385-41.353846 0L244.184615 596.676923c-11.815385 11.815385-11.815385 29.538462 0 41.353846l41.353847 41.353846c11.815385 11.815385 29.538462 11.815385 41.353846 0l90.584615-90.584615c11.815385-11.815385 35.446154-3.938462 35.446154 13.784615v352.492308c0 15.753846 11.815385 29.538462 27.569231 29.538462h59.076923c15.753846 0 31.507692-13.784615 31.507692-29.538462V602.584615c0-17.723077 19.692308-25.6 33.476923-13.784615l90.584616 92.553846c11.815385 9.846154 31.507692 9.846154 43.323076 0z" fill="#FFFFFF" p-id="6563"></path></svg>',
              click () {
                fileInput.value.click();
              },
            }
          ]
        });
      }
    });

    window.electron.ipcRenderer.on("/client/insertAll", function(event, arg) {
      editor.focus();
      let data = JSON.parse(arg);
      if (data) {
        editor.insertValue("\n\n" + formatTime(data.time) + "\n" + insertMdImg(data.screenshotId) + "\n");
      }
    });

    // format 1.2222 to 0:0:1
    function formatTime(second) {
      let h = Math.floor(second / 3600);
      let m = Math.floor((second % 3600) / 60);
      let s = Math.floor(second % 60);
      return `[[视频位置 ${h + ":" + m + ":" + s}]](timestamp://${second})`;
    }

    // format 1 to file://./screenshot/1.png to md file
    function insertMdImg(fileId) {
      return `![](kingfisher://./screenshot/${fileId}.png)`;
    }

    const videoWidth = computed(() => {
      return showVideo.value ? "50%" : "0%";
    });

    onUnmounted(() => {
      window.electron.ipcRenderer.removeAllListeners("/client/insertAll");
    });

    return {
      noteEditor,
      editor,
      fileInput,
      selectFileAndPlay,
      showVideo,
      videoWidth,
      videoUrl: noteModel.videoUrl
    };
  }
};

</script>

<style>
</style>
