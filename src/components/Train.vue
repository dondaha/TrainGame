<template>
  <div id="train"></div>
</template>

<style scoped>
#train {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import minecartUrl from "../assets/木板矿车.glb";
import trainUrl from "../assets/ImageToStl.com_forest_house.glb";
import houseUrl from "../assets/forest_house.glb";
import backgroundUrl from "../assets/img/background.jpg";

export default {
  data() {
    return {
      mixer: null,
      animationActions: [],
      activeAction: null,
      ready: false,
      numberMeshesA: [],
      numberMeshesB: [],
      fallingNumberMesh: null,
      carriageNumberMesh: null,
      enableControls: false
    };
  },
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

    camera.position.set(-0.7275645257505676, 1.3591467822156458, 4.8831706515515805);
    camera.rotation.set(0.05135489133277585, -0.07308856817033685, 0.0037533971926168165);

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // 启用阴影
    this.$el.appendChild(renderer.domElement);

    // 初始化控制器
    let controls;
    if (this.enableControls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; // 启用阻尼效果
      controls.dampingFactor = 0.25;
      controls.enableZoom = true; // 启用缩放
      controls.enablePan = true; // 禁用平移
    }

    // 加载可爱木屋模型
    var house_loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/TrainGame/draco/");
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.preload();
    house_loader.setDRACOLoader(dracoLoader);
    house_loader.load(houseUrl, (gltf) => {
      const root = gltf.scene;
      const house = gltf.scene;
      for (let i = 0; i < house.children.length; i++) {
        house.children[i].castShadow = true; // 投射阴影
      }
      house.position.set(0, 0, 0);
      house.scale.set(1, 1, 1);
      scene.add(house);
    });

    // 添加图片背景
    const map = new THREE.TextureLoader().load( backgroundUrl );
    const material = new THREE.SpriteMaterial( { map: map } );
    const sprite = new THREE.Sprite( material );
    // 设置位置
    sprite.position.set( 0, 8, -5 );
    sprite.scale.set( 30, 30, 30 );
    scene.add( sprite );

    // 加载可爱小火车模型
    const loader = new GLTFLoader();
    let minecart1;
    const clock = new THREE.Clock();
    loader.load(trainUrl, (gltf) => {
      const root = gltf.scene;
      this.mixer = new THREE.AnimationMixer(root);
      this.animationActions[0] = this.mixer.clipAction(gltf.animations[0]);
      this.animationActions[1] = this.mixer.clipAction(gltf.animations[1]);
      this.animationActions[0].loop = THREE.LoopOnce; // 仅播放一次
      this.animationActions[1].loop = THREE.LoopOnce;
      this.animationActions[0].clampWhenFinished = true; // 动画结束后保持最后一帧
      this.animationActions[1].clampWhenFinished = true;
      // 加载小火车模型
      minecart1 = gltf.scene.children[0];
      for (let i = 0; i < minecart1.children.length; i++) {
        minecart1.children[i].castShadow = true; // 投射阴影
      }
      minecart1.castShadow = true; // 投射阴影
      minecart1.position.set(0, 0, 0);
      scene.add(minecart1);
    });

    // 加载数字模型
    const number_group_a = new THREE.Group();
    const number_group_b = new THREE.Group();
    const font_loader = new FontLoader();
    font_loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const font_setting = {
        font: font,
        size: 80,
        height: 1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 3,
        bevelSize: 2,
        bevelSegments: 5
      };

      for (let i = 0; i <= 9; i++) {
        const geometry_a = new TextGeometry(i.toString(), font_setting);
        geometry_a.computeBoundingBox();
        const materials_a = [
          new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
          new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
        ];
        const textMesh_a = new THREE.Mesh(geometry_a, materials_a);
        textMesh_a.scale.set(0.003, 0.003, 0.003);
        number_group_a.add(textMesh_a);
        this.numberMeshesA.push(textMesh_a);

        const geometry_b = new TextGeometry(i.toString(), font_setting);
        geometry_b.computeBoundingBox();
        const materials_b = [
          new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true }), // front
          new THREE.MeshPhongMaterial({ color: 0xffffff }) // side
        ];
        const textMesh_b = new THREE.Mesh(geometry_b, materials_b);
        textMesh_b.scale.set(0.003, 0.003, 0.003);
        number_group_b.add(textMesh_b);
        this.numberMeshesB.push(textMesh_b);
      }

      scene.add(number_group_a);
      scene.add(number_group_b);
    });

    // 光线管理
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-5, 5, -5).normalize();
    directionalLight.castShadow = true; // 光源投射阴影
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加背景
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.background = new THREE.Color(0xf4ecdc);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 动画函数
    const animate = () => {
      // 打印摄像机当前的位置和朝向
      console.log(camera.position, camera.rotation);
      const delta = clock.getDelta();
      if (this.mixer) {
        this.mixer.update(delta);
      }
      if (this.fallingNumberMesh) {
        this.fallingNumberMesh.position.y -= delta * 0.5; // 控制掉落速度
        if (this.fallingNumberMesh.position.y < 0.6) {
          this.fallingNumberMesh.position.y = 0.6; // 限制掉落到地面
        }
      }
      if (this.carriageNumberMesh && minecart1) {
        const minecartPosition = minecart1.position;
        this.carriageNumberMesh.position.set(minecartPosition.x, minecartPosition.y + 1, minecartPosition.z);
      }
      requestAnimationFrame(animate);
      if (this.enableControls){
        controls.update();
      }
      renderer.render(scene, camera);
    };

    animate();

    // 处理窗口大小变化
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
    this.ready = true;
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
    playAnimation(index) {
      if (this.activeAction) {
        this.activeAction.stop();
      }
      this.activeAction = this.animationActions[index];
      this.activeAction.play();
    },
    setCarriageNumber(number) {
      if (this.carriageNumberMesh) {
        this.carriageNumberMesh.position.set(0, 0, 0); // 重置位置
      }
      this.carriageNumberMesh = this.numberMeshesA[number];
      if (this.minecart) {
        const minecartPosition = this.minecart.position;
        this.carriageNumberMesh.position.set(minecartPosition.x, minecartPosition.y + 1, minecartPosition.z); // 放置在小火车上方
      }
    },
    setFallingNumber(number) {
      if (this.fallingNumberMesh) {
        this.fallingNumberMesh.position.set(0, 0, 0); // 重置位置
      }
      this.fallingNumberMesh = this.numberMeshesB[number];
      this.fallingNumberMesh.position.set(0, 2, 3); // 从天上开始掉落
    }
  }
};
</script>