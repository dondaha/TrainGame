<template>
  <div id="train"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import floorTextureUrl from "../assets/floor.jpeg";
import minecartUrl from "../assets/木板矿车.glb";
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
    camera.position.z = 5;
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

    // 加载地面贴图
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load(floorTextureUrl, (texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(100, 100); // 设置纹理重复
    });

    // 创建一个大平面
    const planeSize = 1000;
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true; // 接收阴影
    scene.add(plane);

    // 加载矿车模型
    const loader = new GLTFLoader();
    let minecart;
    loader.load(minecartUrl, (gltf) => {
      console.log(gltf);
      minecart = gltf.scene.children[0];
      for (let i = 0; i < minecart.children.length; i++) {
        minecart.children[i].castShadow = true; // 投射阴影
      }
      minecart.castShadow = true; // 投射阴影
      minecart.position.set(0, 0, 0);
      scene.add(minecart);
    });

    // 添加从左后方射进来的平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1, 1, -1).normalize();
    directionalLight.castShadow = true; // 光源投射阴影
    scene.add(directionalLight);
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加天空盒背景
    const sky_loader = new THREE.CubeTextureLoader();
    const texture = sky_loader.load([
      posx,
      negx,
      posy,
      negy,
      posz,
      negz,
    ]);
    scene.background = texture;

    // 动画函数
    const animate = () => {
      requestAnimationFrame(animate);

      if (minecart) {
        // 矿车缓慢向前移动
        minecart.position.z -= 0.01;

        // 更新摄像机位置，使其跟随矿车
        camera.position.z = minecart.position.z + 3;
        camera.position.x = minecart.position.x;
        camera.position.y = minecart.position.y + 3;
        // 视线中心的位置设置为矿车前方
        const lookAtPosition = minecart.position.clone();
        lookAtPosition.z -= 5;
        camera.lookAt(lookAtPosition);

        // 更新控制器
        // controls.update();

        // 更新阴影相机的位置和方向，使其跟随矿车
        directionalLight.position.set(
          minecart.position.x - 1,
          minecart.position.y + 1,
          minecart.position.z - 1
        );
        directionalLight.target.position.set(
          minecart.position.x,
          minecart.position.y,
          minecart.position.z
        );
        directionalLight.target.updateMatrixWorld();
      }

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
    
  }
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
