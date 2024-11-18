<template>
  <div id="train"></div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import floorTextureUrl from "../assets/floor.jpeg";
import minecartUrl from "../assets/木板矿车.glb";
import trainUrl from "../assets/ImageToStl.com_forest_house.glb";
import houseUrl from "../assets/forest_house.glb";
import tokyoUrl from "../assets/LittlestTokyo.glb";
import posx from "../assets/img/posx.jpg";
import negx from "../assets/img/negx.jpg";
import posy from "../assets/img/posy.jpg";
import negy from "../assets/img/negy.jpg";
import posz from "../assets/img/posz.jpg";
import negz from "../assets/img/negz.jpg";

export default {
  mounted() {
    // 初始化场景
    const scene = new THREE.Scene();

    // 初始化摄像机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.x = -1;
    camera.position.z = 7;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // 启用阴影
    this.$el.appendChild(renderer.domElement);

    // 初始化控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果
    controls.dampingFactor = 0.25;
    controls.enableZoom = true; // 启用缩放
    controls.enablePan = true; // 禁用平移

    // 加载可爱木屋模型
    var house_loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    // 设置解压路径，这个文件直接放在项目的public目录下面即可，后面会截图指明gltf目录所在位置
    dracoLoader.setDecoderPath("/TrainGame/draco/");
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.preload();
    house_loader.setDRACOLoader(dracoLoader);
    house_loader.load(houseUrl, (gltf) => {
      const root = gltf.scene;
      // console.log(this.dumpObject(root).join("\n"));
      // console.log(gltf);
      const house = gltf.scene;
      // 循环让每个子对象都投射阴影
      for (let i = 0; i < house.children.length; i++) {
        house.children[i].castShadow = true; // 投射阴影
      }
      house.position.set(0, 0, 0);
      house.scale.set(1, 1, 1);
      scene.add(house);
    });

    // 加载矿车模型
    const loader = new GLTFLoader();
    let minecart1;
    let minecart2;
    let mixer;
    const clock = new THREE.Clock();
    loader.load(trainUrl, (gltf) => {
      const root = gltf.scene;
      mixer = new THREE.AnimationMixer(root);
      mixer.clipAction(gltf.animations[0]).play();
      console.log(this.dumpObject(root).join("\n"));
      console.log(gltf);
      minecart1 = gltf.scene.children[0];
      // console.log(minecart1);
      for (let i = 0; i < minecart1.children.length; i++) {
        minecart1.children[i].castShadow = true; // 投射阴影
      }
      minecart1.castShadow = true; // 投射阴影
      minecart1.position.set(0, 0, 0);
      scene.add(minecart1);
    });

    // 光线管理
    // 添加从左后方射进来的平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-5, 5, -5).normalize();
    directionalLight.castShadow = true; // 光源投射阴影
    // scene.add(directionalLight);
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加背景
    const sky_loader = new THREE.CubeTextureLoader();
    const texture = sky_loader.load([posx, negx, posy, negy, posz, negz]);
    // scene.background = texture;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.background = new THREE.Color(0xf4ecdc);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 动画函数
    const animate = () => {
      const delta = clock.getDelta();
      if (mixer){
        mixer.update( delta );
      }
      requestAnimationFrame(animate);
      controls.update();
      // 渲染场景
      renderer.render(scene, camera);
    };

    animate();

    // 处理窗口大小变化
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  },
  methods: {
    dumpObject(obj, lines = [], isLast = true, prefix = "") {
      const localPrefix = isLast ? "└─" : "├─";
      lines.push(
        `${prefix}${prefix ? localPrefix : ""}${obj.name || "*no-name*"} [${obj.type}]`
      );
      const newPrefix = prefix + (isLast ? "  " : "│ ");
      const lastNdx = obj.children.length - 1;
      obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        this.dumpObject(child, lines, isLast, newPrefix);
      });
      return lines;
    },
  },
};
</script>

<style scoped>
#train {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
