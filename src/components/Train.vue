<template>
  <div id="train"></div>
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import floorTextureUrl from '../assets/floor.jpeg';

export default {
  mounted() {
    // 初始化场景
    const scene = new THREE.Scene();

    // 初始化摄像机
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
    controls.enablePan = false; // 禁用平移

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

    // 创建一个立方体
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true; // 投射阴影
    cube.position.set(0, 1, 0)
    scene.add(cube);

    // 添加从左后方射进来的平行光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1, 1, -1).normalize();
    directionalLight.castShadow = true; // 光源投射阴影
    scene.add(directionalLight);

    // 动画函数
    const animate = () => {
      requestAnimationFrame(animate);

      // 立方体缓慢向前移动
      cube.position.z -= 0.01;

      // 更新摄像机位置，使其跟随立方体
      camera.position.z = cube.position.z + 5;
      camera.position.x = cube.position.x;
      camera.position.y = cube.position.y + 2;
      camera.lookAt(cube.position);

      // 更新控制器
      // controls.update();

      // 更新阴影相机的位置和方向，使其跟随立方体
      directionalLight.position.set(cube.position.x - 1, cube.position.y + 1, cube.position.z - 1);
      directionalLight.target.position.set(cube.position.x, cube.position.y, cube.position.z);
      directionalLight.target.updateMatrixWorld();

      // 渲染场景
      renderer.render(scene, camera);
    };

    animate();

    // 处理窗口大小变化
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
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