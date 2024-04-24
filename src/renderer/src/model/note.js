import { ref } from "vue";
import service from "../utils/service";

const currNote = ref({});

const noteList = ref([]);

const videoUrl = ref("");

const mainComp = ref("NoteMain");

const lastScreenshot = ref();

let settingContent = localStorage.getItem("SETTING");

const setting = ref(settingContent ? JSON.parse(settingContent) : {
  displayMode: "window",
  noteDir: "note",
  screenshotDir: "screenshot",
  pauseWhenWrite: true,
  autoOpenVideo: true,
  openLastNote: true,
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

const tags = ref([
  { value: "文学", label: "文学", color:"#ee6a6a" },
  { value: "科技", label: "科技", color: "#7171ea" },
  { value: "宗教", label: "宗教", color: "#ec9d71" },
  { value: "艺术", label: "艺术", color: "#87e887" },
  { value: "生活", label: "生活", color: "#e1e188" },
])

const versions = ref([])

export default {
  currNote, noteList, videoUrl, mainComp, setting, markChanged, recentNotes, lastScreenshot, tags, versions
};
