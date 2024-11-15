<!-- FallingNumber.vue -->
<template>
  <div class="falling-number">{{ number }}</div>
</template>

<script>
export default {
  data() {
    return {
      number: Math.floor(Math.random() * 9) + 1,
    };
  },
};
</script>

<style scoped>
.falling-number {
  /* 动画效果 */
}
</style>
