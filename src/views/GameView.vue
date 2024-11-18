<!-- GameView.vue -->
<template>
  <div id="game-view">
    <Train :carriageNumber="carriageNumber" />
    <FallingNumber :fallingNumber="fallingNumber" />
    <HandGesture @update-numbers="updateHandNumbers" />
    <div id="game-info">
      <p>车厢数字: {{ carriageNumber }}</p>
      <p>掉落数字: {{ fallingNumber }}</p>
      <p>左手数字: {{ leftHandNumber }}</p>
      <p>右手数字: {{ rightHandNumber }}</p>
    </div>
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
  },
  data() {
    return {
      carriageNumber: Math.floor(Math.random() * 9) + 1,
      fallingNumber: Math.floor(Math.random() * 9) + 1,
      leftHandNumber: -1,
      rightHandNumber: -1
    };
  },
  methods: {
    updateHandNumbers(left, right) {
      this.leftHandNumber = left;
      this.rightHandNumber = right;
      this.checkGameLogic();
    },
    checkGameLogic() {
      if (this.leftHandNumber + this.rightHandNumber === this.fallingNumber) {
        if (this.leftHandNumber + this.carriageNumber === 10) {
          this.carriageNumber = this.rightHandNumber;
        } else if (this.rightHandNumber + this.carriageNumber === 10) {
          this.carriageNumber = this.leftHandNumber;
        }
      }
    }
  }
}
</script>

<style scoped>
#game-info {
  position: fixed;
  top: 10px;
  left: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
  /* 增加阴影 */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>