<template>
  <transition name="slide-fade">
    <Splash v-if="showSplash"/>
  </transition>
  <el-container v-show="showNote" style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-header style="padding: 0px; display: flex; justify-content: space-between">
      <el-menu
          ref="menu"
          :default-active="activeIndex"
          active-text-color="#ffd04b"
          background-color="#545c64"
          class="el-menu-demo"
          mode="horizontal"
          popper-effect="dark"
          style="width: 400px;"
          text-color="#fff"
          @select="handleSelect"
      >
        <el-sub-menu index="1">
          <template #title>文件</template>
          <el-menu-item id="idMenuFile" index="2-1">
            <i class="iconfont icon-kingfishernew"></i>&nbsp;&nbsp;新建笔记
          </el-menu-item>
          <el-menu-item index="2-2"><i class="iconfont icon-kingfisheropen"></i>&nbsp;&nbsp;打开笔记</el-menu-item>
          <el-sub-menu index="2-3">
            <template #title><i class="iconfont icon-kingfishertime"></i>&nbsp;&nbsp;打开历史笔记</template>
            <el-menu-item v-for="note in recentNotes" :key="note.name" :index="note.name">
              {{ note.name.substring(0, note.name.indexOf('.')) }}
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item index="2-4"><i class="iconfont icon-kingfishersave"></i>&nbsp;&nbsp;保存笔记</el-menu-item>
          <el-menu-item index="2-5"><i class="iconfont icon-kingfisherdelete"></i>&nbsp;&nbsp;删除笔记</el-menu-item>
          <el-menu-item index="2-6"><i class="iconfont icon-kingfisherlock"></i>&nbsp;&nbsp;加密笔记</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>工具</template>
          <el-menu-item id="idMenuSetting" index="4-1"><i class="iconfont icon-kingfishersetting"></i>&nbsp;&nbsp;设置
          </el-menu-item>
          <el-menu-item index="4-2"><i class="iconfont icon-kingfisherconvert"></i>&nbsp;&nbsp;文件处理</el-menu-item>
          <el-menu-item index="4-3"><i class="iconfont icon-kingfisherfocus"></i>&nbsp;&nbsp;专注模式</el-menu-item>
          <el-menu-item v-if="developEnv" index="4-4"><i class="iconfont icon-kingfisherdebug"></i>&nbsp;&nbsp;调试工具-主窗口
          </el-menu-item>
          <el-menu-item v-if="developEnv" index="4-5"><i class="iconfont icon-kingfisherdebug"></i>&nbsp;&nbsp;调试工具-弹出窗口
          </el-menu-item>
          <el-sub-menu index="4-5">
            <template #title><i class="iconfont icon-kingfishertools"></i>&nbsp;&nbsp;其他工具</template>
            <el-menu-item index="4-5-1">截图</el-menu-item>
            <el-menu-item index="4-5-2">剪贴板管理</el-menu-item>
          </el-sub-menu>
        </el-sub-menu>
        <el-sub-menu index="6">
          <template #title>帮助</template>
          <el-menu-item index="6-1"><i class="iconfont icon-kingfisherhelp"></i>&nbsp;&nbsp;使用说明</el-menu-item>
          <el-menu-item index="6-2"><i class="iconfont icon-kingfisherbussiness-man"></i>&nbsp;&nbsp;快速上手
          </el-menu-item>
          <el-menu-item index="6-10"><i class="iconfont icon-kingfisherabout"></i>&nbsp;&nbsp;关于</el-menu-item>
        </el-sub-menu>
      </el-menu>
      <div class="title-bar">
        <div>正在编辑 &nbsp;<el-badge :is-dot="currNote.changed" :offset="[6,0]" style="color: chartreuse">
          {{ currNote.name ? currNote.name.substring(0, currNote.name.indexOf('.')) : '' }}
        </el-badge>
        </div>
        <div style="padding-left: 40px">
          标签:
          <el-select
              v-model="currNote.tags"
              :max-collapse-tags="3"
              :reserve-keyword="false"
              allow-create
              collapse-tags
              collapse-tags-tooltip
              default-first-option
              filterable
              multiple
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
              empty-text="没有历史版本"
              filterable
              placeholder="加载历史版本"
              style="width: 180px"
              @change="loadVersion"
          >
            <el-option
                v-for="version in versions"
                :key="version.time"
                :label="version.index + ' ' + version.duration"
                :title="version.label"
                :value="version.time"
            />
          </el-select>
        </div>
        <div v-if="targetTime> 0" style="padding-left: 40px; width: 300px;">
          <el-progress
              :percentage="restPercent"
              :stroke-width="20"
              :text-inside="true"
              status="success">
            <span style="color:white">您已经沉浸学习了 {{ studyTime }} </span>
          </el-progress>
        </div>
        <div v-if="developEnv" style="padding: 5px;">
          <el-button @click="reload">重新加载</el-button>
          <el-button @click="test">测试</el-button>
        </div>
      </div>
    </el-header>
    <el-main style="padding: 0">
      <component :is="mainComp" ref="mainComponent"></component>
    </el-main>
  </el-container>
  <el-dialog v-model="dialogHelpVisible" align-center draggable title="使用帮助" width="1200">
    <div id="idHelp" style="height: 600px; overflow-y: auto"></div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogHelpVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogAboutVisible" align-center title="关于" width="400">
    <p>作者：{{ '太白雪霁' }}</p>
    <p>版本：{{ version }}</p>
    <p>日期：{{ '2024-05-07' }}</p>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogAboutVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogSettingVisible" :close-on-click-modal="false" :close-on-press-escape="false" align-center
             draggable
             title="设置" width="800">
    <NoteSetting ref="settingDialog"></NoteSetting>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogSettingVisible = false">取消</el-button>
        <el-button @click="saveSetting">保存</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogSubtitleVisible" :close-on-click-modal="false" :close-on-press-escape="false" align-center
             draggable
             title="选择字幕" width="435">
    <el-table
        :data="subtitleList"
        border
        height="400"
        style="width: 100%"
        @row-click="handleSubtitleClick"
    >
      <el-table-column
          label="标题"
          prop="title"
          width="300">
      </el-table-column>
      <el-table-column
          label="语言"
          prop="language"
          width="100">
      </el-table-column>
      >
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogSubtitleVisible = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="dialogConvertVisible" :close-on-click-modal="false" :close-on-press-escape="false" align-center
             draggable
             title="文件处理" width="800">
    <el-upload
        v-model:file-list="videoList"
        :auto-upload="false"
        :multiple="false"
        accept="video/*,audio/*"
    >
      <el-button type="primary">选择文件</el-button>
      <template #tip>
        <div class="el-upload__tip">
          由于播放器不支持除了MP4格式以外的视频抓图和定位, 我们可以把其他类型的视频文件转换为MP4，也可以对文件进行其他操作
        </div>
      </template>
    </el-upload>
    <div style="width: 100%; display: flex; align-items: center; align-content: center">
      <div style="padding-right: 20px">转换编码</div>
      <el-checkbox v-model="convertOptions.h264">H264</el-checkbox>
      <el-checkbox v-model="convertOptions.mp3">MP3</el-checkbox>
    </div>
    <el-progress
        v-show="showProgress"
        :duration="10"
        :percentage="100"
        :stroke-width="15"
        status="success"
        striped
        striped-flow
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="doConvert">转换视频</el-button>
        <el-button @click="doCaptureAudio">抓取音轨</el-button>
        <el-button @click="doCaptureSubtitle">抓取字幕</el-button>
        <el-button @click="dialogConvertVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
  <el-tour v-model="showTour" :mask="{
      style: {
        boxShadow: 'inset 0 0 15px #333',
      },
      color: 'rgba(255, 255, 255, .3)',
    }" :z-index="9999" @change="onChangeTour">
    <el-tour-step :target="step[0]" placement="right" title="新建笔记">
      <div>点击菜单，创建一个新的笔记</div>
    </el-tour-step>
    <el-tour-step :target="step[1]" placement="center" title="编写笔记">
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
    <el-tour-step title="欢迎使用">
      <div>感谢大家使用灵翠笔记，软件的成熟还靠大家支持。</div>
    </el-tour-step>
  </el-tour>
  <div v-show="locking" class="cv" @click="unlock">
    <canvas id="_cv"></canvas>
  </div>
</template>

<script lang="js">
import {nextTick, onMounted, ref, watch} from 'vue';
import Splash from './Splash.vue';
import NoteMain from './NoteMain.vue';
import NoteSetting from './NoteSetting.vue';
import noteModel from '../model/note';
import service from '../utils/service';
import aiService from '../service/ai';
import {ElMessage, ElMessageBox} from 'element-plus';
import keyManager from '../utils/keys';
import md5 from 'md5';

export default {
  name: 'Home',
  components: {Splash, NoteMain, NoteSetting},
  setup() {
    let canvas;
    let letters = Array(512).join(1).split('');
    const locking = noteModel.locking;

    const screen = ref({
      width: 1920,
      height: 1080,
    });

    const initCanvas = () => {
      canvas = document.getElementById('_cv');
      canvas.getContext('2d');
      const _w = screen.value.width = window.innerWidth;
      const _h = screen.value.height = window.innerHeight;
      canvas.width = _w - 10;
      canvas.height = _h - 4;
    };

    let lockTimer;

    const showSplash = ref(true);
    const showNote = ref(false);

    onMounted(() => {
      initCanvas();
      window.onresize = () => initCanvas();
      setTimeout(() => {
        showSplash.value = false;
        setTimeout(() => showNote.value = true, 1000);
        }, 2000);
    });

    const draw = () => {
      canvas.getContext('2d').fillStyle = 'rgba(0,0,0,.1)';
      canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
      canvas.getContext('2d').fillStyle = 'rgba(0, 255, 0, .5)';
      letters.map(function(y_pos, index) {
        const min = Math.ceil(33);
        const max = Math.floor(125);
        const text = String.fromCharCode(Math.floor(Math.random() * (max - min + 1)) + min);
        const x_pos = index * 10;
        canvas.getContext('2d').fillText(text, x_pos, y_pos);
        letters[index] = y_pos > (canvas.height - 200) + Math.random() * 1e4 ? 0 : y_pos + 10;
      });
    };

    watch(locking, () => {
      if (locking.value) {
        lockTimer = setInterval(draw, 45);
      } else {
        clearInterval(lockTimer);
      }
    });

    const activeIndex = ref('1');

    keyManager.init();

    keyManager.registerHotkeyProcessor('ctrl+alt+1', () => service.invoke('/system/openDevTools', '',
        result => console.log('打开主窗口开发者工具', result)), '打开主窗口开发者工具');

    keyManager.registerHotkeyProcessor('ctrl+alt+2', () => service.invoke('/system/openPopDevTools', '',
        result => console.log('打开弹出窗口开发者工具', result)), '打开弹出窗口开发者工具');

    keyManager.registerHotkeyProcessor('f11', () => focusMode(60), '全屏');

    keyManager.registerHotkeyProcessor('ctrl+shift+alt+l', () => {
      window.event.preventDefault();
      noteModel.locking.value = true;
      noteModel.stopColdDown();
    }, '锁定');

    window.electron.ipcRenderer.on('/client/error', function(event, arg) {
      console.error('错误', JSON.parse(arg));
    });

    window.electron.ipcRenderer.on('/client/exitFullscreen', function(event, arg) {
      console.log('退出全屏', arg);
      targetTime.value = 0;
      clearInterval(studyTimer);
    });

    let downloadedListener = function() {
      ElMessageBox.confirm('更新完成, 重启生效', '提示', {
        confirmButtonText: '重启',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        if (mainComponent.value.doSave && noteModel.currNote.value.changed) {
          mainComponent.value.doSave();
          setTimeout(() => service.invoke('/update/install', '', result => console.log('重启', result)), 1000);
        } else {
          service.invoke('/update/install', '', result => console.log('重启', result));
        }
      }).catch(() => console.log('取消重启'));
    };
    window.electron.ipcRenderer.on('/client/downloaded', downloadedListener);

    function focusMode(value) {
      if (!value) {
        value = 60;
      }

      targetTime.value = value * 60;
      if (targetTime.value < 0) {
        targetTime.value = 0;
      }
      noteModel.openTime = Date.now();
      ElMessage({
        type: 'success',
        message: '已进入专注模式，其他程序将无法打扰您，ESC键退出专注模式',
        showClose: true,
        offset: 50,
      });

      studyTimer = setInterval(() => {
        let time = (Date.now() - noteModel.openTime) / 1000;
        let h = Math.floor(time / 3600);
        let m = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
        let s = Math.floor(time % 60).toString().padStart(2, '0');
        studyTime.value = `${h}小时 ${m}分钟 ${s}秒`;
        restPercent.value = Math.floor((time % targetTime.value) / targetTime.value * 100);

        if (Math.floor(time / 3600) > 0 && Math.floor((time % 3600) / 60) === 0 && Math.floor(time % 60) === 0) {
          ElMessage.success('您已经沉浸学习了一个小时，站起来运动一下吧！');
        }
      }, 1000);

      service.invoke('/system/fullscreen', '', () => {
      });
    }

    const handleSelect = index => {
      switch (index) {
        case '2-1':
          if (mainComponent.value.createNewNote) {
            mainComponent.value.createNewNote();
          }
          break;
        case '2-2':
          if (mainComponent.value.listNote) {
            mainComponent.value.listNote();
          }
          break;
        case '2-4':
          if (mainComponent.value.doSave) {
            mainComponent.value.doSave();
          }
          break;
        case '2-5':
          if (mainComponent.value.doDelete) {
            mainComponent.value.doDelete();
          }
          break;
        case '2-6':
          if (mainComponent.value.doCrypt) {
            mainComponent.value.doCrypt();
          }
          break;
        case '4-2':
          videoList.value = [];
          dialogConvertVisible.value = true;
          break;
        case '4-3':
          ElMessageBox.prompt('预计学习时间(分钟)', '专注模式', {
            confirmButtonText: '开始',
            cancelButtonText: '取消',
            inputType: 'number',
            inputPattern: /^\d+$/,
            inputErrorMessage: '请输入学习时间（分钟）',
            inputValue: 60,
          }).then(({value}) => focusMode(value)).catch(() => {
          });
          break;
        case '4-4':
          service.invoke('/system/openDevTools', '', () => {
          });
          break;
        case '4-5':
          service.invoke('/system/openPopDevTools', '', () => {
          });
          break;
        case '4-1':
          dialogSettingVisible.value = true;
          nextTick(() => settingDialog.value.updateSetting(noteModel.setting.value));
          break;
        case '4-5-1':
          window.open('https://zh.snipaste.com/', '_blank');
          break;
        case '4-5-2':
          window.open('https://www.joejoesoft.com/vcms/97/', '_blank');
          break;
        case '6-10':
          dialogAboutVisible.value = true;
          break;
        case '6-1':
          dialogHelpVisible.value = true;
          if (mainComponent.value.showHelp) {
            mainComponent.value.showHelp();
          }
          break;
        case '6-2':
          menu.value.open('1');
          nextTick(() => startTour());
          break;
        default:
          if (mainComponent.value.openNote) {
            let currNote = noteModel.recentNotes.value.find(note => note.name === index);
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
      step.value = ['#idMenuFile', '#idNoteEditor'];
      let toolbar = document.querySelector('.vditor-toolbar');
      if (toolbar) {
        step.value.push(toolbar.children[25]);
        step.value.push(toolbar.children[28]);
        step.value.push(toolbar.children[29]);
        step.value.push(toolbar.children[30]);
        step.value.push(toolbar.children[31]);
        step.value.push(toolbar.children[32]);
        step.value.push(toolbar.children[33]);
        step.value.push(toolbar.children[38]);
        step.value.push(toolbar.children[41]);
      }

      showTour.value = true;
    };

    const onChangeTour = index => {
      if (index === 1) {
        menu.value.close('1');
      }
    };

    const mainComp = noteModel.mainComp;

    const mainComponent = ref();

    const dialogAboutVisible = ref(false);
    const dialogSettingVisible = ref(false);
    const dialogHelpVisible = ref(false);
    const dialogConvertVisible = ref(false);

    const settingDialog = ref();

    const validate = setting => {
      let result = true;
      let errorMessage = '';

      if (setting.noteDir === '') {
        errorMessage += '笔记目录不能为空\n';
        result = false;
      } else if (setting.screenshotDir === '') {
        errorMessage += '截图目录不能为空\n';
        result = false;
      } else if (setting.assetsDir === '') {
        errorMessage += '资源目录不能为空\n';
        result = false;
      } else if (setting.lockTime == undefined || setting.lockTime === '') {
        errorMessage += '锁定时间不能为空\n';
        result = false;
      } else if (setting.lockTime < 1) {
        errorMessage += '锁定时间不能小于1分钟\n';
        result = false;
      } else if (setting.timestampOffset == undefined || setting.timestampOffset === '') {
        errorMessage += '时间签偏移不能为空\n';
        result = false;
      } else if (setting.timestampOffset < 0) {
        errorMessage += '时间签偏移不能小于0\n';
        result = false;
      } else if (setting.forwardStep == undefined || setting.forwardStep === '') {
        errorMessage += '快进步长不能为空\n';
        result = false;
      } else if (setting.forwardStep < 1) {
        errorMessage += '快进步长不能小于1\n';
        result = false;
      } else if (setting.aiServer !== '' && !setting.aiKey) {
        errorMessage += 'AI KEY不能为空\n';
        result = false;
      } else if (setting.aiKey !== '' && !setting.aiServer) {
        errorMessage += 'AI供应商不能为空\n';
        result = false;
      }

      if (errorMessage !== '') {
        ElMessage.error(errorMessage);
      }

      return result;
    };

    const saveSetting = () => {
      let newSetting = settingDialog.value.setting;

      if (validate(newSetting)) {
        if (newSetting.password === noteModel.constPassword) {
          newSetting.password = noteModel.setting.value.password;
        } else if (newSetting.password) {
          newSetting.password = md5(newSetting.password + noteModel.constPassword);
        }
        noteModel.setting.value = newSetting;

        service.invoke('/store/updateSetting', JSON.stringify(noteModel.setting.value), result => console.log(
            '更新设置', result));

        noteModel.startColdDown();
        dialogSettingVisible.value = false;
      }
    };

    const videoList = ref([]);

    const showProgress = ref(false);

    const convertOptions = ref({
      h264: false, mp3: false,
    });

    const versions = noteModel.versions;

    const doConvert = () => {
      console.log('转换视频', videoList.value);
      if (videoList.value.length > 0) {
        showProgress.value = true;
        service.invoke('/note/convert', JSON.stringify({
          files: videoList.value.map(file => {
            let raw = file.raw;
            return {
              name: raw.name,
              path: raw.path,
              size: raw.size,
              type: raw.type,
              lastModified: raw.lastModified,
            };
          }),
          options: convertOptions.value,
        }), result => {
          showProgress.value = false;
          console.log('转换成功', result);
          ElMessage.success('转换成功，请查看文件夹');
        }, error => {
          console.error('转换失败', error);
          ElMessage.error('转换失败');
          showProgress.value = false;
        });
      } else {
        ElMessage.error('请选择文件');
      }
    };

    const doCaptureAudio = () => {
      console.log('抓取音轨', videoList.value);
      if (videoList.value.length > 0) {
        showProgress.value = true;
        service.invoke('/note/captureAudio', JSON.stringify({
          files: videoList.value.map(file => {
            let raw = file.raw;
            return {
              name: raw.name,
              path: raw.path,
              size: raw.size,
              type: raw.type,
              lastModified: raw.lastModified,
            };
          }),
        }), result => {
          showProgress.value = false;
          console.log('抓取成功', result);
          ElMessage.success('抓取成功，请查看文件夹');
        }, error => {
          console.error('抓取失败', error);
          ElMessage.error('抓取失败');
          showProgress.value = false;
        });
      } else {
        ElMessage.error('请选择文件');
      }
    };

    const doCaptureSubtitle = () => {
      const ignoreList = ['优优独播剧场', '作曲 李宗盛', '请不吝点赞'];

      console.log('抓取字幕', videoList.value);
      if (videoList.value.length > 0) {
        showProgress.value = true;
        let firstFile = videoList.value[0];
        let firstFileName = firstFile.raw.name;
        if (firstFileName.endsWith('.mp3') || firstFileName.endsWith('.wav')
            || firstFileName.endsWith('.flac') || firstFileName.endsWith('.m4a')
            || firstFileName.endsWith('.aac') || firstFileName.endsWith('.wma')
            || firstFileName.endsWith('.ape') || firstFileName.endsWith('.ogg')
            || firstFileName.endsWith('.webm')) {
          service.invoke('/record/split', {fileName: firstFile.raw.path}, result => {
            if (result.files) {
              let text = [];
              let index = 0;
              stt(result.files[index], index);

              function stt(_file, i) {
                service.invoke('/store/downloadFile', _file, r => {
                  if (r.code === 200) {
                    let file = new File([r.data], Date.now() + '.mp3', {type: 'audio/mp3'});
                    aiService.stt(file, r => {
                      console.log('识别结果', r);
                      let ignore = false;
                      ignoreList.every(ignoreItem => {
                        if (r.message.indexOf(ignoreItem) > -1) {
                          ignore = true;
                          return false;
                        } else {
                          return true;
                        }
                      });
                      if (!ignore) {
                        text.push(r.message);
                      }
                      i++;
                      if (i < 10 && i < result.files.length) {
                        //if (i < result.files.length) {
                        stt(result.files[i], i);
                      } else {
                        console.log('识别完成');
                        service.invoke('/store/saveAsrResult', {
                          text: text.join('\n'),
                          fileName: firstFile.raw.path,
                          tempDir: _file,
                        }, result => {
                          if (result.code === 200) {
                            //ElMessage.success('保存成功');
                          } else {
                            ElMessage.error('保存失败');
                          }
                          showProgress.value = false;
                        }, error => {
                          console.error('保存失败', error);
                          ElMessage.error('保存失败');
                          showProgress.value = false;
                        });
                      }
                    });
                  } else {
                    ElMessage.error('下载失败');
                  }
                });
              }
            }
          });
        } else {
          let raw = firstFile.raw;
          service.invoke('/note/getStreams', JSON.stringify({
            files: {
              name: raw.name,
              path: raw.path,
              size: raw.size,
              type: raw.type,
              lastModified: raw.lastModified,
            },
          }), result => {
            showProgress.value = false;
            console.log('抓取成功', result);
            if (result.code === 200) {
              subtitleList.value = result.result.filter(item => item.codec_type === 'subtitle').map(item => ({
                path: raw.path,
                index: item.index,
                codecName: item.codec_name,
                title: item.tags.title,
                language: item.tags.language,
              }));
              dialogSubtitleVisible.value = true;
            } else {
              ElMessage.error('流信息获取失败');
            }
          }, error => {
            console.error('抓取失败', error);
            ElMessage.error('流信息获取失败');
            showProgress.value = false;
          });
        }
      } else {
        ElMessage.error('请选择文件');
      }
    };

    const handleSubtitleClick = row => {
      console.log('选择字幕', row);
      dialogSubtitleVisible.value = false;
      showProgress.value = true;
      service.invoke('/note/extractSubtitle', JSON.stringify(row), result => {
        console.log('抓取成功', result);
        ElMessage.success('抓取成功，请查看文件夹');
        showProgress.value = false;
      }, error => {
        console.error('抓取失败', error);
        ElMessage.error('抓取失败');
        showProgress.value = false;
      });
    };

    const subtitleList = ref([]);
    const dialogSubtitleVisible = ref(false);

    const loadVersion = time => {
      console.log('加载历史版本', time);
      if (mainComponent.value.loadVersion) {
        mainComponent.value.loadVersion(time);
      }
    };

    const unlock = () => {
      if (noteModel.setting.value.password !== '') {
        ElMessageBox.prompt('请输入密码', '解锁', {
          confirmButtonText: '解锁',
          cancelButtonText: '取消',
          inputType: 'password',
        }).then(({value}) => {
          if (!value) {
            value = '';
          }
          if (md5(value + noteModel.constPassword) === noteModel.setting.value.password) {
            locking.value = false;
            noteModel.startColdDown();
            locking.value = false;
          } else {
            ElMessage.error('密码错误');
          }
        }).catch(() => console.log('取消解锁'));
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

    const studyTime = ref('');
    const restPercent = ref(0);
    let targetTime = ref(0);
    let studyTimer = 0;

    const developEnv = import.meta.env.DEV;
    const reload = () => window.location.reload();

    let record = false;

    const test = () => {
      /*service.invoke('/record/split', {fileName: "D:\\Movie\\1.mp3"}, result => {
        console.log('测试', result)
        if (result.files) {
          let text = [];
          let index = 0;
          stt(result.files[index], index);

          function stt(file, i){
            service.invoke('/store/downloadFile', file, r => {
              if (r.code === 200) {
                let file = new File([r.data], Date.now() + ".mp3", {type: 'audio/mp3'});
                aiService.stt(file, r => {
                  console.log('识别结果', r);
                  text.push(r.message);
                  i++
                  if (i < 10) {
                    stt(result.files[i], i);
                  } else {
                    console.log('识别完成', text.join('\n'));
                  }
                });
              } else {
                ElMessage.error('下载失败');
              }
            });
          }
        }
      });*/
      service.invoke('/ai/analysisSubtitle', {
        fileName: 'BV1X7411F744-1.bilibili.json',
      }, result => {
        if (result.code === 200) {
          console.log('分析结果', result.data);
        } else {
          ElMessage.warning(result.message);
        }
      });

    };

    return {
      test,
      developEnv,
      reload,
      studyTime,
      restPercent,
      targetTime,
      unlock,
      menu,
      loadVersion,
      convertOptions,
      showProgress,
      dialogAboutVisible,
      dialogSettingVisible,
      dialogHelpVisible,
      dialogConvertVisible,
      dialogSubtitleVisible,
      subtitleList,
      handleSubtitleClick,
      videoList,
      activeIndex,
      doConvert,
      doCaptureAudio,
      doCaptureSubtitle,
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
      locking,
      showSplash,
      showNote,
      version: __APP_VERSION__,
    };
  },
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

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
