import { UI } from "../common/ui.js";
import { Plotter } from "../common/plotter.js";

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.126.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.126.0/examples/jsm/controls/OrbitControls.js";

// ----------------------
// Renderer
// ----------------------
class DroneRenderer {
  constructor() {
    this.container = document.getElementById("simulation-canvas");

    if (!this.container) {
      throw new Error("Simulation canvas not found");
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdddddd);

    // WebGL renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 35, 0);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Lights
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(20, 50, 20);
    light.target.position.set(0, 0, 0);

    this.scene.add(light);
    this.scene.add(light.target);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.15));

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    const d = 50;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 200;
    light.shadow.camera.updateProjectionMatrix();

    // Fog
    this.scene.fog = new THREE.Fog(0xdddddd, 1, 230);

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  updateControls() {
    this.controls.update();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setDrones(drones) {
    this.drones = drones;
  }

  syncDrones(logic, dt) {
    logic.drones.forEach((drone, i) => {
      const mesh = this.drones[i].mesh;

      mesh.position.copy(drone.position);

      this.drones[i].rotors.forEach((rotor) => {
        rotor.rotation.y += 30 * dt;
      });
    });
  }
}

// ----------------------
// Assets loader
// ----------------------
class DroneAssets {
  constructor(scene) {
    this.scene = scene;

    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();

    this.drones = [];
    this.droneLoadId = 0;
  }

  loadEnvironment() {
    this.loadSky();
    this.loadField();
  }

  loadSky() {
    const skyTexture = this.textureLoader.load("/assets/simulations/swarm/assets/skydome.jpg");

    const skyGeometry = new THREE.SphereGeometry(500, 64, 32);

    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
    });

    const skydome = new THREE.Mesh(skyGeometry, skyMaterial);

    skydome.rotation.x = -Math.PI / 3;
    skydome.rotation.z = -Math.PI / 3;

    this.scene.add(skydome);

    // MeshBasicMaterial does not need scene fog.
    skyMaterial.fog = false;
  }

  loadField() {
    this.loader.load("/assets/simulations/swarm/assets/field.glb", (gltf) => {
      const field = gltf.scene;

      field.scale.set(1, 1, 1);
      field.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(field);
      const center = box.getCenter(new THREE.Vector3());

      field.position.sub(center);
      field.position.set(field.position.x + 55, field.position.y, field.position.z + 90);

      field.rotation.set(-0.53, 0, 0.37);

      field.traverse((child) => {
        if (!child.isMesh) return;

        const oldMat = child.material;

        child.material = new THREE.MeshStandardMaterial({
          map: oldMat.map || null,
          normalMap: oldMat.normalMap || null,
          roughness: 0.9,
          metalness: 0.0,
        });

        child.receiveShadow = true;
      });

      this.scene.add(field);
    });
  }

  loadDrones(n, positions, height = 16, onLoad) {
    const loadId = ++this.droneLoadId;

    this.loader.load("/assets/simulations/swarm/assets/parrot_camo_drone.glb", (gltf) => {
      if (loadId !== this.droneLoadId) {
        return;
      }

      const baseDrone = gltf.scene;
      baseDrone.scale.set(0.06, 0.06, 0.06);
      baseDrone.rotation.z = Math.PI;

      const drones = [];

      for (let i = 0; i < n; i++) {
        const drone = baseDrone.clone(true);

        drone.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
          }
        });

        const position = positions[i];

        drone.position.set(position.x, height, position.z);

        const rotors = [];

        drone.traverse((child) => {
          if (child.isObject3D && child.name.toLowerCase().includes("motor_props")) {
            rotors.push(child);
          }
        });

        this.scene.add(drone);

        drones.push({
          mesh: drone,
          rotors,
        });
      }

      this.drones = drones;
      onLoad(drones);
    });
  }

  clearDrones() {
    if (!this.drones) return;

    this.droneLoadId++;

    this.drones.forEach(({ mesh }) => {
      this.scene.remove(mesh);
    });

    this.drones = [];
  }
}

// ----------------------
// Simulation logic
// ----------------------
class DroneLogic {
  constructor() {
    this.N = 0;
    this.drones = [];

    this.distanceMatrix = [];
    this.controlVelocity = [];

    this.maxDriftVelocity = 1.0;
    this.driftNoise = 0.3;
    this.tau = 0.1;

    this.twrOffsets = [];
    this.lastFiredCycle = [];
    this.simTime = 0;
    this.dtTWR = 0.5;

    this.bearingError = 0;

    this.swarmFlag = true;
  }

  initialize(n) {
    this.N = n;

    const positions = this.computeDronePositions(n);

    this.distanceMatrix = this.computeDroneMatrix(positions);

    this.controlVelocity = Array.from({ length: n }, () => new THREE.Vector3());

    this.twrOffsets = Array.from({ length: n }, (_, i) => (i / n) * this.dtTWR);

    this.lastFiredCycle = Array(n).fill(-1);
    this.simTime = 0;

    this.drones = positions.map((position) => {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * this.maxDriftVelocity;

      const driftVelocity = new THREE.Vector3(Math.cos(angle) * speed, 0, Math.sin(angle) * speed);

      return {
        position: new THREE.Vector3(position.x, 16, position.z),
        velocity: driftVelocity.clone(),
        driftVelocity,
      };
    });

    if (this.swarmFlag) {
      for (let i = 0; i < n; i++) {
        this.swarmDynamics(i);
      }
    }

    return positions;
  }

  update(dt) {
    this.simTime += dt;

    const tModulo = this.simTime % this.dtTWR;
    const currentCycle = Math.floor(this.simTime / this.dtTWR);

    this.drones.forEach((drone, i) => {
      // Natural drift + stochastic disturbance
      const noiseAngle = Math.random() * 2 * Math.PI;
      const noiseSpeed = Math.random() * this.driftNoise;

      const noiseVelocity = new THREE.Vector3(Math.cos(noiseAngle) * noiseSpeed, 0, Math.sin(noiseAngle) * noiseSpeed);

      const targetVelocity = drone.driftVelocity.clone().add(noiseVelocity);

      // Optional formation-control contribution
      if (this.swarmFlag && tModulo >= this.twrOffsets[i] && this.lastFiredCycle[i] < currentCycle) {
        this.swarmDynamics(i);
        this.lastFiredCycle[i] = currentCycle;
      }

      if (this.swarmFlag) {
        targetVelocity.add(this.controlVelocity[i]);
      }

      // OU relaxation
      drone.velocity.addScaledVector(targetVelocity.sub(drone.velocity), dt / this.tau);

      // Position integration
      drone.position.addScaledVector(drone.velocity, dt);
    });
  }

  swarmDynamics(i) {
    const { distances, bearings } = this.twrBroadcast(i);

    const force = new THREE.Vector3();

    for (let j = 0; j < this.N; j++) {
      if (j === i) continue;

      const error = distances[j] - this.distanceMatrix[i][j];

      const theta = bearings[j];

      force.x += error * Math.cos(theta);
      force.z += error * Math.sin(theta);
    }

    const K = 0.3;

    this.controlVelocity[i].x = K * force.x;
    this.controlVelocity[i].z = K * force.z;
  }

  twrBroadcast(index) {
    const origin = this.drones[index].position;

    const distances = new Array(this.N);
    const bearings = new Array(this.N);

    for (let j = 0; j < this.N; j++) {
      if (j === index) {
        distances[j] = 0;
        bearings[j] = 0;
        continue;
      }

      const other = this.drones[j].position;

      const dx = other.x - origin.x;
      const dz = other.z - origin.z;

      const distance = Math.sqrt(dx * dx + dz * dz);
      let bearing = Math.atan2(dz, dx);

      bearing += (Math.random() * 2 - 1) * THREE.MathUtils.degToRad(this.bearingError);

      distances[j] = distance;
      bearings[j] = bearing;
    }

    return { distances, bearings };
  }

  computeDronePositions(n) {
    if (n < 3 || n > 8) {
      throw new Error("Number of drones must be between 3 and 8");
    }

    const positions = [];

    if (n === 3) {
      const a = 5;

      positions.push({ x: 0, z: 0 });
      positions.push({ x: a, z: 0 });
      positions.push({
        x: a / 2,
        z: (Math.sqrt(3) / 2) * a,
      });
    } else {
      const nCircle = n - 1;
      const radius = 5 / (2 * Math.sin(Math.PI / nCircle));

      positions.push({ x: 0, z: 0 });

      for (let i = 0; i < nCircle; i++) {
        const angle = (i / nCircle) * 2 * Math.PI;

        positions.push({
          x: radius * Math.cos(angle),
          z: radius * Math.sin(angle),
        });
      }
    }

    return positions;
  }

  computeDroneMatrix(positions) {
    const n = positions.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = positions[i].x - positions[j].x;
        const dz = positions[i].z - positions[j].z;

        const distance = Math.sqrt(dx * dx + dz * dz);

        matrix[i][j] = distance;
        matrix[j][i] = distance;
      }
    }

    return matrix;
  }
}

// ----------------------
// Plotter
// ----------------------
class DronePlotter {
  constructor(plotter) {
    this.plotter = plotter;

    this.timeHistory = [];
    this.offsetHistory = [];

    this.lastPlotTime = 0;
    this.plotInterval = 100;

    this.maxHistory = 2000;
  }

  render(model) {
    if (performance.now() - this.lastPlotTime < this.plotInterval) {
      return;
    }

    this.lastPlotTime = performance.now();

    const offset = this.computeAverageOffset(model);

    this.timeHistory.push(model.simTime);
    this.offsetHistory.push(offset);

    if (this.timeHistory.length > this.maxHistory) {
      this.timeHistory.shift();
      this.offsetHistory.shift();
    }

    this.plotter.draw(
      [
        {
          x: [...this.timeHistory],
          y: [...this.offsetHistory],
          mode: "lines",
          name: "Average distance offset",
          line: {
            width: 2,
            color: "#1f77b4",
          },
        },
      ],
      {
        height: this.plotter.height,
        margin: this.plotter.margin,

        annotations: [
          {
            text: "Avg distance error",
            x: 0.5,
            y: 1.2,
            xref: "paper",
            yref: "paper",
            showarrow: false,
            font: { size: 14 },
          },
        ],

        xaxis: {
          title: {
            text: "time",
            font: {
              size: 16,
            },
          },
          zeroline: false,
          showgrid: true,
        },

        yaxis: {
          title: {
            text: "⟨ε⟩",
            font: {
              size: 16,
            },
          },
          zeroline: true,
          showgrid: true,
        },

        showlegend: false,
      }
    );
  }

  computeAverageOffset(model) {
    const n = model.N;

    if (n < 2) {
      return 0;
    }

    let totalOffset = 0;
    let pairCount = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const droneI = model.drones[i].position;
        const droneJ = model.drones[j].position;

        const dx = droneI.x - droneJ.x;
        const dz = droneI.z - droneJ.z;

        const actualDistance = Math.sqrt(dx * dx + dz * dz);
        const desiredDistance = model.distanceMatrix[i][j];

        totalOffset += actualDistance - desiredDistance;
        pairCount++;
      }
    }

    return totalOffset / pairCount;
  }

  reset() {
    this.timeHistory = [];
    this.offsetHistory = [];
    this.lastPlotTime = 0;
  }
}

// ----------------------
// UI
// ----------------------
class DroneUI {
  constructor(ui, logic) {
    this.ui = ui;
    this.logic = logic;
  }

  render({ onSwarmChange, onDroneCountChange, onTWRChange, onVMaxChange, onBearingErrorChange }) {
    const swarmToggle = this.ui.createCheckbox({
      label: "Swarm logic",
      checked: true,
      onChange: onSwarmChange,
    });

    const droneCount = this.ui.createValueControl({
      label: "Drones",
      value: this.logic.N,
      min: 3,
      max: 8,
      onChange: onDroneCountChange,
    });

    const twrSlider = this.ui.createSlider({
      label: "TWR interval (s)",
      min: 0.1,
      max: 2,
      step: 0.1,
      value: this.logic.dtTWR,
      onInput: onTWRChange,
      format: (value) => value.toFixed(2),
    });

    const vmaxSlider = this.ui.createSlider({
      label: "Maximum velocity (m/s)",
      min: 0.1,
      max: 3,
      step: 0.1,
      value: this.logic.maxDriftVelocity,
      onInput: onVMaxChange,
      format: (value) => value.toFixed(1),
    });

    const bearingErrorSlider = this.ui.createSlider({
      label: "Bearing error (°)",
      min: 0,
      max: 20,
      step: 1,
      value: this.logic.bearingError,
      onInput: onBearingErrorChange,
    });

    this.ui.appendControl(swarmToggle);
    this.ui.appendControl(droneCount);
    this.ui.appendControl(twrSlider);
    this.ui.appendControl(vmaxSlider);
    this.ui.appendControl(bearingErrorSlider);
  }
}

// ----------------------
// Entry point
// ----------------------
const renderer = new DroneRenderer();
const assets = new DroneAssets(renderer.scene);
const logic = new DroneLogic();
const positions = logic.initialize(4);

const ui = new DroneUI(new UI(), logic);
const plotter = new DronePlotter(new Plotter());

ui.render({
  onSwarmChange: (enabled) => {
    logic.swarmFlag = enabled;
  },

  onDroneCountChange: (count) => {
    assets.clearDrones();
    plotter.reset();

    const positions = logic.initialize(count);

    assets.loadDrones(count, positions, 16, (drones) => {
      renderer.setDrones(drones);
    });
  },

  onTWRChange: (value) => {
    logic.dtTWR = value;
    logic.twrOffsets = Array.from({ length: logic.N }, (_, i) => (i / logic.N) * logic.dtTWR);
  },

  onVMaxChange: (value) => {
    assets.clearDrones();
    plotter.reset();

    logic.maxDriftVelocity = value;
    const positions = logic.initialize(logic.N);

    assets.loadDrones(logic.N, positions, 16, (drones) => {
      renderer.setDrones(drones);
    });
  },

  onBearingErrorChange: (value) => {
    logic.bearingError = value;
  },
});

assets.loadEnvironment();
assets.loadDrones(logic.N, positions, 16, (drones) => {
  renderer.setDrones(drones);
  animate();
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = clock.getDelta();
  const playFlag = true;

  if (playFlag) {
    logic.update(dt);

    renderer.syncDrones(logic, dt);
    plotter.render(logic);
  }

  renderer.updateControls();
  renderer.render();
}
