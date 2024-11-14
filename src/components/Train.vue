<template>
  <div id="train"></div>
</template>

<script>
import * as THREE from 'three';
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

    // 加载地面贴图
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load(floorTextureUrl);

    // 创建多个平面以覆盖更大的区域
    const planeSize = 10;
    const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });

    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(x * planeSize, 0, z * planeSize);
        plane.receiveShadow = true; // 接收阴影
        scene.add(plane);
      }
    }

    // 创建一个立方体
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true; // 投射阴影
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
      camera.position.y = cube.position.y + 2;
      camera.lookAt(cube.position);

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
  height: 100vh;
  overflow: hidden;
}
</style>