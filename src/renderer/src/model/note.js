import { ref } from "vue";
import service from "../utils/service";

const currNote = ref(localStorage.getItem("NOTE") ? JSON.parse(localStorage.getItem("NOTE")) : {});
console.log("加载上次笔记", currNote.value);

const noteList = ref([]);
service.invoke("/store/getNoteList", null, (result) => {
  noteList.value = result;
});

const videoUrl = ref("");

const mainComp = ref("NoteMain");

let settingContent = localStorage.getItem("SETTING");

const setting = ref(settingContent ? JSON.parse(settingContent) : {
  displayMode: "window",
  noteDir: "note",
  screenshotDir: "screenshot"
});

export default {
  currNote, noteList, videoUrl, mainComp, setting
};
