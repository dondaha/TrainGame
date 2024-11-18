<!-- FallingNumber.vue -->
<template>
  <div id="info">
    <div id="title">数字乐园 - 3D</div>
    Powered by <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a><br />
  </div>
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
#info {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  /* 透明背景 */
  background-color: rgba(255, 255, 255, 0.0);
  padding: 10px; /* 可选：设置内边距 */
}
body {
  background-color: #bfe3dd;
  color: #000;
}

a {
  color: #2983ff;
}

#title {
  font-size: 20px;
  font-weight: bold;
}
</style>
