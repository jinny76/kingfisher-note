import { ref } from "vue";
import service from "../utils/service";

const currNote = ref(localStorage.getItem("NOTE") ? JSON.parse(localStorage.getItem("NOTE")) : {});
console.log("加载上次笔记", currNote.value);

const noteList = ref([]);

const videoUrl = ref("");

const mainComp = ref("NoteMain");

let settingContent = localStorage.getItem("SETTING");

const setting = ref(settingContent ? JSON.parse(settingContent) : {
  displayMode: "window",
  noteDir: "note",
  screenshotDir: "screenshot",
  pauseWhenWrite: true,
  autoOpenVideo: true,
});

service.invoke("/store/updateSetting", JSON.stringify(setting.value), (result) => {
  console.log("更新设置", result);
});

const markChanged = () => {
  if (currNote.value.name) {
    currNote.value.changed = true
  }
}

const recentNotes = ref([]);

export default {
  currNote, noteList, videoUrl, mainComp, setting, markChanged, recentNotes
};
