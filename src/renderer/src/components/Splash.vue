<template>
  <div class="splash">
    <div v-show="show" class="panel">
      <img src="../assets/logo.png" />
    </div>
  </div>
</template>

<script>
import {ref} from 'vue';

export default {
  name: 'Splash',
  setup() {
    const show = ref(false);
    setTimeout(() => {
      show.value = true;
    }, 1000);
    return {show};
  },
};
</script>

<style scoped>
.splash {
  position: absolute;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .panel {
    width: 50%;
    height: 50%;
    background-color: rgba(0, 0, 0, 0.5);
    border: #757575 1px solid;

    img {
      width: 100%;
      height: 100%;
      border-image-outset: 0px 0px 0px 0px;
    }
  }
}
</style>