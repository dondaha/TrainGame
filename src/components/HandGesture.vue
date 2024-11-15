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
import {
  GestureRecognizer,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";

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
    };
  },
  mounted() {
    // 组件挂载后创建手势识别器
    this.createGestureRecognizer();
  },
  methods: {
    async createGestureRecognizer() {
      // 创建手势识别器实例
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU",
        },
        runningMode: this.runningMode,
      });
    },
    async toggleWebcam() {
      // 切换摄像头状态
      if (!this.gestureRecognizer) {
        alert("Please wait for gestureRecognizer to load");
        return;
      }

      this.webcamRunning = !this.webcamRunning;

      if (this.webcamRunning) {
        // 启用摄像头
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.$refs.video.srcObject = stream;
        this.$refs.video.addEventListener("loadeddata", this.predictWebcam);
      }
    },
    async predictWebcam() {
      // 进行手势识别
      if (this.runningMode === "IMAGE") {
        this.runningMode = "VIDEO";
        await this.gestureRecognizer.setOptions({ runningMode: "VIDEO" });
      }

      const nowInMs = Date.now();
      if (this.$refs.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.$refs.video.currentTime;
        this.results = this.gestureRecognizer.recognizeForVideo(
          this.$refs.video,
          nowInMs
        );
      }

      const canvasCtx = this.$refs.canvas.getContext("2d");
      const drawingUtils = new DrawingUtils(canvasCtx);

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);

      if (this.results.landmarks) {
        // 绘制手势连接线和关键点
        for (const landmarks of this.results.landmarks) {
          drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
            color: "#00FF00",
            lineWidth: 5,
          });
          drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2,
          });
        }
      }

      canvasCtx.restore();

      const gestureOutput = document.getElementById("gesture_output");
      if (this.results.gestures.length > 0) {
        // 显示手势识别结果
        gestureOutput.style.display = "block";
        gestureOutput.style.width = this.videoWidth;
        const categoryName = this.results.gestures[0][0].categoryName;
        const categoryScore = parseFloat(this.results.gestures[0][0].score * 100).toFixed(
          2
        );
        const handedness = this.results.handednesses[0][0].displayName;
        gestureOutput.innerText = `GestureRecognizer: ${categoryName}\n Confidence: ${categoryScore} %\n Handedness: ${handedness}`;
      } else {
        gestureOutput.style.display = "none";
      }

      if (this.webcamRunning) {
        // 循环调用进行手势识别
        window.requestAnimationFrame(this.predictWebcam);
      }
    },
  },
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
