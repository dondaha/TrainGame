<!-- GameView.vue -->
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
      // 掉落5-9之间的数字
      fallingNumber: -1,
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
    updateNumber(){
      // 更新掉落的数字和车厢数字
      // 在如下的组合中随机选择：(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9) (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9) (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9) (4, 5), (4, 6), (4, 7), (4, 8), (4, 9) (5, 6), (5, 7), (5, 8), (5, 9) (6, 7), (6, 8), (6, 9) (7, 8), (7, 9) (8, 9)
      const combinations = [
        [5, 6], [5, 7], [5, 8], [5, 9],
        [6, 7], [6, 8], [6, 9],
        [7, 8], [7, 9],
        [8, 9]
      ];
      const randomIndex = Math.floor(Math.random() * combinations.length);
      this.carriageNumber = combinations[randomIndex][0]; 
      this.fallingNumber = combinations[randomIndex][1];
    }
    ,
    checkGameLogic() {
      if (this.leftHandNumber + this.rightHandNumber === this.fallingNumber) {
        if (this.leftHandNumber + this.carriageNumber === 10) {
          this.carriageNumber = this.rightHandNumber;
          this.$refs.train.playAnimation(0); // 播放过关动画
        } else if (this.rightHandNumber + this.carriageNumber === 10) {
          this.carriageNumber = this.leftHandNumber;
          this.$refs.train.playAnimation(0); // 播放过关动画
        }
      }
    },
    Game(){
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