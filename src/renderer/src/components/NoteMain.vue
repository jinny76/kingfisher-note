<template>
  <el-container style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-aside :width="videoWidth">
      <video-window v-if="videoUrl != ''" :url-str="videoUrl"></video-window>
    </el-aside>
    <el-main>
      <div ref="noteEditor" id="idNoteEditor"></div>
    </el-main>
  </el-container>
  <input type="file" @change="selectFileAndPlay" style="display: none" ref="fileInput"/>
</template>

<script lang="js">
import { ref, watch, computed } from 'vue'
import Vditor from 'vditor'
import VideoWindow from './Video.vue'
import keyManager from '../utils/keys'
import service from '../utils/service'
import noteModel from '../model/note'
import {ElMessage} from "element-plus";

export default {
  name: 'NoteMain',
  components: {VideoWindow},
  setup () {
    const noteEditor = ref()

    const displayMode = noteModel.displayMode;

    const showVideo = computed(()=>{
      return "same" === displayMode.value;
    });

    let editor;

    keyManager.registerHotkeyProcessor("ctrl+s", (event, handler)=>{
      event.preventDefault();
      noteModel.currNote.value.data = editor.getValue();
      localStorage.setItem("NOTE", JSON.stringify(noteModel.currNote.value));
      service.invoke("/store/saveNote", JSON.stringify({
        path: noteModel.currNote.value.name,
        data: noteModel.currNote.value.data
      }), (result)=>{
        console.log("保存笔记成功", result);
        ElMessage.success("保存笔记成功");
      });
    }, "保存笔记");

    const fileInput = ref(null);

    const selectFileAndPlay = (event) => {
      const file = event.target.files[0];
      if ("same" === displayMode.value) {
        noteModel.videoUrl.value = file.path;
      } else {
        service.send("window-new", { route: "/video/" + encodeURIComponent(file.path) });
      }
    }

    keyManager.registerHotkeyProcessor("ctrl+o", (event, handler)=>{
      event.preventDefault();
      fileInput.value.click();
    }, "打开视频")

    watch(noteModel.currNote, ()=>{
      if (noteModel.currNote.value?.data) {
        editor.setValue(noteModel.currNote.value.data);
      }
    })

    watch(() => noteEditor.value, () => {
      if (noteEditor.value) {
        editor = new Vditor("idNoteEditor", {
          cdn: "https://dev.kingfisher.live/resource",
          theme: "dark",
          width: "100%",
          height: "100%",
          mode: "sv",
          icon: "material",
          keydown: ()=>{
            console.log("keydown")
          },
          preview: {
            delay: 200,
            theme : {
              current: "dark"
            },
            actions:[]
          },
          link : {
            click: (dom)=>{
              if (dom.href.startsWith("timestamp://")) {
                service.invoke("/note/locateVideo", dom.href.replace("timestamp://", ""))
              }
            }
          }
        })
      }
    });

    window.electron.ipcRenderer.on('/client/insertAll', function(event, arg) {
      editor.focus();
      let data = JSON.parse(arg);
      if (data) {
        editor.insertValue("\n\n" + formatTime(data.time) + "\n" + insertMdImg(data.screenshotId) + "\n")
      }
    });

    // format 1.2222 to 0:0:1
    function formatTime(second) {
      let h = Math.floor(second / 3600);
      let m = Math.floor((second % 3600) / 60);
      let s = Math.floor(second % 60);
      return `[${h + ":" + m + ":" + s}](timestamp://${second})` ;
    }

    // format 1 to file://./screenshot/1.png to md file
    function insertMdImg(fileId) {
      return `![](kingfisher://./screenshot/${fileId}.png)`
    }

    const videoWidth = computed(() => {
      return showVideo.value ? "50%" : "0%";
    });

    return {
      noteEditor,
      editor,
      fileInput,
      selectFileAndPlay,
      displayMode,
      showVideo,
      videoWidth,
      videoUrl: noteModel.videoUrl
    }
  }
}

</script>

<style>
</style>
