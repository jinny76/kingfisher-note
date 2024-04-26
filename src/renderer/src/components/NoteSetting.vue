<template>
  <div style="padding: 20px;">
    <el-row style="padding: 5px;">
      <el-col :span="6">显示模式：</el-col>
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
      <el-col :span="6">附件目录：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.assetsDir" placeholder="请输入附件目录"></el-input>
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
      <el-col :span="6">自动打开笔记中的文档：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.autoOpenVideo" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">自动锁定：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.lockTime" placeholder="请输入锁定时间" type="number">
          <template #append>
            分钟
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6">访问密码：</el-col>
      <el-col :span="18" style="display: flex">
        <el-input v-model="setting.password" placeholder="请输入访问密码" type="password" clearable>
          <template #append>
            仅解锁：
            <el-switch v-model="setting.onlyForUnlock" />
          </template>
        </el-input>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="js">
import { ref } from "vue";
import noteModel from "../model/note"

export default {
  name: "NoteSetting",
  props: {},
  emits: [],
  components: {},
  setup () {
    const setting = ref({});

    const updateSetting = (_setting) => {
      setting.value = { ..._setting };
      if (setting.value.password) {
        setting.value.password = noteModel.constPassword;
      }
    };

    return {
      setting, updateSetting
    };
  }
};

</script>
