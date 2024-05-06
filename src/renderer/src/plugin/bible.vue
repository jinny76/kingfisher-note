<template>
  <el-select ref="select" v-model="result" placeholder="请选择">
    <el-option
      v-for="item in options"
      :key="item.label"
      :label="item.label"
      :value="item.label"
    >
      <span style="float: left">{{ item.label }}</span>
    </el-option>
  </el-select>
</template>

<script>
import {ref} from 'vue';
import DialogHandle from '../utils/dialog.js';

const bibleIndex = {
  'B01C001.htm': '创世记',
  'B02C001.htm': '出埃及记',
  'B03C001.htm': '利未记',
  'B04C001.htm': '民数记',
  'B05C001.htm': '申命记',
  'B06C001.htm': '约书亚记',
  'B07C001.htm': '士师记',
  'B08C001.htm': '路得记',
  'B09C001.htm': '撒母耳记上',
  'B10C001.htm': '撒母耳记下',
  'B11C001.htm': '列王纪上',
  'B12C001.htm': '列王纪下',
  'B13C001.htm': '历代志上',
  'B14C001.htm': '历代志下',
  'B15C001.htm': '以斯拉记',
  'B16C001.htm': '尼希米记',
  'B17C001.htm': '以斯帖记',
  'B18C001.htm': '约伯记',
  'B19C001.htm': '诗篇',
  'B20C001.htm': '箴言',
  'B21C001.htm': '传道书',
  'B22C001.htm': '雅歌',
  'B23C001.htm': '以赛亚书',
  'B24C001.htm': '耶利米书',
  'B25C001.htm': '耶利米哀歌',
  'B26C001.htm': '以西结书',
  'B27C001.htm': '但以理书',
  'B28C001.htm': '何西阿书',
  'B29C001.htm': '约珥书',
  'B30C001.htm': '阿摩司书',
  'B31C001.htm': '俄巴底亚书',
  'B32C001.htm': '约拿书',
  'B33C001.htm': '弥迦书',
  'B34C001.htm': '那鸿书',
  'B35C001.htm': '哈巴谷书',
  'B36C001.htm': '西番雅书',
  'B37C001.htm': '哈该书',
  'B38C001.htm': '撒迦利亚书',
  'B39C001.htm': '玛拉基书',
  'B40C001.htm': '马太福音',
  'B41C001.htm': '马可福音',
  'B42C001.htm': '路加福音',
  'B43C001.htm': '约翰福音',
  'B44C001.htm': '使徒行传',
  'B45C001.htm': '罗马书',
  'B46C001.htm': '哥林多前书',
  'B47C001.htm': '哥林多后书',
  'B48C001.htm': '加拉太书',
  'B49C001.htm': '以弗所书',
  'B50C001.htm': '腓立比书',
  'B51C001.htm': '歌罗西书',
  'B52C001.htm': '帖撒罗尼迦前书',
  'B53C001.htm': '帖撒罗尼迦后书',
  'B54C001.htm': '提摩太前书',
  'B55C001.htm': '提摩太后书',
  'B56C001.htm': '提多书',
  'B57C001.htm': '腓利门书',
  'B58C001.htm': '希伯来书',
  'B59C001.htm': '雅各书',
  'B60C001.htm': '彼得前书',
  'B61C001.htm': '彼得后书',
  'B62C001.htm': '约翰一书',
  'B63C001.htm': '约翰二书',
  'B64C001.htm': '约翰三书',
  'B65C001.htm': '犹大书',
  'B66C001.htm': '启示录',
};
const bibleWebsite = 'http://www.godcom.net/hhb/';

const onClickLink = (title, src) => {
  let key = Object.keys(bibleIndex).
    find(key => title.indexOf(bibleIndex[key]) !== -1);
  if (key) {
    let name = bibleIndex[key];
    let chapter = title.replace(name, '').replace('[', '').replace(']', '').trim();
    if (!chapter) {
      chapter = '1:1';
    }
    let chapterIndex = parseInt(chapter.split(':')[0]);
    if (chapterIndex > 0) {
      let url = key.replace('001', chapterIndex.toString().padStart(3, '0'));
      window.open(bibleWebsite + url, '_blank');
      return true;
    }
  }
  return false;
};

const result = ref('');
const handleEvent = (event, cb) => {
  if (event.name === 'insertLink') {
    DialogHandle({
      title: '提示',
      component: 'PluginBible',
      width: '300px',
      onConfirm: () => {
        if (result.value) {
          cb(`\n\n[[${result.value}1:1]](http://)\n`);
        }
      },
    });
  }
};

export default {
  name: 'PluginBible',
  setup(props, {emit}) {
    const select = ref(null);

    const options = Object.keys(bibleIndex).map(key => {
      return {
        label: bibleIndex[key],
        value: key,
      };
    });

    return {
      options, result, select,
    };
  },
  onClickLink, handleEvent,
};
</script>
