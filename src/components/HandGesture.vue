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
    <div id="gesture_output" class="gesture-output"></div>
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
      videoHeight: "360px", // 视频高度
      videoWidth: "480px", // 视频宽度
      lastVideoTime: -1, // 上一次视频时间
      results: undefined, // 识别结果
      numHands: 2, // 手的数量
      leftHandNumber: -1, // 左手数字
      rightHandNumber: -1, // 右手数字
      drawUtilsLoaded: false, // drawing_utils 是否已加载
    };
  },
  mounted() {
    this.loadDrawingUtils();
    this.createHandLandmarker();
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
      if (this.results.landmarks) {
        for (const landmarks of this.results.landmarks) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5
          });
          window.drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
        }
      }
      canvasCtx.restore();

      this.processHandLandmarks(this.results.landmarks);

      if (this.webcamRunning) {
        window.requestAnimationFrame(this.predictWebcam);
      }
    },
    processHandLandmarks(landmarks) {
      if (landmarks.length === 0) {
        this.leftHandNumber = -1;
        this.rightHandNumber = -1;
      } else {
        // 假设第一个手是左手，第二个手是右手
        this.leftHandNumber = this.getHandNumber(landmarks[0]);
        this.rightHandNumber = landmarks[1] ? this.getHandNumber(landmarks[1]) : -1;
      }
    },
    getHandNumber(landmarks) {
      // 这里可以根据手势关键点信息计算手势数字
      // 例如：根据手指弯曲情况判断数字
      // 这里只是一个示例，具体实现需要根据实际需求调整
      return Math.floor(Math.random() * 5) + 1; // 随机返回1-5的数字
    }
  }
};
</script>

<style scoped>
#hand-gesture {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  background: rgba(255, 255, 255, 0.8);
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