<template>
  video
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


    return {
    }
  }
}

</script>
