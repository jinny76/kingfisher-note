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
        <el-menu-item index="4">退出</el-menu-item>
        <el-menu-item index="5">{{ currNote.name }}</el-menu-item>
      </el-menu>
    </el-header>
    <el-main style="padding: 0px;">
      <component :is="mainComp"></component>
    </el-main>
    <el-footer>Footer</el-footer>
  </el-container>
  <el-dialog v-model="dialogOpenVisible" title="打开笔记" width="500">
    <el-row v-for="note in noteList" :key="note" style="width: 100%; padding: 5px;">
      <el-col :span="24" style="cursor: pointer; color: black" @click="openNote(note)">{{note}}</el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogOpenVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="js">
import { ref } from 'vue'
import NoteMain from './NoteMain.vue'
import noteModel from '../model/note'
import service from "../utils/service"
import {ElMessageBox} from "element-plus";

export default {
  name: 'Home',
  components: {NoteMain},
  setup () {
    const activeIndex = ref('1')

    const handleSelect = (index) => {
      switch (index) {
        case "2-1":
          ElMessageBox.prompt('请输入笔记名称', '新建笔记', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPattern: /\S/,
            inputErrorMessage: '笔记名称不能为空'
          }).then(({ value }) => {
            noteModel.currNote.value = {
              name : value + ".kfnote",
              data : ""
            }
          }).catch(() => {
            console.log('取消新建笔记')
          })
          break;
        case "2-2":
          dialogOpenVisible.value = true;
          break;
      }
    }

    const mainComp = ref('NoteMain');

    const dialogOpenVisible = ref(false);

    const openNote = (note) => {
      dialogOpenVisible.value = false;

      service.invoke("/store/getNote", JSON.stringify({
        path: note
      }), (result)=>{
        noteModel.currNote.value = result
      });
    }

    return {
      activeIndex,
      handleSelect,
      mainComp,
      currNote : noteModel.currNote,
      noteList: noteModel.noteList,
      dialogOpenVisible,
      openNote
    }
  }
}

</script>
