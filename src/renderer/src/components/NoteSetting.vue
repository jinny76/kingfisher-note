<template>
  <div style="padding: 20px;">
    <el-row style="padding: 5px;">
      <el-col :span="6" title="单显示器可以使用同屏模式，多显示器可以使用新窗口模式">显示模式：</el-col>
      <el-col :span="18">
        <el-radio-group v-model="setting.displayMode">
          <el-radio-button label="same">同屏</el-radio-button>
          <el-radio-button label="window">新窗口</el-radio-button>
        </el-radio-group>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="保存笔记的目录">笔记目录：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.noteDir" placeholder="请输入笔记目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="保存截图的目录">截图目录：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.screenshotDir" placeholder="请输入截图目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="保存附件的目录">附件目录：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.assetsDir" placeholder="请输入附件目录"></el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="当输入笔记内容时，视频暂停">编写时暂停：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.pauseWhenWrite" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="打开上次编辑的笔记">启动时打开上次笔记：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.openLastNote" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="自动打开上次的视频或者其他文档">自动打开笔记中的文档：</el-col>
      <el-col :span="18">
        <el-switch v-model="setting.autoOpenVideo" active-text="是" inactive-text="否"></el-switch>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="插入标题后自动插入时间签">自动插入时间签：</el-col>
      <el-col :span="18" style="display: flex">
        <el-select v-model="setting.autoTimestamp" placeholder="请选择插入范围" style="width: 200px;">
          <el-option v-for="item in insertFor" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="当不操作的时候，过一段时间锁定，0不锁定">自动锁定：</el-col>
      <el-col :span="18">
        <el-input v-model="setting.lockTime" placeholder="请输入锁定时间" type="number">
          <template #append>
            分钟
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="解锁或者打开笔记时需要输入的密码">访问密码：</el-col>
      <el-col :span="18" style="display: flex">
        <el-input v-model="setting.password" clearable placeholder="请输入访问密码" type="password">
          <template #append>
            仅解锁：
            <el-switch v-model="setting.onlyForUnlock"/>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="时间签比创建时的偏移量">时间签偏移：</el-col>
      <el-col :span="18" style="display: flex">
        <el-input v-model="setting.timestampOffset" placeholder="请输入时间签偏移" type="number">
          <template #append>
            秒
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="快进或者后退每次移动的时长">快进步长：</el-col>
      <el-col :span="18" style="display: flex">
        <el-input v-model="setting.forwardStep" placeholder="请输入快进步长" type="number">
          <template #append>
            秒
          </template>
        </el-input>
      </el-col>
    </el-row>
    <el-row style="padding: 5px;">
      <el-col :span="6" title="AI分析">AI分析：</el-col>
      <el-col :span="18" class="ai-server" style="display: flex">
        <el-input v-model="setting.aiKey" placeholder="请输入APP KEY" type="password" clearable>
          <template #prefix>
            <el-select v-model="setting.aiServer" placeholder="请选择AI供应商" style="width: 200px;" clearable>
              <el-option v-for="item in aiServers" :key="item.value" :label="item.label"
                         :value="item.value"></el-option>
            </el-select>
          </template>
        </el-input>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="js">
import {ref} from 'vue';
import noteModel from '../model/note';

export default {
  name: 'NoteSetting',
  props: {},
  emits: [],
  components: {},
  setup() {
    const setting = ref({});

    const updateSetting = _setting => {
      setting.value = {..._setting};
      if (setting.value.password) {
        setting.value.password = noteModel.constPassword;
      }
    };

    return {
      setting, updateSetting, insertFor: noteModel.insertFor, aiServers: noteModel.aiServers,
    };
  },
};

</script>

<style lang="scss">
.ai-server {
  .el-select__wrapper {
    box-shadow: 0px 0px 0px 0px #000000;
    width: 120px;
  }

  .el-select__wrapper:hover {
    box-shadow: 0px 0px 0px 0px #000000;
  }
}
</style>