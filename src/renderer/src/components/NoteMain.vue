<template>
  <el-container style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-aside :width="videoWidth" style="margin: 0px; padding: 0px;">
      <video-window v-if="videoUrl != '' && videoWidth !== '0%' && !drag" ref="video"
                    :embed="true" :url-str="videoUrl"></video-window>
    </el-aside>
    <div v-show="videoWidth !== '0%'" id="dragBar-dept" class="vertical-dragbar"></div>
    <el-main id="idMainContainer" style="margin: 0px; padding: 0px;">
      <div v-show="textSearch.show" class="search-panel">
        <el-input ref="searchBox" v-model="textSearch.text" @keydown.enter="search"></el-input>
        <el-button @click="search">搜索</el-button>
        <el-input v-model="textSearch.replace"></el-input>
        <el-button @click="replace">替换</el-button>
        <el-button @click="searchNext">下一个</el-button>
        <el-button @click="searchPrev">上一个</el-button>
        <el-button @click="closeSearch">X</el-button>
      </div>
      <div id="idNoteEditor" ref="noteEditor">
      </div>
    </el-main>
  </el-container>
  <input ref="fileInput" accept="video/*,audio/*,application/pdf,text/html" style="display: none" type="file"
         @change="selectFileAndPlay" />
  <el-dialog v-model="dialogOpenVisible" align-center draggable title="打开笔记" width="900">
    <el-input v-model="noteSearch" placeholder="搜索笔记, 可以根据名字和标签搜索, 支持拼音搜索">
      <template #append>
        全文：
        <el-switch v-model="fullTextSearch" />
      </template>
    </el-input>
    <el-table v-if="!fullTextSearch" :data="noteList" empty-text="没有找到笔记" max-height="200px" stripe
              style="width: 100%" @row-click="openNote">
      <el-table-column label="名称" prop="name" sortable width="280">
        <template #default="scope">
          {{ scope.row.name.substring(0, scope.row.name.indexOf('.')) }}
        </template>
      </el-table-column>
      <el-table-column label="修改时间" prop="time" sortable width="180">
        <template #default="scope">
          {{ scope.row.time.toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="标签" prop="time" width="200">
        <template #default="scope">
          <div style="display: flex; overflow: hidden">
            <div v-for="tag in scope.row.tags" :key="tag"
                 :style="{borderColor:tags.find(t=>t.value === tag)?.color || '#FFFFF'}"
                 class="tag">{{ tag }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="大小" prop="count" width="100">
        <template #default="scope">
          {{ scope.row.count ? (scope.row.count / 1024).toFixed(2) + 'KB' : '1KB' }}
        </template>
      </el-table-column>
      <el-table-column label="收藏" prop="time" width="100">
        <template #default="scope">
          {{ scope.row.like ? '★' : '' }}
        </template>
      </el-table-column>
    </el-table>
    <el-table v-else :data="noteList" empty-text="没有找到笔记" max-height="200px" style="width: 100%"
              @row-click="openNote">
      <el-table-column label="名称" prop="name" width="280">
        <template #default="scope">
          {{ scope.row.name.substring(0, scope.row.name.indexOf('.')) }}
        </template>
      </el-table-column>
      <el-table-column label="行号" prop="time" width="80">
        <template #default="scope">
          {{ scope.row.line }}
        </template>
      </el-table-column>
      <el-table-column label="内容" prop="time" width="400">
        <template #default="scope">
          <div style="overflow: hidden">{{ scope.row.content }}</div>
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
import {computed, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import Vditor from 'vditor';
import VideoWindow from './Video.vue';
import keyManager from '../utils/keys';
import service from '../utils/service';
import noteModel from '../model/note';
import utils from '../utils/utils';
import website from '../utils/website';
import aiService from '../service/ai';
import helpContent from '../help.md?raw';
import {ElMessage, ElMessageBox} from 'element-plus';
import {handleEvent, initPlugins, plugins} from '../plugin';

export default {
  name: 'NoteMain',
  components: {VideoWindow},
  setup() {
    const noteEditor = ref();
    const recentNotes = noteModel.recentNotes;
    let editor;
    let lastVideo;
    const drag = ref(false);

    initPlugins();

    onMounted(() => {
      if (noteModel.setting.value.openLastNote) {
        setTimeout(() => {
          let lastNote = localStorage.getItem('NOTE');
          if (lastNote) {
            callOpen(JSON.parse(lastNote));
          }
        }, 1000);
      }

      window.addEventListener('message', event => console.log('接收到消息', event.data));

      let recentNotesStr = localStorage.getItem('RECENT_NOTES');
      if (recentNotesStr) {
        recentNotes.value = JSON.parse(recentNotesStr);
      }

      setLayoutDrag('dragBar-dept');
    });

    const showVideo = computed(() => 'same' === noteModel.setting.value.displayMode);

    let lastSaveTime = 0;
    const doSave = (cb, auto = false) => {
      if (new Date().getTime() - lastSaveTime < 1000) {
        return;
      }
      lastSaveTime = new Date().getTime();
      if (event) {
        event.preventDefault();
      }
      let note = noteModel.currNote.value;
      if (note.name) {
        note.data = editor.getValue();
        if (!auto) {
          note.changed = false;
        }
        localStorage.setItem('NOTE', JSON.stringify({
          name: note.name,
        }));
        service.invoke('/store/saveNote', JSON.stringify({
          path: note.name,
          data: note.data,
          tags: note.tags,
          key: note.key,
          like: note.like,
          auto: auto,
        }), result => {
          console.log('保存笔记成功', result);
          if (!auto) {
            ElMessage.success('保存笔记成功');
          }
          if (cb) {
            cb();
          }
        });
      } else {
        if (!auto) {
          ElMessage.warning('请先打开一个笔记');
        }
      }
    };

    keyManager.registerHotkeyProcessor('ctrl+s', (event, handler) => doSave(), '保存笔记');

    const fileInput = ref(null);

    const video = ref();

    const selectFileAndPlay = event => {
      const file = event.target.files[0];
      openVideo(file.path, true);
    };

    const gotoPage = page => {
      if ('same' === noteModel.setting.value.displayMode) {
        noteModel.currPage.value = page;
      } else {
        service.invoke('/note/changePage', JSON.stringify({page}), result => console.log('切换页面', result));
      }
    };

    const openVideo = (video, insertNote = false, cb) => {
      if ('same' === noteModel.setting.value.displayMode) {
        noteModel.videoUrl.value = video;
      } else {
        service.send('window-new', {route: '/video/' + encodeURIComponent(video), alwaysOnTop: true});
      }
      lastVideo = video;
      noteModel.currPage.value = 1;

      if (cb) {
        setTimeout(() => cb(), 2000);
      }

      if (insertNote) {
        let newContent;
        if (video.startsWith('vhttps://') || video.startsWith('vhttp://')) {
          video = website.replaceWebsite(video);
          newContent = `\n\n[[在线资料 ${video}]](${video})\n`;
        } else {
          let fileName = video.substring(video.lastIndexOf('\\') + 1);
          newContent = `\n\n[[本地资料 ${fileName}]](kingfisher://${encodeURIComponent(video + '/')})\n`;
          lastVideo = video + '/';
        }
        if (editor.getValue().indexOf(newContent) === -1) {
          insertText(newContent);
          noteModel.markChanged();
        }
      }
    };

    watch(noteModel.currNote, () => {
      if (editor && noteModel.currNote.value.data) {
        utils.runUntil(() => {
          return editor.vditor.lute != null;
        }, () => {
          editor.setValue(noteModel.currNote.value.data);
        });
      }
    });

    const handleUpload = (_, data) => {
      let res = JSON.parse(data);
      if (res.code === 200) {
        let path = res.result.path;
        if (path.endsWith('.wav') || path.endsWith('.mp3')) {
          insertText(
            `\n\n[音频](kingfisher://${path}) [[转文字](tts://${path.substring(path.lastIndexOf('/') + 1) + '/'})]\n`);
        } else if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.gif')
          || path.endsWith('.bmp') || path.endsWith('.webp')) {
          insertText(`\n\n![](kingfisher://${path})\n`);
        } else {
          insertText(`\n\n[[附件 ${path.substring(path.lastIndexOf('/') + 1)}]](kingfisher://${path})\n`);
        }
      } else {
        ElMessage.error('上传失败');
      }
    };

    let lastPosition = null;

    watch(() => noteEditor.value, () => {
      if (noteEditor.value) {
        editor = new Vditor('idNoteEditor', {
          cdn: 'http://localhost:13999/vditor',
          theme: 'dark',
          width: '100%',
          height: '100%',
          mode: 'sv',
          value: noteModel.currNote.value.data ? noteModel.currNote.value.data : '',
          icon: 'material',
          cache: {
            enable: false,
          },
          upload: {
            url: 'http://localhost:13999/upload/assets',
            success: handleUpload,
            max: 20 * 1024 * 1024 * 1024,
          },
          keydown: event => {
            if (!event.ctrlKey && event.code != 'Enter') {
              noteModel.markChanged();
              stopVideo();
            } else if (event.code === 'Enter') {
              if (noteModel.setting.value.autoTimestamp) {
                let selObj = window.getSelection();
                let range = selObj.getRangeAt(0);
                let content = range.startContainer.textContent;
                let currNode = selObj.anchorNode;
                let parentNode = currNode.parentNode;
                while (parentNode.tagName !== 'DIV') {
                  parentNode = parentNode.parentNode;
                }
                if ((noteModel.setting.value.autoTimestamp === 'chapter' &&
                    currNode.parentNode.innerText.indexOf('[[位置')
                    === -1 && currNode.parentNode.previousSibling?.innerText?.startsWith('#'))
                  || (noteModel.setting.value.autoTimestamp === 'any' && content.length > 0
                    && content.replaceAll('\n', '') !== '' && content.indexOf('[[位置') === -1
                    && content !== ')')) {
                  handleInsert = (data) => {
                    let text = formatTime(data.time);
                    selObj = window.getSelection();
                    range = selObj.getRangeAt(0);
                    range.deleteContents();
                    let node = document.createTextNode(text + '\n');
                    range.insertNode(node);
                    let container = range.startContainer;
                    while (container.nextSibling) {
                      container = container.nextSibling;
                    }
                    range.setStart(container, 0);
                    range.setEnd(container, 0);
                    handleInsert = null;
                  };
                  insertContent('timestamp');
                }
              }
            }
            noteModel.startColdDown();
          },
          blur: () => {
            let selObj = window.getSelection();
            lastPosition = selObj.getRangeAt(0);
          },
          focus: () => {
            if (lastPosition) {
              let selObj = window.getSelection();
              selObj.removeAllRanges();
              selObj.addRange(lastPosition);
              console.log(lastPosition);
              lastPosition = null;
            }
          },
          preview: {
            delay: 200,
            theme: {
              current: 'dark',
            },
            actions: [],
            markdown: {
              toc: true,
            },
          },
          outline: {
            enable: true,
          },
          link: {
            click: dom => {
              let result = false;

              plugins.every(plugin => {
                if (plugin.onClickLink) {
                  result = plugin.onClickLink(dom.innerText, dom.href);
                }
                return !result;
              });

              if (!result) { // 如果没有插件处理
                if (dom.href.startsWith('tts://')) {
                  let path = dom.href.replace('tts://', '');
                  path = path.substring(0, path.length - 1);
                  service.invoke('/store/downloadAsset', path, result => {
                    if (result.code === 200) {
                      let file = new File([result.data], 'audio.wav', {type: 'audio/wav'});
                      aiService.stt(file, result => {
                        insertText(`\n> ${result.message}\n`);
                      });
                    } else {
                      ElMessage.error('下载失败');
                    }
                  });
                  return false;
                }
                if (dom.href.startsWith('page://')) {
                  nextTick(() => gotoPage(dom.href.replace('page://', '')));
                  return false;
                } else if (dom.href === 'https://' && openBible(dom.innerText)) {
                  return false;
                } else if (dom.href.startsWith('timestamp://')) {
                  let content = editor.getValue();
                  let index = content.indexOf(dom.href);
                  content = content.substring(0, index);
                  let videoIndex = Math.max(content.lastIndexOf('[在线资料'), content.lastIndexOf('[本地资料'));
                  let videoUrl = '';
                  if (videoIndex !== -1) {
                    let startIndex = content.indexOf('(', videoIndex);
                    let endIndex = content.indexOf(')', videoIndex);
                    videoUrl = decodeURIComponent(
                      content.substring(startIndex + 1, endIndex).replace('kingfisher://', ''));
                    if (videoUrl.startsWith('vhttps://') || videoUrl.startsWith('vhttp://')) {
                      videoUrl = website.handleReplacedWebsite(videoUrl);
                    }
                  }
                  if (lastVideo != videoUrl) {
                    closeVideo();
                    nextTick(() =>
                      openVideo(videoUrl, false, () => {
                        service.invoke('/note/locateVideo', JSON.stringify({
                          videoUrl,
                          location: dom.href.replace('timestamp://', ''),
                        }));
                      }));
                  } else {
                    service.invoke('/note/locateVideo', JSON.stringify({
                      videoUrl,
                      location: dom.href.replace('timestamp://', ''),
                    }));
                  }
                } else if (dom.href.startsWith('kingfisher://')) {
                  if (dom.href.indexOf('.mp4') !== -1 || dom.href.indexOf('.webm') !== -1) {
                    closeVideo();
                    nextTick(() => openVideo(decodeURIComponent(dom.href.replace('kingfisher://', ''))));
                  } else {
                    service.invoke('/note/openFile', JSON.stringify({path: dom.href.replace('kingfisher://', '')}));
                  }
                  return false;
                } else if (dom.href.startsWith('vhttp://') || dom.href.startsWith('vhttps://')) {
                  closeVideo();
                  nextTick(() => {
                    let url = website.handleReplacedWebsite(dom.href);
                    openVideo(decodeURIComponent(url));
                  });
                  return false;
                } else if (dom.href === 'https://') {
                  return false;
                }
              }
            },
          },
          toolbar: [
            'emoji', 'headings', 'bold', 'italic', 'strike', '|', 'line', 'quote',
            'list', 'ordered-list', 'check', 'outdent', 'indent', 'code', 'inline-code',
            'insert-after', 'insert-before', 'undo', 'redo',
            {
              hotkey: '⌘L',
              name: 'insert-link',
              tipPosition: 's',
              tip: '插入链接',
              className: 'right',
              icon: '<svg t="1714563898775" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4246" width="200" height="200"><path d="M341.205333 682.666667H170.922667A85.12 85.12 0 0 1 85.333333 597.418667V426.581333C85.333333 379.178667 123.648 341.333333 170.922667 341.333333h170.282666A85.333333 85.333333 0 0 1 426.666667 426.666667H170.922667C170.538667 426.666667 170.666667 597.418667 170.666667 597.418667c0 0.128 256-0.085333 256-0.085334 0 47.146667-38.101333 85.333333-85.461334 85.333334z m511.872-85.333334c0.426667 0 0.256-170.752 0.256-170.752L597.333333 426.666667c0-47.146667 38.101333-85.333333 85.461334-85.333334h170.282666C900.352 341.333333 938.666667 379.178667 938.666667 426.581333v170.837334A85.12 85.12 0 0 1 853.077333 682.666667h-170.282666A85.333333 85.333333 0 0 1 597.333333 597.333333h255.744z m-213.205333-128A42.410667 42.410667 0 0 1 682.666667 512c0 23.722667-19.157333 42.666667-42.794667 42.666667H384.128A42.410667 42.410667 0 0 1 341.333333 512c0-23.722667 19.157333-42.666667 42.794667-42.666667h255.744z" fill="#FFFFFF" p-id="4247"></path></svg>',
              click() {
                if (window.event.ctrlKey) {
                  handleEvent({name: 'insertLink'}, (result) => {
                    if (result) {
                      editor.focus();
                      nextTick(() => {
                        editor.insertValue(result);
                      });
                    }
                  });
                } else {
                  editor.focus();
                  nextTick(() => {
                    editor.insertValue('\n[]()\n');
                  });
                }
              },
            },
            'table', '|',
            {
              hotkey: '⌘F',
              name: 'find',
              tipPosition: 's',
              tip: '搜索替换',
              className: 'right',
              icon: '<svg t="1714514005198" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8146" width="200" height="200"><path d="M352 761.6L89.6 1024s-25.6 0-57.6-32-32-57.6-32-57.6l262.4-262.4 89.6 89.6z" fill="#FFFFFF" p-id="8147"></path><path d="M128 448c0-249.6 198.4-448 448-448s448 198.4 448 448-198.4 448-448 448-448-198.4-448-448z m64 0c0 211.2 172.8 384 384 384s384-172.8 384-384-172.8-384-384-384-384 172.8-384 384z" fill="#FFFFFF" p-id="8148"></path><path d="M576 185.6C428.8 185.6 313.6 300.8 313.6 448s115.2 262.4 262.4 262.4 262.4-115.2 262.4-262.4S723.2 185.6 576 185.6z" fill="#FFFFFF" opacity=".5" p-id="8149"></path></svg>',
              click() {
                textSearch.value.show = !textSearch.value.show;
                searchBox.value.focus();
                lastSearchPosition = null;
              },
            },
            , 'record', 'upload', 'help', '|',
            {
              hotkey: '⌘N',
              name: 'load',
              tipPosition: 's',
              tip: '打开',
              className: 'right',
              icon: '<svg t="1713836989991" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4260" width="200" height="200"><path d="M1017.710702 615.33899l-180.95076 342.465326c-8.852692 17.028262-33.9477 35.039388-53.326892 35.039389l-725.654765 0.133006a57.745465 57.745465 0 0 1-40.860574-16.917711A57.790376 57.790376 0 0 1 0 935.198426l0.11746-563.478622c0-31.866238 25.832588-57.723009 57.702281-57.754101l53.055697-0.050094v49.222697H75.380028a26.217788 26.217788 0 0 0-18.536242 7.67291 26.231607 26.231607 0 0 0-7.672909 18.536242l0.05182 528.218133c0 14.489051 11.740829 26.209152 26.214334 26.209151h36.352178l171.491766-346.914992c9.688732-19.379191 27.996964-35.041116 47.348518-35.041115h419.989001l0.143371-139.609983c27.423482 2.542666 49.067235 25.290199 49.067235 53.363166v86.248544H992.451595c22.747533 0.233193 41.902168 22.726805 25.259107 53.518628z m-873.376405 153.803655c-1.566711-172.681914 0-690.741474 0-690.741474 0-26.13833 21.256826-47.37961 47.369246-47.379609h379.351257c6.076834 0 11.873836 2.542666 15.979757 7.014787l122.642178 133.249862a21.804397 21.804397 0 0 1 5.736545 14.708425v345.192819h-39.787887V215.801867a9.896015 9.896015 0 0 0-9.894287-9.889105h-93.869632c-10.985975 0-19.919853-8.918332-19.919853-19.883579V80.703735a9.894287 9.894287 0 0 0-9.894287-9.889105H191.727726a7.60036 7.60036 0 0 0-7.591724 7.586541v647.307142l-30.446352 61.597466c0.001727-0.010364-9.198163-0.684032-9.355353-18.163134z m447.436667-603.002223H650.86722l-59.096256-64.236864v64.236864z m21.552203 80.296079H246.688695c-13.507913 0-24.47316 10.975611-24.47316 24.483525 0 13.497549 10.975611 24.478342 24.47316 24.478342h366.644836c13.507913 0 24.50598-10.98943 24.50598-24.478342-0.022456-13.497549-11.017068-24.483524-24.516344-24.483525z m24.493889 167.050738c0-13.497549-10.984248-24.462796-24.493889-24.462796H246.688695c-13.507913 0-24.47316 10.985975-24.47316 24.462796 0 13.497549 10.975611 24.462796 24.47316 24.462796h366.644836c13.488912 0.001727 24.483524-10.965247 24.483525-24.462796zM222.199989 557.020043c0 13.495822 10.980793 24.462796 24.478342 24.462796h8.790507c15.473643-43.126863 53.831279-48.925592 53.83128-48.925592h-62.621787c-13.476821 0-24.478342 10.965247-24.478342 24.462796z" fill="#FFFFFF" p-id="4261"></path></svg>',
              click() {
                listNote();
              },
            },
            {
              hotkey: '⌘S',
              name: 'save',
              tipPosition: 's',
              tip: '保存',
              className: 'right',
              icon: '<svg t="1713601492576" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5395" width="200" height="200"><path d="M714.8 6.8H98.6C48 6.8 6.8 48 6.8 98.6v826.7c0 50.7 41.2 91.9 91.9 91.9h826.7c50.7 0 91.9-41.2 91.9-91.9v-616L714.8 6.8zM557.9 98.6v321.5H282.4V98.6h275.5zM98.6 925.4V98.6h91.9v344.3c0 38.1 31 69.1 69.1 69.1h321.1c38.1 0 69.1-31 69.1-69.1V98.6h26.9l248.7 248.7 0.1 578.1H98.6z" fill="#FFFFFF" p-id="5396"></path></svg>',
              click() {
                doSave();
              },
            },
            {
              hotkey: '⇧⌘V',
              name: 'open-video',
              tipPosition: 's',
              tip: '打开本地文件',
              className: 'right',
              icon: '<svg t="1713601614404" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6562" width="200" height="200"><path d="M157.538462 689.230769v-11.815384 23.630769-11.815385zM905.846154 39.384615H118.153846C74.830769 39.384615 39.384615 74.830769 39.384615 118.153846v708.923077c0 43.323077 35.446154 78.769231 78.769231 78.769231h236.307692c11.815385 0 19.692308-7.876923 19.692308-19.692308v-78.769231c0-11.815385-7.876923-19.692308-19.692308-19.692307H187.076923c-15.753846 0-29.538462-13.784615-29.538461-29.538462v-492.307692c0-15.753846 13.784615-29.538462 29.538461-29.538462h649.846154c15.753846 0 29.538462 13.784615 29.538461 29.538462v492.307692c0 15.753846-13.784615 29.538462-29.538461 29.538462H669.538462c-11.815385 0-19.692308 7.876923-19.692308 19.692307v78.769231c0 11.815385 7.876923 19.692308 19.692308 19.692308h236.307692c43.323077 0 78.769231-35.446154 78.769231-78.769231V118.153846c0-43.323077-35.446154-78.769231-78.769231-78.769231z m-167.384616 641.969231l41.353847-41.353846c11.815385-11.815385 11.815385-29.538462 0-41.353846L531.692308 350.523077c-11.815385-11.815385-29.538462-11.815385-41.353846 0L244.184615 596.676923c-11.815385 11.815385-11.815385 29.538462 0 41.353846l41.353847 41.353846c11.815385 11.815385 29.538462 11.815385 41.353846 0l90.584615-90.584615c11.815385-11.815385 35.446154-3.938462 35.446154 13.784615v352.492308c0 15.753846 11.815385 29.538462 27.569231 29.538462h59.076923c15.753846 0 31.507692-13.784615 31.507692-29.538462V602.584615c0-17.723077 19.692308-25.6 33.476923-13.784615l90.584616 92.553846c11.815385 9.846154 31.507692 9.846154 43.323076 0z" fill="#FFFFFF" p-id="6563"></path></svg>',
              click() {
                if (noteModel.currNote.value.name) {
                  fileInput.value.click();
                } else {
                  ElMessage.warning('请先打开一个笔记');
                }
              },
            },
            {
              hotkey: '⇧⌘U',
              name: 'open-url',
              tipPosition: 's',
              tip: '打开网址',
              className: 'right',
              icon: '<svg t="1713771194939" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20294" width="200" height="200"><path d="M512 955.733333C268.8 955.733333 68.266667 755.2 68.266667 512S264.533333 68.266667 512 68.266667 951.466667 268.8 951.466667 512 755.2 955.733333 512 955.733333z m0-819.2c-209.066667 0-379.733333 170.666667-379.733333 379.733334S302.933333 896 512 896s375.466667-170.666667 375.466667-379.733333c0-213.333333-166.4-379.733333-375.466667-379.733334z" fill="#FFFFFF" p-id="20295"></path><path d="M533.333333 955.733333C409.6 955.733333 341.333333 729.6 341.333333 512 341.333333 298.666667 409.6 68.266667 533.333333 68.266667S725.333333 294.4 725.333333 512c0 213.333333-68.266667 443.733333-192 443.733333z m0-819.2c-51.2 0-128 145.066667-128 379.733334s72.533333 379.733333 128 379.733333c51.2 0 128-145.066667 128-379.733333 0-238.933333-72.533333-379.733333-128-379.733334z" fill="#FFFFFF" p-id="20296"></path><path d="M115.2 482.133333h836.266667v64H115.2z" fill="#FFFFFF" p-id="20297"></path></svg>',
              click() {
                if (noteModel.currNote.value.name) {
                  ElMessageBox.prompt('请输入网址', '打开网址', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /\S/,
                    inputErrorMessage: '网址不能为空',
                  }).
                    then(({value}) => openVideo(value.replace('http', 'vhttp'), true)).
                    catch(() => console.log('取消打开网址'));
                } else {
                  ElMessage.warning('请先打开一个笔记');
                }
              },
            },
            {
              hotkey: '⇧⌘T',
              name: 'insert-time',
              tipPosition: 's',
              tip: '插入时间',
              className: 'right',
              icon: '<svg t="1713751961582" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5255" width="20" height="20"><path d="M512 1022.060606c281.69697 0 510.060606-228.363636 510.060606-510.060606S793.69697 1.939394 512 1.939394 1.939394 230.30303 1.939394 512 230.30303 1022.060606 512 1022.060606z m0-58.181818c-249.565091 0-451.878788-202.313697-451.878788-451.878788C60.121212 262.434909 262.434909 60.121212 512 60.121212c249.565091 0 451.878788 202.313697 451.878788 451.878788 0 249.565091-202.313697 451.878788-451.878788 451.878788z" fill="#FFFFFF" p-id="5256"></path><path d="M326.120727 363.368727l166.787879 174.545455a29.090909 29.090909 0 1 0 42.061576-40.192l-166.787879-174.545455A29.090909 29.090909 0 0 0 326.120727 363.364848z" fill="#FFFFFF" p-id="5257"></path><path d="M876.625455 665.755152l-347.849697-172.070788a29.090909 29.090909 0 1 0-25.79394 52.146424l347.845818 172.070788a29.090909 29.090909 0 0 0 25.79394-52.150303z" fill="#FFFFFF" p-id="5258"></path></svg>',
              click() {
                if (noteModel.currNote.value.name) {
                  insertContent('timestamp');
                } else {
                  ElMessage.warning('请先打开一个笔记');
                }
              },
            },
            {
              hotkey: '⇧⌘P',
              name: 'insert-screenshot',
              tipPosition: 's',
              tip: '插入截图',
              className: 'right',
              icon: '<svg t="1713752087666" class="icon" viewBox="0 0 1280 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13508" width="200" height="200"><path d="M1184 1024H96c-52.928 0-96-43.072-96-96V96c0-52.928 43.072-96 96-96h1088c52.928 0 96 43.072 96 96v832c0 52.928-43.072 96-96 96zM128 128v768l297.376-297.376a32.096 32.096 0 0 1 45.248 0L576 704 1152 128H128z m224 320a96 96 0 1 1 0-192 96 96 0 0 1 0 192z" fill="#FFFFFF" p-id="13509"></path></svg>',
              click() {
                if (noteModel.currNote.value.name) {
                  insertContent('screenshot');
                } else {
                  ElMessage.warning('请先打开一个笔记');
                }
              },
            },
            {
              hotkey: '⇧⌘A',
              name: 'insert-all',
              tipPosition: 's',
              tip: '插入截图和时间',
              className: 'right',
              icon: '<svg t="1713752331119" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18671" width="200" height="200"><path d="M128 128h384v224l32 32H768v64h64V307.2l-9.6-23.04-209.92-211.2L590.08 64H96l-32 32v832l32 32H320v-64H128V128z m448 0l192 192H576V128z m352 384h-512l-32 32v384l32 32h512l32-32v-384l-32-32zM896 576v256l-104.32-102.4h-45.44l-74.24 74.88-136.32-136.32h-45.44L448 710.4V576h448z m-179.2 273.28l51.84-51.84L867.2 896h-103.68l-46.72-46.72zM448 896v-95.36l64-64L673.28 896H448z m352-224a32 32 0 1 0 0-64 32 32 0 0 0 0 64z" fill="#FFFFFF" p-id="18672"></path></svg>',
              click() {
                if (noteModel.currNote.value.name) {
                  insertContent('all');
                } else {
                  ElMessage.warning('请先打开一个笔记');
                }
              },
            },
            {
              hotkey: '⇧⌘G',
              name: 'insert-page',
              tipPosition: 's',
              tip: '插入页码',
              className: 'right',
              icon: '<svg t="1714113523470" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="13846" width="200" height="200"><path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-992A480 480 0 1 0 992 512 480 480 0 0 0 512 32zM704 384v208a32 32 0 0 1-32 32h-48v-32h48V416h-80a32 32 0 0 1-32-32v-80H480v64H448v-64a32 32 0 0 1 32-32h112v6.893714l7.131429-7.131428 105.106285 105.106285-7.131428 7.131429h6.893714z m-112-72.649143V384h72.649143z m-112 88.649143v6.893714l7.131429-7.131428 105.106285 105.106285L585.142857 512h6.893714v208a32 32 0 0 1-32 32h-192a32 32 0 0 1-32-32v-288a32 32 0 0 1 32-32h111.963429z m0 39.350857V512h72.649143z m-112 280.649143h192V544H480A32 32 0 0 1 448 512v-80h-80v288z" fill="#FFFFFF" p-id="13847"></path></svg>',
              click() {
                if (noteModel.currNote.value.name) {
                  ElMessageBox.prompt('请输入页码', '插入页码', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /\d+/,
                    inputErrorMessage: '页码必须填写',
                  }).then(({value}) => insertText(`\n\n[[页码${value}]](page://${value})\n`));
                } else {
                  ElMessage.warning('请先打开一个笔记');
                }
              },
            },
            {
              hotkey: '⇧⌘R',
              name: 'ocr',
              tipPosition: 's',
              tip: '识别文字',
              className: 'right',
              icon: '<svg t="1713847143477" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5415" width="200" height="200"><path d="M185.825882 346.955294a169.863529 169.863529 0 0 1 85.232942 20.178824 129.807059 129.807059 0 0 1 53.609411 57.223529 193.355294 193.355294 0 0 1 18.371765 87.341177 215.341176 215.341176 0 0 1-9.938824 67.162352 145.769412 145.769412 0 0 1-30.117647 52.404706 131.915294 131.915294 0 0 1-49.091764 34.032942 178.898824 178.898824 0 0 1-66.861177 11.745882 180.705882 180.705882 0 0 1-66.56-12.047059A137.938824 137.938824 0 0 1 70.475294 632.470588a145.167059 145.167059 0 0 1-30.117647-53.007059A207.510588 207.510588 0 0 1 30.117647 512a210.823529 210.823529 0 0 1 10.541177-67.463529 142.456471 142.456471 0 0 1 30.117647-52.10353A128.903529 128.903529 0 0 1 120.470588 358.4a176.790588 176.790588 0 0 1 65.355294-11.444706zM277.684706 512a150.588235 150.588235 0 0 0-11.444706-60.235294 87.943529 87.943529 0 0 0-32.225882-38.851765 90.352941 90.352941 0 0 0-48.188236-12.950588 87.642353 87.642353 0 0 0-35.237647 5.722353 78.607059 78.607059 0 0 0-28.310588 21.082353 103.604706 103.604706 0 0 0-18.974118 35.84A161.430588 161.430588 0 0 0 96.075294 512a165.345882 165.345882 0 0 0 6.625882 49.091765 102.4 102.4 0 0 0 19.576471 36.442353 75.294118 75.294118 0 0 0 30.117647 21.684706 86.136471 86.136471 0 0 0 35.538824 7.228235 86.437647 86.437647 0 0 0 45.778823-12.348235 85.232941 85.232941 0 0 0 33.129412-38.249412A150.588235 150.588235 0 0 0 277.684706 512zM670.418824 572.235294a90.352941 90.352941 0 0 1-7.529412 33.129412 120.470588 120.470588 0 0 1-23.792941 34.635294 118.362353 118.362353 0 0 1-40.96 27.708235 146.672941 146.672941 0 0 1-58.428236 10.842353 198.475294 198.475294 0 0 1-46.08-4.818823 128 128 0 0 1-37.345882-15.058824 116.254118 116.254118 0 0 1-30.117647-26.503529 161.430588 161.430588 0 0 1-21.684706-33.731765A158.418824 158.418824 0 0 1 391.529412 557.176471a210.823529 210.823529 0 0 1-5.722353-45.176471 198.475294 198.475294 0 0 1 11.143529-68.969412A146.371765 146.371765 0 0 1 429.176471 391.529412a138.24 138.24 0 0 1 48.790588-32.828236 159.623529 159.623529 0 0 1 60.235294-11.444705 150.588235 150.588235 0 0 1 68.969412 15.36 126.795294 126.795294 0 0 1 46.381176 38.249411 75.595294 75.595294 0 0 1 16.26353 43.068236 28.310588 28.310588 0 0 1-7.830589 19.57647 25.298824 25.298824 0 0 1-18.974117 8.432941 26.202353 26.202353 0 0 1-18.672941-5.722353 84.329412 84.329412 0 0 1-13.854118-20.178823 96.075294 96.075294 0 0 0-30.117647-35.538824 71.378824 71.378824 0 0 0-41.86353-11.745882 75.896471 75.896471 0 0 0-63.548235 30.117647 137.637647 137.637647 0 0 0-23.190588 85.835294 159.021176 159.021176 0 0 0 10.541176 61.741177 78.607059 78.607059 0 0 0 30.117647 37.044706 81.92 81.92 0 0 0 44.875295 12.047058 78.305882 78.305882 0 0 0 47.284705-13.854117 81.92 81.92 0 0 0 30.117647-40.357647 74.390588 74.390588 0 0 1 10.24-20.781177 23.792941 23.792941 0 0 1 19.576471-7.830588 27.105882 27.105882 0 0 1 19.877647 8.131765 27.407059 27.407059 0 0 1 6.02353 21.383529zM815.284706 535.190588h-22.588235v102.4a42.164706 42.164706 0 0 1-9.035295 30.117647 33.430588 33.430588 0 0 1-47.284705 0 46.682353 46.682353 0 0 1-8.432942-30.117647V391.529412a41.261176 41.261176 0 0 1 9.336471-30.117647 42.767059 42.767059 0 0 1 30.117647-9.336471H873.411765a323.463529 323.463529 0 0 1 37.044706 1.807059 97.882353 97.882353 0 0 1 28.009411 7.529412 79.811765 79.811765 0 0 1 26.50353 18.070588 77.402353 77.402353 0 0 1 17.468235 27.407059 85.835294 85.835294 0 0 1 6.023529 32.828235 78.908235 78.908235 0 0 1-20.178823 57.223529 113.543529 113.543529 0 0 1-60.235294 30.117648 120.470588 120.470588 0 0 1 32.828235 27.105882 316.235294 316.235294 0 0 1 28.009412 37.948235 286.72 286.72 0 0 1 18.974118 36.442353 73.185882 73.185882 0 0 1 6.927058 22.287059 21.383529 21.383529 0 0 1-3.915294 12.348235 30.117647 30.117647 0 0 1-11.143529 9.938824 33.731765 33.731765 0 0 1-15.962353 3.614117 30.117647 30.117647 0 0 1-18.371765-5.12 43.369412 43.369412 0 0 1-12.649412-12.950588c-3.614118-5.12-8.432941-12.950588-14.45647-23.190588l-25.901177-43.068235a267.143529 267.143529 0 0 0-24.997647-36.141177 64.150588 64.150588 0 0 0-22.287059-16.865882 78.004706 78.004706 0 0 0-29.81647-4.216471z m37.044706-134.324706h-60.235294v87.94353h57.825882a158.72 158.72 0 0 0 39.152941-4.216471 48.188235 48.188235 0 0 0 24.395294-13.552941 40.658824 40.658824 0 0 0 8.432941-26.804706 40.658824 40.658824 0 0 0-25.6-38.550588 138.842353 138.842353 0 0 0-43.971764-4.818824zM30.117647 271.058824a30.117647 30.117647 0 0 1-30.117647-30.117648V77.101176A77.101176 77.101176 0 0 1 77.101176 0H240.941176a30.117647 30.117647 0 0 1 0 60.235294H77.101176a16.865882 16.865882 0 0 0-16.865882 16.865882V240.941176a30.117647 30.117647 0 0 1-30.117647 30.117648zM993.882353 271.058824a30.117647 30.117647 0 0 1-30.117647-30.117648V77.101176a16.865882 16.865882 0 0 0-16.865882-16.865882H783.058824a30.117647 30.117647 0 0 1 0-60.235294h163.84A77.101176 77.101176 0 0 1 1024 77.101176V240.941176a30.117647 30.117647 0 0 1-30.117647 30.117648zM946.898824 1024H783.058824a30.117647 30.117647 0 0 1 0-60.235294h163.84a16.865882 16.865882 0 0 0 16.865882-16.865882V783.058824a30.117647 30.117647 0 0 1 60.235294 0v163.84A77.101176 77.101176 0 0 1 946.898824 1024zM240.941176 1024H77.101176A77.101176 77.101176 0 0 1 0 946.898824V783.058824a30.117647 30.117647 0 0 1 60.235294 0v163.84a16.865882 16.865882 0 0 0 16.865882 16.865882H240.941176a30.117647 30.117647 0 0 1 0 60.235294z" fill="#FFFFFF" p-id="5416"></path></svg>',
              click() {
                if (noteModel.lastScreenshot.value) {
                  service.invoke('/note/ocr', noteModel.lastScreenshot.value, result => {
                    console.log(result);
                    if (result.code === 200) {
                      if (result.code === 200) {
                        let text = result.data;
                        // 只保留汉子、字母、数字、空格、换行符
                        text = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s\n]/g, '');
                        insertText('\n' + text);
                      } else {
                        ElMessage.error('识别文字失败');
                      }
                    }
                  });
                } else {
                  ElMessage.warning('请先截图');
                }
              },
            },
            {
              hotkey: '⌘P',
              name: 'play',
              tipPosition: 's',
              tip: '切换播放状态',
              className: 'right',
              icon: '<svg t="1713835405732" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="22517" width="200" height="200"><path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-981.333333a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m255.445333 473.344a20.458667 20.458667 0 0 1-1.450666 4.16 18.261333 18.261333 0 0 1-0.874667 2.496 12.245333 12.245333 0 0 1-0.874667 0.96 22.741333 22.741333 0 0 1-2.901333 3.2 20.501333 20.501333 0 0 1-3.306667 2.794666 12.48 12.48 0 0 1-1.002666 0.853334l-382.656 213.333333a20.778667 20.778667 0 0 1-3.2 1.045333c-0.256 0-0.533333 0.149333-0.810667 0.256a22.144 22.144 0 0 1-6.272 1.258667c-0.490667 0-0.917333 0.298667-1.429333 0.298667a21.504 21.504 0 0 1-2.88-0.576 23.594667 23.594667 0 0 1-3.242667-0.661334 19.2 19.2 0 0 1-5.056-2.389333 18.794667 18.794667 0 0 1-2.133333-1.472 20.672 20.672 0 0 1-3.562667-3.904 18.389333 18.389333 0 0 1-1.514667-1.664c-0.234667-0.384-0.234667-0.832-0.426666-1.216a21.610667 21.610667 0 0 1-1.301334-3.690667 21.098667 21.098667 0 0 1-0.96-4.778666c0-0.341333-0.192-0.64-0.192-0.981334V298.666667c0-0.341333 0.170667-0.64 0.192-0.981334a20.864 20.864 0 0 1 0.96-4.778666 21.610667 21.610667 0 0 1 1.301334-3.690667c0.192-0.384 0.192-0.832 0.426666-1.216a18.389333 18.389333 0 0 1 1.514667-1.664 20.672 20.672 0 0 1 3.562667-3.904 18.794667 18.794667 0 0 1 2.133333-1.472 19.2 19.2 0 0 1 5.056-2.389333 23.594667 23.594667 0 0 1 3.242667-0.661334A21.504 21.504 0 0 1 362.666667 277.333333c0.512 0 0.938667 0.256 1.429333 0.298667a21.994667 21.994667 0 0 1 6.272 1.258667c0.277333 0 0.554667 0.149333 0.810667 0.256a20.778667 20.778667 0 0 1 3.2 1.045333l382.656 213.333333a12.48 12.48 0 0 1 1.002666 0.853334 20.501333 20.501333 0 0 1 3.306667 2.794666 22.741333 22.741333 0 0 1 2.901333 3.2 12.245333 12.245333 0 0 1 0.874667 0.96 17.301333 17.301333 0 0 1 0.874667 2.496 20.458667 20.458667 0 0 1 1.450666 4.16 27.072 27.072 0 0 1 0 8.021334zM384 689.173333L701.866667 512 384 334.933333v354.346667z" fill="#FFFFFF" p-id="22518"></path></svg>',
              click() {
                playVideo();
              },
            },
            {
              hotkey: '⇧⌘F',
              name: 'forward',
              tipPosition: 's',
              tip: '快进',
              className: 'right',
              icon: '<svg t="1713840577418" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5223" width="200" height="200"><path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-981.333333a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m213.333333 640a21.333333 21.333333 0 0 1-21.333333-21.333334v-112.170666l-224.277333 130.645333c-0.213333 0.128-0.448 0-0.661334 0.234667a21.077333 21.077333 0 0 1-4.864 1.642666 22.144 22.144 0 0 1-3.648 0.746667c-0.426667 0-0.789333 0.234667-1.216 0.234667a19.2 19.2 0 0 1-2.496-0.512 19.648 19.648 0 0 1-4.586666-0.917334 21.930667 21.930667 0 0 1-3.178667-1.557333 16.789333 16.789333 0 0 1-6.4-5.525333 22.634667 22.634667 0 0 1-1.877333-2.133334c-0.234667-0.405333-0.213333-0.853333-0.426667-1.258666a33.898667 33.898667 0 0 1-2.133333-8.128c0-0.448-0.256-0.832-0.256-1.28v-62.464l-138.944 80.938666c-0.213333 0.128-0.448 0-0.682667 0.234667a20.565333 20.565333 0 0 1-4.842667 1.642667 22.144 22.144 0 0 1-3.648 0.746666c-0.426667 0-0.789333 0.234667-1.216 0.234667a19.2 19.2 0 0 1-2.496-0.512 19.648 19.648 0 0 1-4.586666-0.917333 21.930667 21.930667 0 0 1-3.178667-1.557334 16.789333 16.789333 0 0 1-6.4-5.525333 22.634667 22.634667 0 0 1-1.877333-2.133333c-0.234667-0.405333-0.213333-0.853333-0.426667-1.258667a33.898667 33.898667 0 0 1-2.133333-8.128c0-0.448-0.256-0.832-0.256-1.28V362.666667c0-0.448 0.234667-0.832 0.256-1.28a33.898667 33.898667 0 0 1 2.133333-8.128c0.213333-0.405333 0.192-0.853333 0.426667-1.258667a19.968 19.968 0 0 1 1.877333-2.133333 23.104 23.104 0 0 1 9.536-7.082667 19.648 19.648 0 0 1 4.586667-0.917333A19.2 19.2 0 0 1 298.666667 341.333333c0.426667 0 0.789333 0.213333 1.216 0.234667a20.138667 20.138667 0 0 1 3.648 0.746667 20.565333 20.565333 0 0 1 4.842666 1.642666c0.234667 0.128 0.469333 0 0.682667 0.234667L448 425.130667V362.666667c0-0.448 0.234667-0.832 0.256-1.28a33.898667 33.898667 0 0 1 2.133333-8.128c0.213333-0.405333 0.192-0.853333 0.426667-1.258667a19.968 19.968 0 0 1 1.877333-2.133333 23.104 23.104 0 0 1 9.536-7.082667 19.648 19.648 0 0 1 4.586667-0.917333A19.2 19.2 0 0 1 469.333333 341.333333c0.426667 0 0.789333 0.213333 1.216 0.234667a20.138667 20.138667 0 0 1 3.648 0.746667 21.077333 21.077333 0 0 1 4.864 1.642666c0.213333 0.128 0.448 0 0.661334 0.234667L704 474.837333V362.666667a21.333333 21.333333 0 0 1 42.666667 0v298.666666a21.333333 21.333333 0 0 1-21.333334 21.333334z m-277.333333-208.277334l-128-74.666666v224.341333l128-74.666667v-75.221333z m42.666667-74.666666V624.213333L683.221333 512z" fill="#FFFFFF" p-id="5224"></path></svg>',
              click() {
                forward();
              },
            },
            {
              hotkey: '⇧⌘D',
              name: 'back',
              tipPosition: 's',
              tip: '倒退',
              className: 'right',
              icon: '<svg t="1713840644659" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1220" width="200" height="200"><path d="M512 1024a512 512 0 1 1 512-512 512 512 0 0 1-512 512z m0-981.333333a469.333333 469.333333 0 1 0 469.333333 469.333333A469.333333 469.333333 0 0 0 512 42.666667z m233.557333 624.106666a20.586667 20.586667 0 0 1-1.301333 3.968c-0.213333 0.405333-0.192 0.853333-0.426667 1.258667a20.288 20.288 0 0 1-1.877333 2.133333 20.864 20.864 0 0 1-2.645333 3.008 20.096 20.096 0 0 1-3.733334 2.517334 20.672 20.672 0 0 1-3.157333 1.557333 19.648 19.648 0 0 1-4.586667 0.917333A19.2 19.2 0 0 1 725.333333 682.666667c-0.426667 0-0.789333-0.213333-1.216-0.234667a22.144 22.144 0 0 1-3.648-0.746667 21.077333 21.077333 0 0 1-4.864-1.642666c-0.213333-0.128-0.448 0-0.661333-0.234667L576 598.869333V661.333333c0 0.448-0.234667 0.832-0.256 1.28a20.309333 20.309333 0 0 1-0.853333 4.16 20.586667 20.586667 0 0 1-1.301334 3.968c-0.213333 0.405333-0.192 0.853333-0.426666 1.258667a20.288 20.288 0 0 1-1.877334 2.133333 20.864 20.864 0 0 1-2.645333 3.008 20.096 20.096 0 0 1-3.733333 2.517334 20.672 20.672 0 0 1-3.157334 1.557333 19.648 19.648 0 0 1-4.586666 0.917333A19.2 19.2 0 0 1 554.666667 682.666667c-0.426667 0-0.789333-0.213333-1.216-0.234667a22.144 22.144 0 0 1-3.648-0.746667 21.077333 21.077333 0 0 1-4.864-1.642666c-0.213333-0.128-0.448 0-0.661334-0.234667L320 549.162667V661.333333a21.333333 21.333333 0 0 1-42.666667 0V362.666667a21.333333 21.333333 0 0 1 42.666667 0v112.170666l224.277333-130.645333c0.213333-0.128 0.448 0 0.661334-0.234667a21.077333 21.077333 0 0 1 4.864-1.642666 20.138667 20.138667 0 0 1 3.648-0.746667c0.426667 0 0.789333-0.234667 1.216-0.234667a19.2 19.2 0 0 1 2.496 0.512 19.648 19.648 0 0 1 4.586666 0.917334 21.930667 21.930667 0 0 1 3.178667 1.557333 16.789333 16.789333 0 0 1 6.4 5.525333 20.288 20.288 0 0 1 1.877333 2.133334c0.234667 0.405333 0.213333 0.853333 0.426667 1.258666a20.586667 20.586667 0 0 1 1.301333 3.968 20.309333 20.309333 0 0 1 0.853334 4.16c0 0.448 0.256 0.832 0.256 1.28v62.464l138.944-80.938666c0.213333-0.128 0.448 0 0.661333-0.234667a21.077333 21.077333 0 0 1 4.864-1.642667 20.138667 20.138667 0 0 1 3.648-0.746666c0.426667 0 0.789333-0.234667 1.216-0.234667a19.2 19.2 0 0 1 2.496 0.512 19.648 19.648 0 0 1 4.586667 0.917333 21.930667 21.930667 0 0 1 3.178666 1.557334 16.789333 16.789333 0 0 1 6.4 5.525333 20.288 20.288 0 0 1 1.877334 2.133333c0.234667 0.405333 0.213333 0.853333 0.426666 1.258667a20.586667 20.586667 0 0 1 1.301334 3.968 20.309333 20.309333 0 0 1 0.853333 4.16c0 0.448 0.256 0.832 0.256 1.28v298.666667c0 0.448-0.234667 0.832-0.256 1.28a20.309333 20.309333 0 0 1-0.938667 4.202666zM533.333333 426.666667v-26.837334L340.778667 512 533.333333 624.170667V426.666667z m170.666667-26.837334l-128 74.666667v75.221333l128 74.666667V399.829333z" fill="#FFFFFF" p-id="1221"></path></svg>',
              click() {
                backward();
              },
            },
            'export',
            {
              hotkey: '⇧⌘⌥+L',
              name: 'lock',
              tipPosition: 's',
              tip: '锁定',
              className: 'right',
              icon: '<svg t="1714106260954" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4257" width="200" height="200"><path d="M216.615385 374.153846h78.76923c11.815385 0 19.692308-5.907692 19.692308-17.723077V354.461538c0-112.246154 96.492308-204.8 210.707692-196.923076 104.369231 7.876923 183.138462 98.461538 183.138462 204.8v-5.907693c0 11.815385 7.876923 17.723077 19.692308 17.723077h78.76923c11.815385 0 19.692308-5.907692 19.692308-17.723077V354.461538c0-179.2-149.661538-322.953846-330.830769-315.076923-167.384615 7.876923-295.384615 149.661538-299.323077 317.046154 1.969231 9.846154 9.846154 17.723077 19.692308 17.723077z m-19.692308-17.723077v7.876923-7.876923zM905.846154 531.692308c0-43.323077-35.446154-78.769231-78.769231-78.769231H196.923077c-43.323077 0-78.769231 35.446154-78.769231 78.769231v374.153846c0 43.323077 35.446154 78.769231 78.769231 78.769231h630.153846c43.323077 0 78.769231-35.446154 78.769231-78.769231V531.692308zM602.584615 840.861538c3.938462 11.815385-5.907692 25.6-19.692307 25.6h-143.753846c-13.784615 0-21.661538-11.815385-19.692308-25.6l35.446154-118.153846c-29.538462-19.692308-47.261538-55.138462-41.353846-94.523077 7.876923-37.415385 37.415385-66.953846 76.8-74.830769 63.015385-11.815385 118.153846 33.476923 118.153846 92.553846 0 31.507692-15.753846 61.046154-41.353846 76.8l35.446153 118.153846z" fill="#FFFFFF" p-id="4258"></path></svg>',
              click() {
                noteModel.locking.value = true;
                noteModel.stopColdDown();
              },
            },
            {
              hotkey: '⇧⌘M',
              name: 'like',
              tipPosition: 's',
              tip: '收藏',
              className: 'right',
              icon: '<svg t="1714610072869" class="icon" viewBox="0 0 1194 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3252" width="200" height="200"><path d="M1059.669333 83.911111c82.318222 59.278222 134.826667 153.372444 134.826667 261.859556 0 49.493333-9.500444 94.094222-27.761778 135.224889A343.210667 343.210667 0 0 0 1091.128889 420.408889c6.997333-22.983111 10.922667-47.388444 10.922667-74.638222 0-134.428444-109.681778-237.909333-251.619556-237.909334-75.662222 0-147.512889 34.133333-195.754667 92.899556a47.047111 47.047111 0 0 1-72.419555-0.227556 252.359111 252.359111 0 0 0-195.584-92.728889c-37.888 0-73.159111 8.192-105.016889 22.186667-87.267556 38.513778-146.602667 123.790222-146.602667 227.157333 0 58.140444 31.971556 125.269333 82.147556 173.226667a42031.900444 42031.900444 0 0 1 147.797333 142.108445c178.176 171.633778 238.819556 229.603556 242.232889 231.708444a18.033778 18.033778 0 0 0 11.377778 3.868444c2.787556 0 4.835556-1.308444 7.111111-2.275555 16.896 25.998222 37.319111 49.379556 60.472889 69.859555l-2.389334 2.048a111.672889 111.672889 0 0 1-65.422222 20.707556 111.502222 111.502222 0 0 1-65.422222-20.650667c-10.524444-7.566222-26.339556-22.528-252.586667-240.412444l-18.773333-18.033778c-50.062222-48.184889-86.926222-83.569778-129.422222-124.302222C84.593778 529.692444 42.666667 440.035556 42.666667 357.262222 42.666667 166.229333 193.991111 17.635556 386.730667 17.635556c73.159111 0 143.36 24.348444 201.728 66.275555 10.24 7.395556 21.048889 14.165333 30.435555 22.641778 9.443556-8.533333 20.024889-15.303111 30.321778-22.641778C707.640889 41.927111 777.443556 17.635556 850.488889 17.635556c79.36 0 151.495111 24.689778 209.180444 66.275555zM866.304 668.444444V507.221333a48.924444 48.924444 0 1 1 97.905778 0v161.28h161.28a48.924444 48.924444 0 1 1 0 97.848889h-161.28v161.28a48.981333 48.981333 0 0 1-97.905778 0v-161.223111h-161.28a48.924444 48.924444 0 1 1 0-97.905778h161.28z" fill="#FFFFFF" p-id="3253"></path></svg>',
              click() {
                noteModel.currNote.value.like = !noteModel.currNote.value.like;
                if (noteModel.currNote.value.like) {
                  ElMessage({type: 'success', message: '已收藏'});
                } else {
                  ElMessage({type: 'success', message: '已取消收藏'});
                }
              },
            },
          ],
        });

        utils.runUntil(() => {
          return document.querySelector('.vditor-sv');
        }, () => {
          keyManager.registerHotkeyProcessor('ctrl+alt+v', () => {
            ElMessage.success('视频快捷键已启用');
          });
        });
      }
    });

    const stopVideo = () => {
      if (noteModel.setting.value.displayMode === 'same') {
        if (video.value && noteModel.setting.value.pauseWhenWrite) {
          video.value.stopVideo();
        }
      } else {
        service.invoke('/note/stopVideo', '');
      }
    };

    const playVideo = () => {
      if (noteModel.setting.value.displayMode === 'same') {
        if (video.value && noteModel.setting.value.pauseWhenWrite) {
          video.value.playVideo();
        }
      } else {
        service.invoke('/note/playVideo', '');
      }
    };

    const forward = () => {
      if (noteModel.setting.value.displayMode === 'same') {
        if (video.value && noteModel.setting.value.pauseWhenWrite) {
          video.value.forward();
        }
      } else {
        service.invoke('/note/forward', '');
      }
    };

    const backward = () => {
      if (noteModel.setting.value.displayMode === 'same') {
        if (video.value && noteModel.setting.value.pauseWhenWrite) {
          video.value.backward();
        }
      } else {
        service.invoke('/note/backward', '');
      }
    };

    const closeVideo = () => {
      if (noteModel.setting.value.displayMode === 'same') {
        if (video.value) {
          openVideo('');
        }
      } else {
        service.invoke('/note/closeVideo', '');
      }
    };

    const setCursor = function() {
      try {
        let editorElem = document.querySelector('.vditor-sv');
        var range = document.createRange();
        var sel = window.getSelection();

        let el = editorElem.children[editorElem.children.length - 1];
        el = el.children[el.children.length - 1];
        range.setStart(el, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
      }
    };

    let handleInsert;

    let insertAllListener = function(event, arg) {
      let data = JSON.parse(arg);
      if (data) {
        if (!handleInsert) {
          let content;
          if (data.time && data.screenshotId) {
            content = '\n\n' + formatTime(data.time) + '\n' + insertMdImg(data.screenshotId) + '\n';
            noteModel.lastScreenshot.value = data.screenshotId;
          } else if (data.time) {
            content = '\n\n' + formatTime(data.time) + '\n';
          } else if (data.screenshotId) {
            content = '\n\n' + insertMdImg(data.screenshotId) + '\n';
            noteModel.lastScreenshot.value = data.screenshotId;
          }
          if (content) {
            insertText(content);
          }
        } else {
          handleInsert(data);
        }
      }
    };
    electron.ipcRenderer.on('/client/insertAll', insertAllListener);

    let sendListener = function(event, arg) {
      if (noteModel.currNote.value.name) {
        let content = arg;
        insertText(content);
      }
    };
    electron.ipcRenderer.on('/client/send', sendListener);

    const insertText = text => {
      if (editor) {
        nextTick(() => {
          if (lastPosition) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(lastPosition);
          }
          editor.insertValue(text, true);
          lastPosition = null;
          noteModel.markChanged();
          editor.focus();

          let previewContainer = document.querySelector('.vditor-preview');
          previewContainer.scrollTop = previewContainer.scrollHeight + 100;
        });
      }
    };

    let saveNoteListener = function(event, arg) {
      if (noteModel.currNote.value.changed) {
        doSave();
      }
    };
    electron.ipcRenderer.on('/client/saveNote', saveNoteListener);

    let recordSaveListener = function(event, arg) {
      if (noteModel.currNote.value.name) {
        if (arg.type === 'video') {
          let video = arg.fileName;
          let fileName = video.substring(video.lastIndexOf('/') + 1);
          let content = `\n\n[[本地资料 ${fileName}]](kingfisher://${encodeURIComponent(video + '/')})\n`;
          insertText(content);
        } else if (arg.type === 'audio') {
          let content = `\n\n[音频](kingfisher://${arg.fileName}) [[转文字](tts://${arg.fileName.substring(
            arg.fileName.lastIndexOf('/') + 1) + '/'})]\n`;
          insertText(content);
        }
      }
    };
    electron.ipcRenderer.on('/client/record-save', recordSaveListener);

    // format 1.2222 to 0:0:1
    function formatTime(second) {
      if (second < 0) {
        second = 0;
      }
      let h = Math.floor(second / 3600);
      let m = Math.floor((second % 3600) / 60);
      let s = Math.floor(second % 60);
      return `[[位置 ${h + ':' + m + ':' + s}]](timestamp://${second.toFixed(1)})`;
    }

    // format 1 to file://./screenshot/1.png to md file
    function insertMdImg(fileId) {
      return `![](kingfisher://${noteModel.setting.value.screenshotDir.replaceAll('\\', '/') + `/${fileId}.png`})`;
    }

    const videoWidth = computed(() => showVideo.value ? '33%' : '0%');

    onUnmounted(() => {
      window.electron.ipcRenderer.removeListener('/client/insertAll', insertAllListener);
      window.electron.ipcRenderer.removeListener('/client/saveNote', saveNoteListener);
    });

    const createNewNote = () => {
      ElMessageBox.prompt('请输入笔记名称', '新建笔记', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '笔记名称不能为空',
      }).then(({value}) => {
        closeVideo();
        service.invoke('/store/newNote', value, result => {
          if (result.code === 200) {
            noteModel.currNote.value = {
              name: value + '.kfnote',
              data: '',
            };
          } else {
            ElMessage.warning(result.message);
          }
        });
      }).catch(() => console.log('取消新建笔记'));
    };

    const listNote = () => {
      dialogOpenVisible.value = true;
      if (!fullTextSearch.value) {
        service.invoke('/store/getNoteList', null, result => {
          noteModel.noteList.value = result;
          dataVersion.value++;
        });
      } else {
        service.invoke('/store/searchAllLinesFromNotes', JSON.stringify({keyword: noteSearch.value}), result => {
          noteModel.noteList.value = result.result;
          dataVersion.value++;
        });
      }
    };

    const dialogOpenVisible = ref(false);

    function openFirstVideo() {
      if (noteModel.setting.value.autoOpenVideo) {
        nextTick(() => {
          let indexLocal = noteModel.currNote.value.data.indexOf('[本地资料');
          let indexOnline = noteModel.currNote.value.data.indexOf('[在线资料');
          if (indexLocal !== -1 && indexLocal > indexOnline) {
            //fetch content in () from indexIf
            let startIndex = noteModel.currNote.value.data.indexOf('(', indexLocal);
            let endIndex = noteModel.currNote.value.data.indexOf(')', indexLocal);
            if (startIndex > -1 && endIndex > -1) {
              let videoPath = noteModel.currNote.value.data.substring(startIndex + 1, endIndex);
              openVideo(decodeURIComponent(videoPath.replace('kingfisher://', '')), false);
            }
          } else if (indexOnline !== -1) {
            //fetch content in () from indexIf
            let startIndex = noteModel.currNote.value.data.indexOf('(', indexOnline);
            let endIndex = noteModel.currNote.value.data.indexOf(')', indexOnline);
            if (startIndex > -1 && endIndex > -1) {
              let videoPath = noteModel.currNote.value.data.substring(startIndex + 1, endIndex);
              videoPath = website.handleReplacedWebsite(videoPath);
              openVideo(videoPath);
            }
          }
        });
      }
    }

    const openNote = note => {
      if (noteModel.currNote.value.changed) {
        ElMessageBox.confirm('当前笔记已修改，是否保存？', '提示', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning',
        }).then(() => doSave(() => callOpen(note))).catch(() => {
          console.log('不保存笔记');
          callOpen(note);
        });
      } else {
        callOpen(note);
      }
    };

    let autoSaveTimer = null;

    function callOpen(note, time) {
      dialogOpenVisible.value = false;
      noteModel.currVersion.value = null;

      service.invoke('/store/getNote', JSON.stringify({
        path: note.name,
        key: note.key,
        time,
      }), result => {
        if (result.code === 200) {
          closeVideo();
          lastVideo = null;
          noteModel.currNote.value = result;

          let existNote = recentNotes.value.find(n => n.name === note.name);
          if (existNote) {
            recentNotes.value.splice(recentNotes.value.indexOf(existNote), 1);
          }
          recentNotes.value.unshift({
            name: note.name,
          });
          if (recentNotes.value.length > 10) {
            recentNotes.value.pop();
          }
          localStorage.setItem('RECENT_NOTES', JSON.stringify(recentNotes.value));

          openFirstVideo();
          noteModel.lastScreenshot.value = null;

          setTimeout(() => {
            lastPosition = null;
            setCursor();
            editor.focus();
            loadVersions();
            noteModel.startColdDown();

            if (autoSaveTimer) {
              clearInterval(autoSaveTimer);
            }
            autoSaveTimer = setInterval(() => {
              if (noteModel.currNote.value.changed) {
                doSave(null, true);
              }
            }, 60000);
          }, 500);
        } else if (result.code === 500 && result.message === '文件已加密') {
          ElMessageBox.prompt('请输入密码', '打开加密笔记-' + note.name.substring(0, note.name.indexOf('.')), {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /\S/,
            inputErrorMessage: '密码不能为空',
          }).then(({value}) => {
            note.key = value;
            callOpen(note, time);
          }).catch(() => console.log('取消打开加密笔记'));
        } else {
          ElMessage.error(result.message);
        }
      }, error => ElMessage.error('打开笔记失败'));
    }

    const loadVersions = () => {
      if (noteModel.currNote.value.name) {
        service.invoke('/store/getNoteVersions', JSON.stringify({
          path: noteModel.currNote.value.name,
        }), result => {
          noteModel.versions.value = result;
          let index = 0;
          noteModel.versions.value.map(version => {
            if (!version.name.endsWith('.auto')) { //根据version.time, 计算距离目前时间，例如一分钟前，一天前等, version.time是个时间签
              let now = new Date().getTime();
              let duration = now - version.time;
              if (duration < 60000) {
                version.duration = '刚刚';
              } else if (duration < 3600000) {
                version.duration = Math.floor(duration / 60000) + '分钟前';
              } else if (duration < 86400000) {
                version.duration = Math.floor(duration / 3600000) + '小时前';
              } else {
                version.duration = Math.floor(duration / 86400000) + '天前';
              }
              version.index = '版本' + (noteModel.versions.value.length - index).toString().padStart(3, '0');
            } else {
              version.index = '自动保存';
              version.duration = '1分钟前';
            }
            index++;
          });
        });
      }
    };

    const insertContent = type => {
      if (video.value) {
        video.value.insertContent(type);
      } else {
        service.invoke('/note/insertContent', JSON.stringify({type}));
      }
    };

    const noteSearch = ref('');
    const fullTextSearch = ref(false);

    watch(noteSearch, val => {
      if (fullTextSearch.value) {
        listNote();
      }
    });

    watch(fullTextSearch, () => {
      if (!fullTextSearch.value) {
        listNote();
      }
    });

    const dataVersion = ref(Date.now());

    const noteList = computed(() => {
      if (!fullTextSearch.value && dataVersion.value) {
        return noteModel.noteList.value.filter(note => {
          let matched = false;
          if (note.tags) {
            note.tags.every(tag => {
              if (utils.pinyinMatch(tag, noteSearch.value)) {
                matched = true;
                return false;
              }
              return true;
            });
          }

          return matched || utils.pinyinMatch(note.name, noteSearch.value);
        });
      } else {
        return noteModel.noteList.value;
      }
    });

    function setLayoutDrag(dragId) {
      const resize = document.getElementById(dragId);
      let previousElement = resize.previousSibling;
      let nextElement = resize.nextSibling;
      let previousTag = previousElement.tagName;
      let nextTag = nextElement.tagName;

      resize.onmousedown = e => {
        drag.value = true;
        const startX = e.clientX;
        const startY = e.clientY;
        let type = '';
        if (previousTag === 'ASIDE' && nextTag === 'MAIN') {
          type = 'ASIDE-MAIN';
        } else if (previousTag === 'MAIN' && nextTag === 'ASIDE') {
          type = 'MAIN-ASIDE';
        } else if (previousTag === 'HEADER' && nextTag === 'MAIN' ||
          previousTag === 'FOOTER' && nextTag === 'MAIN') {
          type = 'HEADER-MAIN';
        } else if (previousTag === 'MAIN' && nextTag === 'HEADER' ||
          previousTag === 'MAIN' && nextTag === 'FOOTER') {
          type = 'MAIN-HEADER';
        }

        let initWidth = 0, initHeight = 0;
        if (type === 'ASIDE-MAIN') {
          initWidth = previousElement.clientWidth;
        } else if (type === 'MAIN-ASIDE') {
          initWidth = nextElement.clientWidth;
        } else if (type === 'HEADER-MAIN') {
          initHeight = previousElement.clientHeight;
        } else if (type === 'MAIN-HEADER') {
          initHeight = nextElement.clientHeight;
        }

        document.onmousemove = k => {
          const endX = k.clientX;
          const endY = k.clientY;
          let moveLen = endX - startX; // 横向移动宽度
          let moveHeight = endY - startY; // 纵向移动高度
          switch (type) {
            case 'ASIDE-MAIN':
              let asideMainWidth = initWidth + moveLen;
              if (moveLen < 0) { // 向左移
                if (asideMainWidth > 90) { // 左侧剩90
                  previousElement.style.width = asideMainWidth + 'px';
                }
              } else { // 向右移动
                if (nextElement.clientWidth > 90) { // 右侧剩90
                  previousElement.style.width = asideMainWidth + 'px';
                }

              }
              break;
            case 'MAIN-ASIDE':
              let mainAsideWidth = initWidth - moveLen;
              if (moveLen < 0) { // 向左移
                if (previousElement.clientWidth > 90) { // 左侧剩90
                  nextElement.style.width = mainAsideWidth + 'px';
                }
              } else { // 向右移动
                if (mainAsideWidth > 90) {
                  nextElement.style.width = mainAsideWidth + 'px';
                }
              }
              break;
            case 'HEADER-MAIN': {
              let headerMainHeight = initHeight + moveHeight;
              if (moveHeight < 0) { // 向上移
                if (headerMainHeight > 60) { // 上侧剩90
                  previousElement.style.height = headerMainHeight + 'px';
                }
              } else { // 向下移动
                if (nextElement.clientHeight > 60) { // 下侧剩90
                  previousElement.style.height = headerMainHeight + 'px';
                }

              }
              break;
            }
            case 'MAIN-HEADER': {
              let mainHeaderHeight = initHeight - moveHeight;
              if (moveHeight < 0) { // 向上移
                if (previousElement.clientHeight > 60) { // 左侧剩90
                  nextElement.style.height = mainHeaderHeight + 'px';
                }
              } else { // 向下移动
                if (mainHeaderHeight > 60) {
                  nextElement.style.height = mainHeaderHeight + 'px';
                }
              }
              break;
            }
            default:
          }
        };
        document.onmouseup = evt => {
          drag.value = false;
          document.onmousemove = null;
          document.onmouseup = null;
          resize.releaseCapture && resize.releaseCapture();
        };
        resize.setCapture && resize.setCapture();
        return false;
      };
    }

    const showHelp = () =>
      nextTick(() =>
        Vditor.preview(document.getElementById('idHelp'), helpContent, {
          cdn: 'https://dev.kingfisher.live/resource',
          theme: 'dark',
          width: '100%',
          height: '100%',
          mode: 'sv',
          icon: 'material',
        }));

    const loadVersion = time => {
      let note = {
        name: noteModel.currNote.value.name,
      };
      if (noteModel.currNote.value.changed) {
        ElMessageBox.confirm('当前笔记已修改，是否保存？', '提示', {
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
          type: 'warning',
        }).then(() => doSave(() => callOpen(note, time))).catch(() => {
          console.log('不保存笔记');
          callOpen(note, time);
        });
      } else {
        callOpen(note, time);
      }
    };

    const doDelete = () => {
      if (noteModel.currNote.value.name) {
        ElMessageBox.confirm('确定删除笔记？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() =>
          service.invoke('/store/deleteNote', JSON.stringify({path: noteModel.currNote.value.name}), result => {
            if (result.code === 200) {
              ElMessage.success('删除成功');
              noteModel.currNote.value = {
                name: '',
                data: '',
              };
            } else {
              ElMessage.warning(result.message);
            }
          })).catch(() => console.log('取消删除笔记'));
      } else {
        ElMessage.warning('请先打开笔记');
      }
    };

    const doCrypt = function() {
      if (noteModel.currNote.value.name) {
        if (!noteModel.currNote.value.key) {
          ElMessageBox.prompt('请输入密码', '加密笔记', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /\S/,
            inputErrorMessage: '密码不能为空',
          }).then(({value}) =>
            service.invoke('/store/encryptNote', JSON.stringify({
              path: noteModel.currNote.value.name,
              key: value,
            }), result => {
              if (result.code === 200) {
                ElMessage.success('加密成功');
                noteModel.currNote.value.key = value;
              } else {
                ElMessage.warning(result.message);
              }
            })).catch(() => console.log('取消加密笔记'));
        } else {
          ElMessage.warning('笔记已加密');
        }
      } else {
        ElMessage.warning('请先打开笔记');
      }
    };

    watch(noteModel.locking, () => {
      if (noteModel.locking.value) {
        stopVideo();
      }
    });

    let lastSearchPosition = null;

    const textSearch = ref({
      show: false,
      text: '',
      replace: '',
    });

    const searchBox = ref(null);

    const closeSearch = () => {
      textSearch.value.show = false;
      lastSearchPosition = null;
    };

    const search = () => {
      lastSearchPosition = {
        block: 0,
        line: null,
        text: null,
        position: -1,
      };
      doSearch(textSearch.value.text, true);
    };

    const replace = () => {
      editor.focus();
      nextTick(() => {
        let sel = window.getSelection();
        let range = sel.getRangeAt(0);
        if (range.getBoundingClientRect().width > 0) {
          range.deleteContents();
          range.insertNode(document.createTextNode(textSearch.value.replace));
          sel.collapse(sel.focusNode, 0);
          searchNext();
        } else {
          search();
        }
      });

    };

    const searchNext = () => {
      if (!lastSearchPosition) {
        lastSearchPosition = {
          block: 0,
          line: null,
          text: null,
          position: -1,
        };
      }
      doSearch(textSearch.value.text, true);
    };

    const searchPrev = () => {
      doSearch(textSearch.value.text, false);
    };

    const doSearch = (text, direction) => {
      editor.focus();
      nextTick(() => {
        let sel = window.getSelection();
        if (!sel.focusNode) {
          return;
        }

        let container = sel.focusNode.parentNode;
        while (container.tagName !== 'PRE') {
          container = container.parentNode;
        }

        function searchLine(blockIndex, currNode, text, direction) {
          let indexText = -1;
          let fromIndex;

          if (lastSearchPosition.line) {
            let exist = false;
            for (let i = 0; i < currNode.parentNode.childNodes.length; i++) {
              if (currNode.parentNode.childNodes[i] === lastSearchPosition.line) {
                exist = true;
                break;
              }
            }
            if (exist) {
              currNode = lastSearchPosition.line;
            }
          }

          let currText;
          let textCount = 0;
          let textIndex = 0;
          if (currNode != null && currNode.childNodes[0].nodeType === 3) {
            textCount = currNode.childNodes.length;
            if (lastSearchPosition.text) {
              let exist = false;
              for (let i = 0; i < currNode.childNodes.length; i++) {
                if (currNode.childNodes[i] === lastSearchPosition.text) {
                  exist = true;
                  textIndex = i;
                  break;
                }
              }
              if (exist) {
                currText = lastSearchPosition.text;
              } else {
                currText = currNode.childNodes[0];
              }
            } else {
              currText = currNode.childNodes[0];
            }
            if (direction) {
              if (lastSearchPosition.block === blockIndex) {
                if (lastSearchPosition.position !== -1) {
                  fromIndex = lastSearchPosition.position + 1;
                } else {
                  fromIndex = 0;
                }
              } else {
                fromIndex = 0;
              }
              indexText = currText.nodeValue.indexOf(text, fromIndex);
            } else {
              if (lastSearchPosition.block === blockIndex) {
                if (lastSearchPosition.position !== -1) {
                  fromIndex = lastSearchPosition.position - 1;
                } else {
                  fromIndex = currText.nodeValue.length;
                }
              } else {
                fromIndex = currText.nodeValue.length;
              }
              if (fromIndex >= 0) {
                indexText = currText.nodeValue.lastIndexOf(text, fromIndex);
              } else {
                indexText = -1;
              }
            }
          }

          if (indexText > -1) {
            let endIndex = indexText + text.length;
            let range = document.createRange();
            range.setStart(currText, indexText);
            range.setEnd(currText, endIndex);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            if (direction) {
              if (textIndex < textCount - 1) {
                lastSearchPosition = {
                  block: blockIndex,
                  text: currNode.childNodes[textIndex + 1],
                  line: currNode,
                  position: -1,
                };
                return searchLine(blockIndex, currNode.nextSibling, text, direction);
              } else if (currNode?.nextSibling) {
                lastSearchPosition = {
                  block: blockIndex,
                  line: currNode.nextSibling,
                  text: null,
                  position: -1,
                };
                return searchLine(blockIndex, currNode.nextSibling, text, direction);
              }
            } else {
              if (textIndex > 0) {
                lastSearchPosition = {
                  block: blockIndex,
                  text: currNode.childNodes[textIndex - 1],
                  line: currNode,
                  position: -1,
                };
                return searchLine(blockIndex, currNode.previousSibling, text, direction);
              } else if (currNode?.previousSibling) {
                lastSearchPosition = {
                  block: blockIndex,
                  line: currNode.previousSibling,
                  text: null,
                  position: -1,
                };
                return searchLine(blockIndex, currNode.previousSibling, text, direction);
              }
            }
          }

          return {
            block: blockIndex,
            line: currNode,
            text: currText,
            position: indexText,
          };
        }

        if (direction) {
          for (let i = lastSearchPosition.block; i < container.childNodes.length; i++) {
            let currNode = container.childNodes[i].childNodes[0];

            let result = searchLine(i, currNode, text, direction);
            if (result.position !== -1) {
              lastSearchPosition = result;
              return;
            }
          }
        } else {
          for (let i = lastSearchPosition.block; i >= 0; i--) {
            let currNode = container.childNodes[i].childNodes[0];

            let result = searchLine(i, currNode, text, direction);
            if (result.position !== -1) {
              lastSearchPosition = result;
              return;
            }
          }
        }
      });
    };

    return {
      searchBox,
      textSearch,
      closeSearch,
      search,
      replace,
      searchNext,
      searchPrev,
      doCrypt,
      loadVersion,
      doDelete,
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
      noteSearch,
      fullTextSearch,
      doSave,
      showHelp,
      tags: noteModel.tags,
      drag,
    };
  },
};

</script>

<style>
.vertical-dragbar {
  width: 5px;
  height: 100%;
  background: rgb(84, 92, 100);
  cursor: e-resize;
}

.tag {
  border-width: 1px;
  border-style: solid;
  border-radius: 3px;
  margin: 2px;
  padding: 2px 5px 2px 5px;
  font-size: 12px;
}

.vditor-reset a:hover {
  color: #3e91d5 !important;
}

.vditor-reset a, .vditor-ir__link, .vditor-sv__marker--bracket, .vditor-sv__marker, .vditor-sv__marker--heading {
  color: #eaeaea !important;
}

.search-panel {
  position: fixed;
  top: 41px;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 2;
  display: flex;
  border: 1px solid cornflowerblue;
  width: 600px;

  .el-input__wrapper {
    border-width: 0px;
  }

  .el-button {
    border-width: 0px;
  }
}
</style>
