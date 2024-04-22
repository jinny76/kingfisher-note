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
            <el-menu-item index="2-3-1">AAA</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="2-4">保存笔记</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="4">设置</el-menu-item>
        <el-menu-item index="5">{{ currNote.name }}{{currNote.changed ? "*": ""}}</el-menu-item>
      </el-menu>
    </el-header>
    <el-main style="padding: 0px;">
      <component :is="mainComp" ref="mainComponent"></component>
    </el-main>
  </el-container>
</template>

<script lang="js">
import { computed, ref } from "vue";
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
        case "4":
          mainComp.value = "NoteSetting";
          break;
      }
    };

    const mainComp = noteModel.mainComp;

    const mainComponent = ref();

    return {
      activeIndex,
      handleSelect,
      mainComp,
      mainComponent,
      currNote: noteModel.currNote,
      noteList: noteModel.noteList,
    };
  }
};

</script>
