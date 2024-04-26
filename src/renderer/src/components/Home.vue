<template>
  <el-container style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-header style="padding: 0px; display: flex; justify-content: space-between">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        style="width: 400px;"
        @select="handleSelect"
        active-text-color="#ffd04b"
        background-color="#545c64"
        text-color="#fff"
        popper-effect="dark"
        ref="menu"
      >
        <el-sub-menu index="1">
          <template #title>文件</template>
          <el-menu-item index="2-1" id="idMenuFile">新建笔记</el-menu-item>
          <el-menu-item index="2-2">打开笔记</el-menu-item>
          <el-sub-menu index="2-3">
            <template #title>打开历史笔记</template>
            <el-menu-item :index="note.name" v-for="note in recentNotes" :key="note.name">
              {{ note.name.substring(0, note.name.indexOf(".")) }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="2-4">保存笔记</el-menu-item>
          <el-menu-item index="2-5">删除笔记</el-menu-item>
          <el-menu-item index="2-6">加密笔记</el-menu-item>
          <el-menu-item index="2-10">转换视频</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="4" id="idMenuSetting">设置</el-menu-item>
        <el-sub-menu index="6">
          <template #title>帮助</template>
          <el-menu-item index="6-1">使用说明</el-menu-item>
          <el-menu-item index="6-2">快速上手</el-menu-item>
          <el-menu-item index="6-10">关于</el-menu-item>
        </el-sub-menu>
      </el-menu>
      <div class="title-bar">
        <div>正在编辑 &nbsp;<el-badge :is-dot="currNote.changed" style="color: chartreuse" :offset="[6,0]">
          {{ currNote.name ? currNote.name.substring(0, currNote.name.indexOf(".")) : "" }}
        </el-badge>
        </div>
        <div style="padding-left: 40px">
          标签:
          <el-select
            v-model="currNote.tags"
            multiple
            filterable
            allow-create
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="3"
            default-first-option
            :reserve-keyword="false"
            placeholder="选择标签"
            style="width: 300px"
          >
            <el-option
              v-for="item in tags"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div style="padding-left: 40px">
          版本:
          <el-select
            v-model="currVersion"
            filterable
            placeholder="加载历史版本"
            style="width: 180px"
            @change="loadVersion"
            empty-text="没有历史版本"
          >
            <el-option
              v-for="version in versions"
              :key="version.label"
              :label="version.label"
              :value="version.time"
            />
          </el-select>
        </div>
        <div style="padding-left: 40px; display: flex" v-if="startUpdate">
          更新:
          <el-progress
            :text-inside="true"
            :percentage="updateProgress"
            :stroke-width="15"
            status="success"
            striped
            striped-flow
            :duration="10"
            style="width: 150px; padding-left: 5px;"
          />
        </div>
      </div>
    </el-header>
    <el-main style="padding: 0px;">
      <component :is="mainComp" ref="mainComponent"></component>
    </el-main>
  </el-container>
  <el-dialog v-model="dialogHelpVisible" title="使用帮助" width="1200">
    <div id="idHelp" style="height: 600px; overflow-y: auto"></div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogHelpVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogAboutVisible" title="关于" width="400">
    <p>作者：太白雪霁</p>
    <p>版本：0.0.2</p>
    <p>日期：2024-04-25</p>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogAboutVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogSettingVisible" title="笔记" width="800">
    <NoteSetting ref="settingDialog"></NoteSetting>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogSettingVisible = false">取消</el-button>
        <el-button @click="saveSetting">保存</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogConvertVisible" title="视频转换" width="1200">
    <el-upload
      v-model:file-list="videoList"
      :auto-upload="false"
      :multiple="false"
    >
      <el-button type="primary">选择视频</el-button>
      <template #tip>
        <div class="el-upload__tip">
          由于播放器不支持除了MP4格式以外的视频抓图和定位, 我们可以把其他类型的视频文件转换为MP4
        </div>
      </template>
    </el-upload>
    <div style="width: 100%">
      <el-checkbox v-model="convertOptions.h264">H264</el-checkbox>
      <el-checkbox v-model="convertOptions.mp3">MP3</el-checkbox>
    </div>
    <el-progress
      :percentage="100"
      :stroke-width="15"
      status="success"
      striped
      striped-flow
      :duration="10"
      v-show="showProgress"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="doConvert">转换</el-button>
        <el-button @click="dialogConvertVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-tour v-model="showTour" @change="onChangeTour" z-index="9999" :mask="{
      style: {
        boxShadow: 'inset 0 0 15px #333',
      },
      color: 'rgba(255, 255, 255, .3)',
    }">
    <el-tour-step :target="step[0]" title="新建笔记" placement="right">
      <div>点击菜单，创建一个新的笔记</div>
    </el-tour-step>
    <el-tour-step :target="step[1]" title="编写笔记" placement="center">
      <div>就可以编写笔记了</div>
    </el-tour-step>
    <el-tour-step :target="step[2]" title="获得帮助">
      <div>笔记使用Markdown格式，可以从这里获得帮助</div>
    </el-tour-step>
    <el-tour-step :target="step[3]" title="保存笔记">
      <div>编写过程中可以点击按钮，或者使用快捷键 Ctrl+S 来保存笔记</div>
    </el-tour-step>
    <el-tour-step :target="step[4]" title="打开文件">
      <div>可以点击按钮，或者使用快捷键 Ctrl+Shift+V 来打开一个文件</div>
    </el-tour-step>
    <el-tour-step :target="step[5]" title="打开音视频网址">
      <div>可以点击按钮，或者使用快捷键 Ctrl+Shift+U 来打开一个音视频网址，目前B站和网易公开课支持较好</div>
    </el-tour-step>
    <el-tour-step :target="step[6]" title="插入定位">
      <div>可以点击按钮，或者使用快捷键 Ctrl+Shift+T 来插入一个时间定位，然后在笔记预览链接点击可以快速跳转</div>
    </el-tour-step>
    <el-tour-step :target="step[7]" title="插入截图">
      <div>可以点击按钮，或者使用快捷键 Ctrl+Shift+P 来插入一个视频截图，然后在笔记预览可以点击看大图</div>
    </el-tour-step>
    <el-tour-step :target="step[8]" title="同时插入">
      <div>可以点击按钮，或者使用快捷键 Ctrl+Shift+A 来同时插入时间定位和视频截图</div>
    </el-tour-step>
    <el-tour-step :target="step[9]" title="控制音视频播放">
      <div>可以点击按钮，或者使用快捷键 Ctrl+P 控制音视频播放暂停，Ctrl+Shift+D 回退5秒，Ctrl+Shift+F 快进5秒</div>
    </el-tour-step>
    <el-tour-step :target="step[10]" title="导出笔记">
      <div>可以点击按钮，导出笔记，支持MD，PDF和HTML格式</div>
    </el-tour-step>
    <el-tour-step :target="step[11]" title="设置">
      <div>点击菜单可以进行设置</div>
    </el-tour-step>
    <el-tour-step title="欢迎使用">
      <div>感谢大家使用灵翠笔记</div>
    </el-tour-step>
  </el-tour>
  <div class="cv" v-show="locking" @click="unlock">
    <canvas id="_cv"></canvas>
  </div>
</template>

<script lang="js">
import { nextTick, ref, onMounted, watch } from "vue";
import NoteMain from "./NoteMain.vue";
import NoteSetting from "./NoteSetting.vue";
import noteModel from "../model/note";
import service from "../utils/service";
import { ElMessage, ElMessageBox } from "element-plus";
import keyManager from "../utils/keys";
import md5 from "md5";

export default {
  name: "Home",
  components: { NoteMain, NoteSetting },
  setup () {
    let canvas;
    let letters = Array(512).join(1).split("");
    const locking = noteModel.locking;

    const screen = ref({
      width: 1920,
      height: 1080
    });

    const initCanvas = () => {
      canvas = document.getElementById("_cv");
      canvas.getContext("2d");
      const _w = screen.value.width = window.innerWidth;
      const _h = screen.value.height = window.innerHeight;
      canvas.width = _w - 10;
      canvas.height = _h - 4;
    };

    const clock = () => {
      const _d = new Date();
      if (Math.floor(_d.getTime() / 100) % 2 === 0) {
        let _y, _M, _D, _h, _m;
        _y = _d.getFullYear();
        _M = _d.getMonth() + 1;
        _D = _d.getDate();
        _h = _d.getHours();
        _m = _d.getMinutes();
      }
    };

    let lockTimer;

    onMounted(() => {
      initCanvas();
      window.onresize = () => {
        initCanvas();
      };
    });

    const draw = () => {
      canvas.getContext("2d").fillStyle = "rgba(0,0,0,.1)";
      canvas.getContext("2d").fillRect(0, 0, canvas.width, canvas.height);
      canvas.getContext("2d").fillStyle = "rgba(0, 255, 0, .5)";
      letters.map(function(y_pos, index) {
        const min = Math.ceil(33);
        const max = Math.floor(125);
        const text = String.fromCharCode(Math.floor(Math.random() * (max - min + 1)) + min);
        const x_pos = index * 10;
        canvas.getContext("2d").fillText(text, x_pos, y_pos);
        letters[index] = (y_pos > (canvas.height - 200) + Math.random() * 1e4) ? 0 : y_pos + 10;
      });

      clock();
    };

    watch(locking, () => {
      if (locking.value) {
        lockTimer = setInterval(draw, 45);
      } else {
        clearInterval(lockTimer);
      }
    });

    const activeIndex = ref("1");

    keyManager.registerHotkeyProcessor("ctrl+alt+1", () => {
      service.invoke("/system/openDevTools", "", (result) => {
        console.log("打开开发者工具", result);
      });
    }, "打开开发者工具");

    keyManager.registerHotkeyProcessor("ctrl+shift+l", () => {
      locking.value = true;
      noteModel.stopColdDown();
    }, "锁定");

    window.electron.ipcRenderer.on("/client/error", function(event, arg) {
      console.error("错误", JSON.parse(arg));
    });

    let newVersionListener = function(event, arg) {
      console.log("新版本", arg);
      startUpdate.value = true;
    };
    window.electron.ipcRenderer.on("/client/updateAvailable", newVersionListener);

    let updateProgressListener = function(event, arg) {
      console.log("更新进度", arg);
      updateProgress.value = arg.percent;
    };
    window.electron.ipcRenderer.on("/client/updateProgress", updateProgressListener);

    let downloadedListener = function() {
      startUpdate.value = false;
      ElMessageBox.confirm("更新完成, 重启生效", "提示", {
        confirmButtonText: "重启",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        if (mainComponent.value.doSave && noteModel.currNote.value.changed) {
          mainComponent.value.doSave();
          setTimeout(() => {
            service.invoke("/update/install", "", (result) => {
              console.log("重启", result);
            });
          }, 1000);
        } else {
          service.invoke("/update/install", "", (result) => {
            console.log("重启", result);
          });
        }
      }).catch(() => {
        console.log("取消重启");
      });
    };
    window.electron.ipcRenderer.on("/client/downloaded", downloadedListener);

    const startUpdate = ref(false);
    const updateProgress = ref(0);

    const handleSelect = (index) => {
      switch (index) {
        case "2-1":
          if (mainComponent.value.createNewNote) {
            mainComponent.value.createNewNote();
          }
          break;
        case "2-2":
          if (mainComponent.value.listNote) {
            mainComponent.value.listNote();
          }
          break;
        case "2-4":
          if (mainComponent.value.doSave) {
            mainComponent.value.doSave();
          }
          break;
        case "2-5":
          if (mainComponent.value.doDelete) {
            mainComponent.value.doDelete();
          }
          break;
        case "2-6":
          if (mainComponent.value.doCrypt) {
            mainComponent.value.doCrypt();
          }
          break;
        case "2-10":
          videoList.value = [];
          dialogConvertVisible.value = true;
          break;
        case "4":
          dialogSettingVisible.value = true;
          nextTick(() => {
            settingDialog.value.updateSetting(noteModel.setting.value);
          });
          break;
        case "6-10":
          dialogAboutVisible.value = true;
          break;
        case "6-1":
          dialogHelpVisible.value = true;
          if (mainComponent.value.showHelp) {
            mainComponent.value.showHelp();
          }
          break;
        case "6-2":
          menu.value.open("1");
          nextTick(() => {
            startTour();
          });
          break;
        default:
          if (mainComponent.value.openNote) {
            let currNote = noteModel.recentNotes.value.find((note) => note.name === index);
            if (currNote) {
              mainComponent.value.openNote(currNote);
            }
          }
          break;
      }
    };

    const showTour = ref(false);
    const step = ref([]);
    const menu = ref();
    const startTour = () => {
      step.value = ["#idMenuFile", "#idNoteEditor"];
      let toolbar = document.querySelector(".vditor-toolbar");
      if (toolbar) {
        step.value.push(toolbar.children[21]);
        step.value.push(toolbar.children[24]);
        step.value.push(toolbar.children[25]);
        step.value.push(toolbar.children[26]);
        step.value.push(toolbar.children[27]);
        step.value.push(toolbar.children[28]);
        step.value.push(toolbar.children[29]);
        step.value.push(toolbar.children[31]);
        step.value.push(toolbar.children[34]);
        step.value.push("#idMenuSetting");
      }

      showTour.value = true;
    };

    const onChangeTour = (index) => {
      if (index === 1) {
        menu.value.close("1");
      }
    };

    const mainComp = noteModel.mainComp;

    const mainComponent = ref();

    const dialogAboutVisible = ref(false);
    const dialogSettingVisible = ref(false);
    const dialogHelpVisible = ref(false);
    const dialogConvertVisible = ref(false);

    const settingDialog = ref();

    const saveSetting = () => {
      let newSetting = settingDialog.value.setting;
      if (newSetting.password === noteModel.constPassword) {
        newSetting.password = noteModel.setting.value.password;
      } else if (newSetting.password) {
        newSetting.password = md5(newSetting.password + noteModel.constPassword);
      }
      noteModel.setting.value = newSetting;

      service.invoke("/store/updateSetting", JSON.stringify(noteModel.setting.value), (result) => {
        console.log("更新设置", result);
      });

      noteModel.startColdDown();
      dialogSettingVisible.value = false;
    };

    const videoList = ref([]);

    const showProgress = ref(false);

    const convertOptions = ref({
      h264: false, mp3: false
    });

    const versions = noteModel.versions;

    const doConvert = () => {
      console.log("转换视频", videoList.value);
      showProgress.value = true;
      service.invoke("/note/convert", JSON.stringify({
        files: videoList.value.map((file) => {
          let raw = file.raw;
          return {
            name: raw.name,
            path: raw.path,
            size: raw.size,
            type: raw.type,
            lastModified: raw.lastModified
          };
        }),
        options: convertOptions.value
      }), (result) => {
        showProgress.value = false;
        console.log("转换成功", result);
        ElMessage.success("转换成功");
        dialogConvertVisible.value = false;
      }, (error) => {
        console.error("转换失败", error);
        ElMessage.error("转换失败");
        showProgress.value = false;
      });
    };

    const loadVersion = (time) => {
      console.log("加载历史版本", time);
      if (mainComponent.value.loadVersion) {
        mainComponent.value.loadVersion(time);
      }
    };

    const unlock = () => {
      if (noteModel.setting.value.password !== "") {
        ElMessageBox.prompt("请输入密码", "解锁", {
          confirmButtonText: "解锁",
          cancelButtonText: "取消",
          inputType: "password"
        }).then(({ value }) => {
          if (!value) {
            value = "";
          }
          if (md5(value + noteModel.constPassword) == noteModel.setting.value.password) {
            locking.value = false;
            noteModel.startColdDown();
            locking.value = false;
          } else {
            ElMessage.error("密码错误");
          }
        }).catch(() => {
          console.log("取消解锁");
        });
      } else {
        locking.value = false;
        noteModel.startColdDown();
      }
    };

    watch(noteModel.settingReady, () => {
      if (!noteModel.setting.value.onlyForUnlock && noteModel.setting.value.password) {
        locking.value = true;
      }
    });

    return {
      unlock,
      menu,
      startUpdate,
      updateProgress,
      loadVersion,
      convertOptions,
      showProgress,
      dialogAboutVisible,
      dialogSettingVisible,
      dialogHelpVisible,
      dialogConvertVisible,
      videoList,
      activeIndex,
      doConvert,
      handleSelect,
      mainComp,
      mainComponent,
      currNote: noteModel.currNote,
      noteList: noteModel.noteList,
      recentNotes: noteModel.recentNotes,
      saveSetting,
      settingDialog,
      tags: noteModel.tags,
      versions,
      currVersion: noteModel.currVersion,
      showTour,
      startTour,
      step,
      onChangeTour,
      locking
    };
  }
};

</script>

<style lang="scss">
.el-header {
  height: 40px;
}

.el-menu--horizontal {
  height: 40px;
}

.title-bar {
  display: flex;
  flex-grow: 1;
  height: 100%;
  align-items: center;
  background-color: rgb(84, 92, 100);
  font-size: 14px;
  min-width: 1520px;
}

.cv {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 2000;
}
</style>
