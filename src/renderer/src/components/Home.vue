<template>
  <el-container style="width: 100%; height: 100%; margin: 0px; padding: 0px;">
    <el-header style="padding: 0px">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
        style="width: 100%"
        active-text-color="#ffd04b"
        background-color="#545c64"
        text-color="#fff"
        popper-effect="dark"
      >
        <el-sub-menu index="1">
          <template #title>文件</template>
          <el-menu-item index="2-1">新建笔记</el-menu-item>
          <el-menu-item index="2-2">打开笔记</el-menu-item>
          <el-sub-menu index="2-3">
            <template #title>打开历史笔记</template>
            <el-menu-item :index="note.name" v-for="note in recentNotes" :key="note.name">{{ note.name }}</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="2-4">保存笔记</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="4">设置</el-menu-item>
        <el-menu-item index="5">关于</el-menu-item>
        <el-menu-item index="7">{{ currNote.name }}{{currNote.changed ? "*": ""}}</el-menu-item>
      </el-menu>
    </el-header>
    <el-main style="padding: 0px;">
      <component :is="mainComp" ref="mainComponent"></component>
    </el-main>
  </el-container>
  <el-dialog v-model="dialogAboutVisible" title="关于" width="400">
    <p>作者：翠鸟君王</p>
    <p>版本：0.0.1</p>
    <p>日期：2024-04-21</p>
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
</template>

<script lang="js">
import { computed, nextTick, ref } from "vue";
import NoteMain from "./NoteMain.vue";
import NoteSetting from "./NoteSetting.vue";
import noteModel from "../model/note";
import service from "../utils/service";
import { ElMessageBox } from "element-plus";

export default {
  name: "Home",
  components: { NoteMain, NoteSetting },
  setup () {
    const activeIndex = ref("1");

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
        case "4":
          dialogSettingVisible.value = true;
          nextTick(() => {
            settingDialog.value.updateSetting(noteModel.setting.value);
          });
          break;
        case "5":
          dialogAboutVisible.value = true;
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

    const mainComp = noteModel.mainComp;

    const mainComponent = ref();

    const dialogAboutVisible = ref(false);
    const dialogSettingVisible = ref(false);

    const settingDialog = ref();

    const saveSetting = () => {
      noteModel.setting.value = settingDialog.value.setting;
      localStorage.setItem("SETTING", JSON.stringify(settingDialog.value.setting));

      service.invoke("/store/updateSetting", JSON.stringify(noteModel.setting.value), (result) => {
        console.log("更新设置", result);
      });

      dialogSettingVisible.value = false;
    };

    return {
      dialogAboutVisible,
      dialogSettingVisible,
      activeIndex,
      handleSelect,
      mainComp,
      mainComponent,
      currNote: noteModel.currNote,
      noteList: noteModel.noteList,
      recentNotes: noteModel.recentNotes,
      saveSetting,
      settingDialog
    };
  }
};

</script>
