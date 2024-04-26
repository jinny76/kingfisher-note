import { ref } from "vue";
import service from "../utils/service";

const currNote = ref({});

const noteList = ref([]);

const videoUrl = ref("");

const mainComp = ref("NoteMain");

const lastScreenshot = ref();

const setting = ref({
  displayMode: "window",
  pauseWhenWrite: true,
  autoOpenVideo: true,
  openLastNote: true,
  lockTime: 15,
  password: "",
  onlyForUnlock: true
});

const settingReady = ref(false);

service.invoke("/store/getSetting", "", (result) => {
  if (result?.setting) {
    Object.keys(result.setting).map(key => {
      setting.value[key] = result.setting[key];
    });
  }
  settingReady.value = true;
});

let lockTimer = null;

const startColdDown = () => {
  setting.value.lockTime = setting.value.lockTime || 0;

  if (setting.value.lockTime > 0) {
    console.log("开始锁定计时", setting.value.lockTime, "分钟")
    if (lockTimer) {
      clearTimeout(lockTimer);
    }

    setTimeout(() => {
      locking.value = true;
    }, setting.value.lockTime * 60 * 1000);
  }
};

const stopColdDown = () => {
  if (lockTimer) {
    clearTimeout(lockTimer);
  }
};

const markChanged = () => {
  if (currNote.value.name) {
    currNote.value.changed = true;
  }
  startColdDown();
};

const locking = ref(false);

const recentNotes = ref([]);

const tags = ref([
  { value: "文学", label: "文学", color: "#ee6a6a" },
  { value: "科技", label: "科技", color: "#7171ea" },
  { value: "宗教", label: "宗教", color: "#ec9d71" },
  { value: "艺术", label: "艺术", color: "#87e887" },
  { value: "生活", label: "生活", color: "#e1e188" }
]);

const versions = ref([]);

const currVersion = ref(null);

export default {
  currNote, noteList, videoUrl, mainComp, setting, markChanged, locking,
  recentNotes, lastScreenshot, tags, versions, currVersion, settingReady,
  startColdDown, stopColdDown, constPassword : "kingfisher123456789!@#$%^&"
};
