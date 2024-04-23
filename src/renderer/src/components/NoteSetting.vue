<template>
  <div style="padding: 20px;">
    <el-row style="padding: 5px;">
      <el-col :span="6">视频显示模式：</el-col>
      <el-col :span="18">
        <el-radio-group v-model="setting.displayMode">
          <el-radio-button label="same">同屏</el-radio-button>
          <el-radio-button label="window">新窗口</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">笔记目录：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.noteDir" placeholder="请输入笔记目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">截图目录：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.screenshotDir" placeholder="请输入截图目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">编写时暂停：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.pauseWhenWrite" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">启动时打开上次笔记：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.openLastNote" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">自动打开笔记中的视频：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.autoOpenVideo" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="js">
import { ref } from "vue";

export default {
  name: "NoteSetting",
  props: {},
  emits: [],
  components: {},
  setup() {
    const setting = ref({});

    const updateSetting = (_setting) => {
      setting.value = {..._setting};
    }

    return {
      setting, updateSetting
    };
  }
};

</script>
