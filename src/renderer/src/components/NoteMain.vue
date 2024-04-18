<template>
  <div ref="noteEditor" id="idNoteEditor"></div>
</template>

<script lang="js">
import { ref, watch } from 'vue'
import Vditor from 'vditor'
import keyManager from '../utils/keys'
import service from '../utils/service'
import noteModel from '../model/note'
import {ElMessage} from "element-plus";

export default {
  name: 'NoteMain',
  components: {},
  setup () {
    const noteEditor = ref()

    let editor;

    keyManager.registerHotkeyProcessor("ctrl+s", (event, handler)=>{
      event.preventDefault();
      noteModel.currNote.value.data = editor.getValue();
      localStorage.setItem("NOTE", JSON.stringify(noteModel.currNote.value));
      service.invoke("/store/saveNote", JSON.stringify({
        path: noteModel.currNote.value.name,
        data: noteModel.currNote.value.data
      }), (result)=>{
        console.log("保存笔记成功", result);
        ElMessage.success("保存笔记成功");
      });
    }, "保存笔记");

    keyManager.registerHotkeyProcessor("ctrl+o", (event, handler)=>{
      service.send("window-new", {route: "/video"})
    }, "打开视频")

    watch(noteModel.currNote, ()=>{
      if (noteModel.currNote.value?.data) {
        editor.setValue(noteModel.currNote.value.data);
      }
    })

    watch(() => noteEditor.value, () => {
      if (noteEditor.value) {
        editor = new Vditor("idNoteEditor", {
          cdn: "https://dev.kingfisher.live/resource",
          theme: "dark",
          width: "100%",
          height: "100%",
          mode: "sv",
          icon: "material",
          preview: {
            delay: 200,
            theme : {
              current: "dark"
            },
            actions:[]
          },
          link : {
            click: (dom)=>{
              console.log(dom);
            }
          }
        })
      }
    });

    return {
      noteEditor,
      editor
    }
  }
}

</script>

<style>
</style>
