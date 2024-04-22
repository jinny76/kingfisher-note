<template>
  <el-container style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-aside :width="videoWidth" style="margin: 0px; padding: 0px;">
      <video-window v-if="videoUrl != ''" :url-str="videoUrl" ref="video"></video-window>
    </el-aside>
    <el-main style="margin: 0px; padding: 0px;" id="idMainContainer">
      <div ref="noteEditor" id="idNoteEditor"></div>
    </el-main>
  </el-container>
  <input type="file" @change="selectFileAndPlay" style="display: none" ref="fileInput" accept="video/mp4" />
  <el-dialog v-model="dialogOpenVisible" title="打开笔记" width="500">
    <el-input v-model="noteSearch" placeholder="搜索"></el-input>
    <el-table :data="noteList" style="width: 100%" @row-click="openNote" max-height="200px">
      <el-table-column prop="name" label="名称" width="280" />
      <el-table-column prop="time" label="修改时间" width="180">
        <template #default="scope">
          {{ scope.row.time.toLocaleString() }}
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogOpenVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="js">
import { ref, watch, computed, onUnmounted, onMounted, nextTick } from "vue";
import Vditor from "vditor";
import VideoWindow from "./Video.vue";
import keyManager from "../utils/keys";
import service from "../utils/service";
import noteModel from "../model/note";
import utils from "../utils/utils";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  name: "NoteMain",
  components: { VideoWindow },
  setup() {
    const noteEditor = ref();
    const recentNotes = noteModel.recentNotes;

    onMounted(() => {
      if (!noteModel.currNote.value.name) {
        createNewNote();
      }

      window.addEventListener("message", (event) => {
        console.log("接收到消息", event.data);
      })

      let recentNotesStr = localStorage.getItem("RECENT_NOTES");
      if (recentNotesStr) {
        recentNotes.value = JSON.parse(recentNotesStr);
      }
    });

    const showVideo = computed(() => {
      return "same" === noteModel.setting.value.displayMode;
    });

    let editor;

    const doSave = (cb) => {
      event.preventDefault();
      let note = noteModel.currNote.value;
      note.data = editor.getValue();
      note.changed = false;
      localStorage.setItem("NOTE", JSON.stringify(note));
      service.invoke("/store/saveNote", JSON.stringify({
        path: note.name,
        data: note.data
      }), (result) => {
        console.log("保存笔记成功", result);
        ElMessage.success("保存笔记成功");
        if (cb) {
          cb();
        }
      });
    };

    keyManager.registerHotkeyProcessor("ctrl+s", (event, handler) => {
      doSave();
    }, "保存笔记");

    const fileInput = ref(null);

    const video = ref();

    const selectFileAndPlay = (event) => {
      const file = event.target.files[0];
      openVideo(file.path, true);
    };

    const openVideo = (video, insertNote = false) => {
      if ("same" === noteModel.setting.value.displayMode) {
        noteModel.videoUrl.value = video;
      } else {
        service.send("window-new", { route: "/video/" + encodeURIComponent(video), alwaysOnTop: true });
      }

      if (insertNote) {
        let newContent;
        if (video.startsWith("https://") || video.startsWith("http://")) {
          video = video.replaceAll("www.bilibili.com", "www.b.com");
          newContent = `\n\n[视频网址 ${video}](${video})\n`;
        } else {
          let fileName = video.substring(video.lastIndexOf("\\") + 1);
          newContent = `\n\n[[视频文件 ${fileName}]](kingfisher://${encodeURIComponent(video + "/")})\n`;
        }
        if (editor.getValue().indexOf(newContent) === -1) {
          editor.insertValue(newContent, true);
          noteModel.markChanged();
        }
      }
    };

    keyManager.registerHotkeyProcessor("ctrl+o", (event, handler) => {
      event.preventDefault();
      fileInput.value.click();
    }, "打开视频");

    watch(noteModel.currNote, () => {
      editor.setValue(noteModel.currNote.value.data);
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
            noteModel.markChanged();
            stopVideo();
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
              } else if (dom.href.startsWith("http://") || dom.href.startsWith("https://")) {
                let url = dom.href.replace("www.b.com", "www.bilibili.com");
                openVideo(decodeURIComponent(url));
              }
            }
          },
          toolbar: [
            "emoji", "headings", "bold", "italic", "strike", "|", "line", "quote",
            "list", "ordered-list", "check", "outdent", "indent", "code", "inline-code",
            "insert-after", "insert-before", "undo", "redo", "link", "table", "help", "|",
            {
              hotkey: "⇧S",
              name: "save",
              tipPosition: "s",
              tip: "保存",
              className: "right",
              icon: "<svg t=\"1713601492576\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"5395\" width=\"200\" height=\"200\"><path d=\"M714.8 6.8H98.6C48 6.8 6.8 48 6.8 98.6v826.7c0 50.7 41.2 91.9 91.9 91.9h826.7c50.7 0 91.9-41.2 91.9-91.9v-616L714.8 6.8zM557.9 98.6v321.5H282.4V98.6h275.5zM98.6 925.4V98.6h91.9v344.3c0 38.1 31 69.1 69.1 69.1h321.1c38.1 0 69.1-31 69.1-69.1V98.6h26.9l248.7 248.7 0.1 578.1H98.6z\" fill=\"#FFFFFF\" p-id=\"5396\"></path></svg>",
              click() {
                doSave();
              }
            },
            {
              hotkey: "⇧⌘V",
              name: "open-video",
              tipPosition: "s",
              tip: "打开视频",
              className: "right",
              icon: "<svg t=\"1713601614404\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"6562\" width=\"200\" height=\"200\"><path d=\"M157.538462 689.230769v-11.815384 23.630769-11.815385zM905.846154 39.384615H118.153846C74.830769 39.384615 39.384615 74.830769 39.384615 118.153846v708.923077c0 43.323077 35.446154 78.769231 78.769231 78.769231h236.307692c11.815385 0 19.692308-7.876923 19.692308-19.692308v-78.769231c0-11.815385-7.876923-19.692308-19.692308-19.692307H187.076923c-15.753846 0-29.538462-13.784615-29.538461-29.538462v-492.307692c0-15.753846 13.784615-29.538462 29.538461-29.538462h649.846154c15.753846 0 29.538462 13.784615 29.538461 29.538462v492.307692c0 15.753846-13.784615 29.538462-29.538461 29.538462H669.538462c-11.815385 0-19.692308 7.876923-19.692308 19.692307v78.769231c0 11.815385 7.876923 19.692308 19.692308 19.692308h236.307692c43.323077 0 78.769231-35.446154 78.769231-78.769231V118.153846c0-43.323077-35.446154-78.769231-78.769231-78.769231z m-167.384616 641.969231l41.353847-41.353846c11.815385-11.815385 11.815385-29.538462 0-41.353846L531.692308 350.523077c-11.815385-11.815385-29.538462-11.815385-41.353846 0L244.184615 596.676923c-11.815385 11.815385-11.815385 29.538462 0 41.353846l41.353847 41.353846c11.815385 11.815385 29.538462 11.815385 41.353846 0l90.584615-90.584615c11.815385-11.815385 35.446154-3.938462 35.446154 13.784615v352.492308c0 15.753846 11.815385 29.538462 27.569231 29.538462h59.076923c15.753846 0 31.507692-13.784615 31.507692-29.538462V602.584615c0-17.723077 19.692308-25.6 33.476923-13.784615l90.584616 92.553846c11.815385 9.846154 31.507692 9.846154 43.323076 0z\" fill=\"#FFFFFF\" p-id=\"6563\"></path></svg>",
              click() {
                fileInput.value.click();
              }
            },
            {
              hotkey: "⇧⌘U",
              name: "open-url",
              tipPosition: "s",
              tip: "打开网址",
              className: "right",
              icon: "<svg t=\"1713771194939\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"20294\" width=\"200\" height=\"200\"><path d=\"M512 955.733333C268.8 955.733333 68.266667 755.2 68.266667 512S264.533333 68.266667 512 68.266667 951.466667 268.8 951.466667 512 755.2 955.733333 512 955.733333z m0-819.2c-209.066667 0-379.733333 170.666667-379.733333 379.733334S302.933333 896 512 896s375.466667-170.666667 375.466667-379.733333c0-213.333333-166.4-379.733333-375.466667-379.733334z\" fill=\"#FFFFFF\" p-id=\"20295\"></path><path d=\"M533.333333 955.733333C409.6 955.733333 341.333333 729.6 341.333333 512 341.333333 298.666667 409.6 68.266667 533.333333 68.266667S725.333333 294.4 725.333333 512c0 213.333333-68.266667 443.733333-192 443.733333z m0-819.2c-51.2 0-128 145.066667-128 379.733334s72.533333 379.733333 128 379.733333c51.2 0 128-145.066667 128-379.733333 0-238.933333-72.533333-379.733333-128-379.733334z\" fill=\"#FFFFFF\" p-id=\"20296\"></path><path d=\"M115.2 482.133333h836.266667v64H115.2z\" fill=\"#FFFFFF\" p-id=\"20297\"></path></svg>",
              click() {
                ElMessageBox.prompt("请输入网址", "打开网址", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                  inputPattern: /\S/,
                  inputErrorMessage: "网址不能为空"
                }).then(({ value }) => {
                  openVideo(value, true);
                }).catch(() => {
                  console.log("取消打开网址");
                });
              }
            },
            {
              hotkey: "⇧⌘T",
              name: "insert-time",
              tipPosition: "s",
              tip: "插入时间",
              className: "right",
              icon: "<svg t=\"1713751961582\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"5255\" width=\"200\" height=\"200\"><path d=\"M512 1022.060606c281.69697 0 510.060606-228.363636 510.060606-510.060606S793.69697 1.939394 512 1.939394 1.939394 230.30303 1.939394 512 230.30303 1022.060606 512 1022.060606z m0-58.181818c-249.565091 0-451.878788-202.313697-451.878788-451.878788C60.121212 262.434909 262.434909 60.121212 512 60.121212c249.565091 0 451.878788 202.313697 451.878788 451.878788 0 249.565091-202.313697 451.878788-451.878788 451.878788z\" fill=\"#FFFFFF\" p-id=\"5256\"></path><path d=\"M326.120727 363.368727l166.787879 174.545455a29.090909 29.090909 0 1 0 42.061576-40.192l-166.787879-174.545455A29.090909 29.090909 0 0 0 326.120727 363.364848z\" fill=\"#FFFFFF\" p-id=\"5257\"></path><path d=\"M876.625455 665.755152l-347.849697-172.070788a29.090909 29.090909 0 1 0-25.79394 52.146424l347.845818 172.070788a29.090909 29.090909 0 0 0 25.79394-52.150303z\" fill=\"#FFFFFF\" p-id=\"5258\"></path></svg>",
              click() {
                insertContent("timestamp");
              }
            },
            {
              hotkey: "⇧⌘P",
              name: "insert-screenshot",
              tipPosition: "s",
              tip: "插入截图",
              className: "right",
              icon: "<svg t=\"1713752087666\" class=\"icon\" viewBox=\"0 0 1280 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"13508\" width=\"200\" height=\"200\"><path d=\"M1184 1024H96c-52.928 0-96-43.072-96-96V96c0-52.928 43.072-96 96-96h1088c52.928 0 96 43.072 96 96v832c0 52.928-43.072 96-96 96zM128 128v768l297.376-297.376a32.096 32.096 0 0 1 45.248 0L576 704 1152 128H128z m224 320a96 96 0 1 1 0-192 96 96 0 0 1 0 192z\" fill=\"#FFFFFF\" p-id=\"13509\"></path></svg>",
              click() {
                insertContent("screenshot");
              }
            },
            {
              hotkey: "⇧⌘A",
              name: "insert-all",
              tipPosition: "s",
              tip: "插入截图和时间",
              className: "right",
              icon: "<svg t=\"1713752331119\" class=\"icon\" viewBox=\"0 0 1024 1024\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" p-id=\"18671\" width=\"200\" height=\"200\"><path d=\"M128 128h384v224l32 32H768v64h64V307.2l-9.6-23.04-209.92-211.2L590.08 64H96l-32 32v832l32 32H320v-64H128V128z m448 0l192 192H576V128z m352 384h-512l-32 32v384l32 32h512l32-32v-384l-32-32zM896 576v256l-104.32-102.4h-45.44l-74.24 74.88-136.32-136.32h-45.44L448 710.4V576h448z m-179.2 273.28l51.84-51.84L867.2 896h-103.68l-46.72-46.72zM448 896v-95.36l64-64L673.28 896H448z m352-224a32 32 0 1 0 0-64 32 32 0 0 0 0 64z\" fill=\"#FFFFFF\" p-id=\"18672\"></path></svg>",
              click() {
                insertContent("all");
              }
            }
          ]
        });
      }
    });

    const stopVideo = () => {
      if (noteModel.setting.value.displayMode === "same") {
        if (video.value && noteModel.setting.value.pauseWhenWrite) {
          video.value.stopVideo();
        }
      } else {
        service.invoke("/note/stopVideo", "");
      }
    };

    window.electron.ipcRenderer.on("/client/insertAll", function(event, arg) {
      editor.focus();
      let data = JSON.parse(arg);
      if (data) {
        if (data.time && data.screenshotId) {
          editor.insertValue("\n\n" + formatTime(data.time) + "\n" + insertMdImg(data.screenshotId) + "\n");
        } else if (data.time) {
          editor.insertValue("\n\n" + formatTime(data.time) + "\n");
        } else if (data.screenshotId) {
          editor.insertValue("\n\n" + insertMdImg(data.screenshotId) + "\n");
        }
        noteModel.markChanged();
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
      return `![](kingfisher://${noteModel.setting.value.screenshotDir.replaceAll("\\", "/") + `/${fileId}.png`})`;
    }

    const videoWidth = computed(() => {
      return showVideo.value ? "50%" : "0%";
    });

    onUnmounted(() => {
      window.electron.ipcRenderer.removeAllListeners("/client/insertAll");
    });

    const createNewNote = () => {
      ElMessageBox.prompt("请输入笔记名称", "新建笔记", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputErrorMessage: "笔记名称不能为空"
      }).then(({ value }) => {
        noteModel.currNote.value = {
          name: value + ".kfnote",
          data: ""
        };
      }).catch(() => {
        console.log("取消新建笔记");
      });
    };

    const listNote = () => {
      dialogOpenVisible.value = true;
      service.invoke("/store/getNoteList", null, (result) => {
        noteModel.noteList.value = result;
      });
    };

    const dialogOpenVisible = ref(false);

    const openNote = (note) => {
      if (noteModel.currNote.value.changed) {
        ElMessageBox.confirm("当前笔记已修改，是否保存？", "提示", {
          confirmButtonText: "保存",
          cancelButtonText: "不保存",
          type: "warning"
        }).then(() => {
          doSave(callOpen);
        }).catch(() => {
          console.log("不保存笔记");
          callOpen();
        });
      } else {
        callOpen();
      }

      function callOpen() {
        dialogOpenVisible.value = false;

        service.invoke("/store/getNote", JSON.stringify({
          path: note.name
        }), (result) => {
          noteModel.currNote.value = result;

          let existNote = recentNotes.value.find((n) => n.name === note.name);
          if (existNote) {
            recentNotes.value.splice(recentNotes.value.indexOf(existNote), 1);
          }
          recentNotes.value.unshift(note);
          localStorage.setItem("RECENT_NOTES", JSON.stringify(recentNotes.value));

          if (noteModel.setting.value.autoOpenVideo) {
            nextTick(() => {
              let indexIf = noteModel.currNote.value.data.indexOf("视频文件");
              if (indexIf !== -1) {
                //fetch content in () from indexIf
                let startIndex = noteModel.currNote.value.data.indexOf("(", indexIf);
                let endIndex = noteModel.currNote.value.data.indexOf(")", indexIf);
                if (startIndex > -1 && endIndex > -1) {
                  let videoPath = noteModel.currNote.value.data.substring(startIndex + 1, endIndex);
                  openVideo(decodeURIComponent(videoPath.replace("kingfisher://", "")), false);
                }
              } else {
                indexIf = noteModel.currNote.value.data.indexOf("视频网址");
                if (indexIf !== -1) {
                  //fetch content in () from indexIf
                  let startIndex = noteModel.currNote.value.data.indexOf("(", indexIf);
                  let endIndex = noteModel.currNote.value.data.indexOf(")", indexIf);
                  if (startIndex > -1 && endIndex > -1) {
                    let videoPath = noteModel.currNote.value.data.substring(startIndex + 1, endIndex);
                    videoPath = videoPath.replace("www.b.com", "www.bilibili.com");
                    openVideo(videoPath);
                  }
                }
              }
            });
          }
        });
      }
    };

    const insertContent = (type) => {
      if (video.value) {
        video.value.insertContent(type);
      } else {
        service.invoke("/note/insertContent", JSON.stringify({ type: type }));
      }
    };

    const noteSearch = ref("");

    const noteList = computed(() => {
      return noteModel.noteList.value.filter((note) => {
        return utils.pinyinMatch(note.name, noteSearch.value);
      });
    });

    return {
      noteEditor,
      editor,
      video,
      fileInput,
      selectFileAndPlay,
      showVideo,
      videoWidth,
      videoUrl: noteModel.videoUrl,
      createNewNote,
      openNote,
      listNote,
      dialogOpenVisible,
      noteList,
      insertContent,
      noteSearch
    };
  }
};

</script>

<style>
</style>
