<template>
  <div style="padding: 20px;">
    <el-row style="padding: 5px;">
      <el-col :span="4">视频显示模式：</el-col>
      <el-col :span="20">
        <el-radio-group v-model="setting.displayMode">
          <el-radio-button label="same">同屏</el-radio-button>
          <el-radio-button label="window">新窗口</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="4">笔记目录：</el-col>
      <el-col :span="20">
        <el-input v-model="setting.noteDir" placeholder="请输入笔记目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="4">截图目录：</el-col>
      <el-col :span="20">
        <el-input v-model="setting.screenshotDir" placeholder="请输入截图目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="4"></el-col>
      <el-col :span="20">
        <el-button type="primary" @click="saveSetting">保存</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="js">
import { ref } from "vue";
import noteModel from "../model/note";

export default {
  name: "NoteSetting",
  props: {},
  emits: [],
  components: {},
  setup(props, { emit }) {
    const setting = ref(noteModel.setting.value);

    const saveSetting = () => {
      noteModel.setting.value = setting.value;
      localStorage.setItem("SETTING", JSON.stringify(setting.value));
      noteModel.mainComp.value = "NoteMain";
    };

    return {
      setting, saveSetting
    };
  }
};

</script>
