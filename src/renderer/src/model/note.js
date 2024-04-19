import {ref} from 'vue'
import service from '../utils/service'

const currNote = ref(localStorage.getItem("NOTE") ? JSON.parse(localStorage.getItem("NOTE")) : {})
console.log("加载上次笔记", currNote.value)

const noteList = ref([])
service.invoke('/store/getNoteList', null, (result) => {
  noteList.value = result
});

const displayMode = ref("window")

const videoUrl = ref("")

export default {
  currNote, noteList, displayMode, videoUrl
}
