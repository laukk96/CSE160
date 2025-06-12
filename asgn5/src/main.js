import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";

import { GUI } from "three/addons/libs/lil-gui.module.min.js"; // lights doc

// ============= Globals =============
let mixer; // AnimationMixer for glb six model
let animationTable = [];

let modelPath; // used in initialization of models
const clock = new THREE.Clock();

// ============= Loaders =============
const loader = new GLTFLoader();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// ============= scene settings =============
const scene = new THREE.Scene();
const backgroundTexture = cubeTextureLoader.load([
  "resources/textures/nightsky_black_cube.png",
  "resources/textures/nightsky_black_cube.png",
  "resources/textures/nightsky_black_cube.png",
  "resources/textures/nightsky_black_cube.png",
  "resources/textures/nightsky_black_cube.png",
  "resources/textures/nightsky_black_cube.png",
]);
// scene.background = new THREE.Color("rgb(10, 10, 10)");
scene.background = backgroundTexture;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(5, 3, 5);

// ============= canvas & renderer =============
const canvas = document.getElementsByName("canvas")[0];
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});
renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
document.body.appendChild(renderer.domElement);

// ============= control setup =============
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1, 0);

controls.minDistance = 2;
controls.maxDistance = 20;
// controls.maxPolarAngle = Math.PI / 2;

// ============= GUI for lighting =============

// ============= Ambient Light =============
const color = 0xffffff;
const intensity = -0.02;
const ambientlight = new THREE.AmbientLight(color, intensity);
scene.add(ambientlight);

// ============= Directional Light =============
const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
dirLight1.intensity = 0.1;
dirLight1.position.set(1, 2.5, 1);
dirLight1.target.position.set(0, 0, 0);
dirLight1.castShadow = true;
scene.add(dirLight1);

// ============= Point Light — Light Bulb ==============
const pointlight1 = new THREE.PointLight(0xffffff, 1, 100);
pointlight1.intensity = 10;
pointlight1.position.set(1, 2.5, 1);
pointlight1.castShadow = true;
scene.add(pointlight1);

// ============= Sphere: Glowing Lightbulb =============
const lightbulb = new THREE.SphereGeometry(0.1, 32, 32);
const bulbMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const lightbulbMesh = new THREE.Mesh(lightbulb, bulbMaterial);
lightbulbMesh.position.copy(pointlight1.position);
scene.add(lightbulbMesh);

// ============= ground cube =============
const groundTexturePath = "resources/textures/Planks037B_2K.jpg";
const groundwoodTexture = textureLoader.load(groundTexturePath);
const groundSize = 30;
const geometry = new THREE.BoxGeometry(groundSize, 0.1, groundSize);
const material = new THREE.MeshPhongMaterial({
  color: "rgba(255, 255, 255, 1.0)",
  map: groundwoodTexture,
});
const cube = new THREE.Mesh(geometry, material);
cube.position.set(0, 0, 0);
scene.add(cube);

// ============= little nightmares =============
// source: https://sketchfab.com/3d-models/six-little-nightmares-3fcb40b8dd8240d59741cb9df33d5238
// let six;
const sixPath = "resources/models/six_little_nightmares.glb";
loader.load(
  sixPath,
  function (gltf) {
    const model = gltf.scene;
    model.scale.set(1, 1, 1); // Scale it if needed
    model.position.set(0, 0.05, 0); // Position in scene
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: cardboard box =============
const boxPath = "resources/models/cardboard_box.glb";
loader.load(
  boxPath,
  function (gltf) {
    const model = gltf.scene;
    model.scale.set(0.8, 0.8, 0.8);
    model.position.set(-4, 0.9, -2);
    model.rotation.y = 2 * Math.PI * 0.35;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: antique iron safe =============
const ironsafePath = "resources/models/antique_iron_safe.glb";
loader.load(
  ironsafePath,
  function (gltf) {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);
    model.position.set(-1, 0.9, -3);
    model.rotation.y = Math.PI / 6;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: antique globe =============
const antiqueglobePath = "resources/models/antique_globe.glb";
loader.load(
  antiqueglobePath,
  function (gltf) {
    const model = gltf.scene;
    model.scale.set(3, 3, 3);
    model.position.set(0.5, 0.97, -2);
    model.rotation.y = Math.PI / 6;
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: old wall clock =============
const oldwallclockPath = "resources/models/old_wall_clock.glb";
loader.load(
  oldwallclockPath,
  function (gltf) {
    const model = gltf.scene;
    model.scale.set(5, 5, 5);
    model.position.set(-3, -0.1, 1);
    model.rotation.y = 2 * Math.PI * 0.28;
    scene.add(model);

    // console.log(gltf.animations);

    mixer = new THREE.AnimationMixer(model);

    if (gltf.animations && gltf.animations.length > 0) {
      const idleAction = mixer.clipAction(gltf.animations[0]);
      idleAction.play();
      animationTable.push(mixer);
    }
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: soviet chair =============
modelPath = "resources/models/soviet_chair.glb";
loader.load(
  modelPath,
  function (gltf) {
    const model = gltf.scene;
    const modelScale = 3;
    model.scale.set(modelScale, modelScale, modelScale);
    model.rotation.y = Math.PI * -(1.5 / 4);
    model.position.set(-2, 0, -6);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: old chest =============
modelPath = "resources/models/old_chest.glb";
loader.load(
  modelPath,
  function (gltf) {
    const model = gltf.scene;
    const modelScale = 1;
    model.scale.set(modelScale, modelScale, modelScale);
    model.rotation.y = 2 * Math.PI * 0.55;
    model.position.set(0.7, 0, -3.5);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: old wrench =============
modelPath = "resources/models/old_wrench.glb";
loader.load(
  modelPath,
  function (gltf) {
    const model = gltf.scene;
    const modelScale = 0.01;
    model.scale.set(modelScale, modelScale, modelScale);
    model.rotation.y = 2 * Math.PI * 0.8;
    model.position.set(-2, 0.1, 2);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

// ============= model: low_poly_boot =============
modelPath = "resources/models/low_poly_boot.glb";
loader.load(
  modelPath,
  function (gltf) {
    const model = gltf.scene;
    const modelScale = 20.0;
    model.scale.set(modelScale, modelScale, modelScale);
    model.rotation.y = 2 * Math.PI * 1.0;
    model.position.set(-8, 0.1, -4);
    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("An error happened while loading the model:", error);
  }
);

function spawnManyCardboard(maxNum) {
  // ============= model: cardboard box =============
  modelPath = "resources/models/cardboard_box.glb";

  for (let i = 0; i < maxNum; i++) {
    loader.load(
      modelPath,
      function (gltf) {
        const model = gltf.scene;
        const modelScale = 0.2;
        let rx = Math.floor(Math.random() * 8 + 0.5);
        let ry = Math.floor(Math.random() * 8 + 0.5);
        model.scale.set(modelScale, modelScale, modelScale);
        model.position.set(rx, modelScale, ry);
        model.rotation.y = 2 * Math.PI * Math.random();
        scene.add(model);

        // ============= Point Light =============
        let templight = new THREE.PointLight(0xffffbb, 1, 100);
        templight.intensity = 0.2;
        templight.position.copy(model.position);
        templight.position.add(new THREE.Vector3(0, 0.1, 0));
        templight.castShadow = true;
        scene.add(templight);
      },
      undefined,
      function (error) {
        console.error("An error happened while loading the model:", error);
      }
    );
  }
}
spawnManyCardboard(20); // meets 3d object quota

// ============= MAIN animate() =============

function animate() {
  requestAnimationFrame(animate);

  // clock
  const delta = clock.getDelta();

  // update animations
  animationTable.forEach((mixer) => {
    mixer.update(delta);
  });

  controls.update();
  renderer.render(scene, camera);
}

animate();
