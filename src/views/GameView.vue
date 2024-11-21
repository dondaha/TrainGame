<template>
  <div id="game-view">
    <Train ref="train" :carriageNumber="carriageNumber" />
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
      carriageNumber: -1,
      fallingNumber: -1,
      leftHandNumber: -1,
      rightHandNumber: -1,
      round: 0 // 新增轮次计数
    };
  },
  methods: {
    updateHandNumbers(left, right) {
      this.leftHandNumber = left;
      this.rightHandNumber = right;
      this.checkGameLogic();
    },
    updateNumber() {
      const combinations = [[1, 9], [2, 8], [2, 9], [3, 7], [3, 8], [3, 9], [4, 6], [4, 7], [4, 8], [4, 9], [5, 5], [5, 6], [5, 7], [5, 8], [5, 9], [6, 4], [6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8], [8, 9], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9]];
      const randomIndex = Math.floor(Math.random() * combinations.length);
      this.carriageNumber = combinations[randomIndex][0];
      this.fallingNumber = combinations[randomIndex][1];
      this.$refs.train.setCarriageNumber(this.carriageNumber);
      this.$refs.train.setFallingNumber(this.fallingNumber);
    },
    checkGameLogic() {
      if (this.leftHandNumber + this.rightHandNumber === this.fallingNumber) {
        if (this.leftHandNumber + this.carriageNumber === 10) {
          this.carriageNumber = this.rightHandNumber;
          this.$refs.train.playAnimation(0); // 播放过关动画
          this.nextRound();
        } else if (this.rightHandNumber + this.carriageNumber === 10) {
          this.carriageNumber = this.leftHandNumber;
          this.$refs.train.playAnimation(0); // 播放过关动画
          this.nextRound();
        }
      }
    },
    nextRound() {
      this.round++;
      setTimeout(() => {
        this.Game();
      }, 4000); // 延迟1秒开始下一轮
    },
    Game() {
      this.updateNumber();
      this.$refs.train.playAnimation(1); // 游戏开始时播放动画
      this.checkGameLogic();
    }
  },
  mounted() {
    // 延迟执行游戏逻辑
    setTimeout(() => {
      this.Game();
    }, 1000);
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
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>