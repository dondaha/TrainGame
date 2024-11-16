<template>
  <div id="hand-gesture">
    <div class="camera-container">
      <!-- 视频流显示 -->
      <video ref="video" class="camera-feed" autoplay></video>
      <!-- 画布用于绘制手势识别结果 -->
      <canvas ref="canvas" class="camera-overlay"></canvas>
    </div>
    <!-- 按钮用于启用或禁用手势识别 -->
    <button @click="toggleWebcam">
      {{ webcamRunning ? "DISABLE PREDICTIONS" : "ENABLE PREDICTIONS" }}
    </button>
    <!-- 显示手势识别结果 -->
    <div id="gesture_output" class="gesture-output">
    <p>Left Hand: {{ leftHandNumber }}, Right Hand: {{ rightHandNumber }}</p>
    </div>
  </div>
</template>

<script>
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

export default {
  data() {
    return {
      gestureRecognizer: null, // 手势识别器实例
      runningMode: "IMAGE", // 运行模式，初始为图像模式
      webcamRunning: false, // 摄像头是否正在运行
      predRunning: false, // 是否正在使用mediapipe预测
      videoHeight: "360px", // 视频高度
      videoWidth: "480px", // 视频宽度
      lastVideoTime: -1, // 上一次视频时间
      results: undefined, // 识别结果
      numHands: 2, // 手的数量
      leftHandNumber: -1, // 左手数字
      rightHandNumber: -1, // 右手数字
      drawUtilsLoaded: false, // drawing_utils 是否已加载
      angle_threshold: 25 // 判断手指弯曲的角度阈值
    };
  },
  mounted() {
    this.loadDrawingUtils();
    this.createHandLandmarker();
    this.toggleWebcam();
  },
  methods: {
    async loadDrawingUtils() {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
      script.onload = () => {
        this.drawUtilsLoaded = true;
      };
      document.head.appendChild(script);
    },
    async createHandLandmarker() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      this.gestureRecognizer = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: this.runningMode,
        numHands: this.numHands
      });
    },
    toggleWebcam() {
      if (this.webcamRunning) {
        this.webcamRunning = false;
      } else {
        this.webcamRunning = true;
        this.enableCam();
      }
    },
    enableCam() {
      const constraints = {
        video: true
      };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        this.$refs.video.srcObject = stream;
        this.$refs.video.addEventListener("loadeddata", this.predictWebcam);
      });
    },
    async predictWebcam() {
      if (!this.drawUtilsLoaded) {
        requestAnimationFrame(this.predictWebcam);
        return;
      }

      const video = this.$refs.video;
      const canvas = this.$refs.canvas;
      const canvasCtx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (this.runningMode === "IMAGE") {
        this.runningMode = "VIDEO";
        await this.gestureRecognizer.setOptions({ runningMode: "VIDEO" });
      }

      const startTimeMs = performance.now();
      if (this.lastVideoTime !== video.currentTime) {
        this.lastVideoTime = video.currentTime;
        this.results = this.gestureRecognizer.detectForVideo(video, startTimeMs);
      }

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

      // 应用水平翻转变换
      canvasCtx.translate(canvas.width, 0);
      canvasCtx.scale(-1, 1);
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 绘制手部关键点
      if (this.results.landmarks) {
        for (const landmarks of this.results.landmarks) {
          window.drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        }
      }
      canvasCtx.restore(); // 恢复上下文状态

      this.updateHandNumber(this.results); // 更新手的数字

      // console.log(this.leftHandNumber, this.rightHandNumber);

      if (this.webcamRunning) {
        window.requestAnimationFrame(this.predictWebcam);
      }
    },
    /**
     * 更新leftHandNumber和rightHandNumber
     *
     * @param {results} HandLandmarkerResult - The hand landmark detection results.
     * @returns {void}
     */
    updateHandNumber(results) {
      // 获取手的数量
      const numHands = results.handednesses.length;
      // 遍历检测到的手
      for (let i = 0; i < numHands; i++){
        const label = this.results.handednesses[i][0].categoryName === "Left" ? "Right" : "Left";
        const score = this.results.handednesses[i][0].score;
        // 设计一个数组，分别代表大拇指、食指、中指、无名指、小拇指的1，2点和3，4点的夹角
        const angles = [];
        // 遍历每个手指
        for (let j = 0; j < 5; j++) {
          // 获取手指的21个关键点
          const points = results.landmarks[i].slice(j * 4 + 1, j * 4 + 5);
          // 使用余弦定理计算两个向量的夹角（只考虑xy）
          let angle = Math.acos(
            ((points[0].x - points[1].x) * (points[2].x - points[3].x) +
            (points[0].y - points[1].y) * (points[2].y - points[3].y)) /
            (Math.sqrt(Math.pow(points[0].x - points[1].x, 2) + Math.pow(points[0].y - points[1].y, 2)) *
              Math.sqrt(Math.pow(points[2].x - points[3].x, 2) + Math.pow(points[2].y - points[3].y, 2)))
          );
          // 转化为角度
          angle = Math.abs(angle * 180 / Math.PI);
          angles.push(angle);
        }
        // 根据angles中小于阈值的个数判断手势（0-5）
        let number = 0;
        for (let j = 0; j < 5; j++) {
          if (angles[j] < this.angle_threshold) {
            number++;
          }
        }
        if (label === "Left") {
          this.leftHandNumber = number;
        } else {
          this.rightHandNumber = number;
        }
      }
    }
  }
};
</script>

<style scoped>
#hand-gesture {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 320px;
  background: rgba(255, 255, 255, 0.5);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.camera-container {
  position: relative;
  width: 100%;
  height: 240px;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

button {
  margin-top: 10px;
}

.gesture-output {
  margin-top: 10px;
  white-space: pre-wrap;
}
</style>