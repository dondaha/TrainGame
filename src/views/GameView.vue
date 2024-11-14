<!-- GameView.vue -->
<template>
  <div>
    <Train />
    <FallingNumber />
    <HandGesture />
  </div>
</template>

<script>
import Train from '../components/Train.vue';
import FallingNumber from '../components/FallingNumber.vue';
import HandGesture from '../components/HandGesture.vue';

export default {
  components: {
    Train,
    FallingNumber,
    HandGesture
  }
}
</script>

<style scoped>
/* 样式 */
</style>