// ------------------------------------------
// ------------- SCENE ----------------------
// ------------------------------------------

// Asset loader
const loader = new THREE.GLTFLoader();

// Attach to container
const container = document.getElementById("three-container");
const width = container.clientWidth;
const height = container.clientHeight;

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
container.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputEncoding = THREE.sRGBEncoding;

// Create and position the camera
const camera = new THREE.PerspectiveCamera(
  60, // vertical FOV in degrees
  width / height, // aspect ratio
  0.1, // near clipping plane
  1000 // far clipping plane
);
camera.position.set(0, 35, 0);

// Camera control with mouse
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Resize handling
window.addEventListener("resize", () => {
  const width_new = container.clientWidth;
  const height_new = container.clientHeight;

  camera.aspect = width_new / height_new;
  camera.updateProjectionMatrix();
  renderer.setSize(width_new, height_new);
});

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(20, 50, 20);
light.target.position.set(0, 0, 0);
scene.add(light);
scene.add(light.target);
scene.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.15));

// Shadow settings
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
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

// Skydome
const textureLoader = new THREE.TextureLoader();
const skyTexture = textureLoader.load("/assets/js/simulations/swarm/assets/skydome.jpg");
const skyGeometry = new THREE.SphereGeometry(500, 64, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
});
const skydome = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skydome);
skydome.rotation.x = -Math.PI / 3;
skydome.rotation.z = -Math.PI / 3;

// Ground
loader.load("/assets/js/simulations/swarm/assets/field.glb", (gltf) => {
  const field = gltf.scene;
  scene.add(field);
  field.scale.set(1, 1, 1);
  field.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(field);
  const center = box.getCenter(new THREE.Vector3());

  // Move geometry relative to its own origin
  field.position.sub(center);

  // Now explicitly place it at world origin
  field.position.set(field.position.x + 55, field.position.y, field.position.z + 90);

  field.rotation.set(-0.53, 0, 0.37);

  field.traverse((child) => {
    if (child.isMesh) {
      const oldMat = child.material;

      child.material = new THREE.MeshStandardMaterial({
        map: oldMat.map || null,
        normalMap: oldMat.normalMap || null,
        roughness: 0.9,
        metalness: 0.0,
      });

      child.receiveShadow = true;
    }
  });
});

// Ambient fog
scene.fog = new THREE.Fog(0xdddddd, 1, 230);
skyMaterial.fog = false;

// ------------------------------------------
// -------------  GUI  ----------------------
// ------------------------------------------

// Drone parameters
let N;
let drones;
let distanceMatrix;

let vTarget;
let vDrone;

let baseVMax = 4.0; // base velocity [m/s]

// Two way ranging parameters
let twrOffsets;
let lastFiredCycle;
let simTime = 0;
let dtTWR = 0.5; // [s]

// global flag
let swarmFlag = true;

// link checkbox
const swarmToggle = document.getElementById("swarm-toggle");
swarmToggle.addEventListener("change", () => {
  swarmFlag = swarmToggle.checked;
});

let playFlag = true; // global play/pause flag
const playpauseButton = document.getElementById("playpause-button");
const icon = playpauseButton.querySelector("i");

// initialize
playpauseButton.classList.remove("paused");
icon.classList.add("fa-play");
icon.classList.remove("fa-pause");

playpauseButton.addEventListener("click", () => {
  playFlag = !playFlag;

  if (playFlag) {
    // playing → show play
    playpauseButton.classList.remove("paused");
    icon.classList.add("fa-play");
    icon.classList.remove("fa-pause");
  } else {
    // paused → show pause
    playpauseButton.classList.add("paused");
    icon.classList.add("fa-pause");
    icon.classList.remove("fa-play");
  }
});

const droneCountLabel = document.getElementById("drone-count");
const btnPlus = document.getElementById("btn-plus");
const btnMinus = document.getElementById("btn-minus");

function updateDroneLabel() {
  droneCountLabel.textContent = N;
}

btnPlus.addEventListener("click", () => {
  if (N < 8) {
    initSwarm(N + 1);
    updateDroneLabel();
  }
});

btnMinus.addEventListener("click", () => {
  if (N > 3) {
    initSwarm(N - 1);
    updateDroneLabel();
  }
});

const sliderTWR = document.getElementById("slider-twr");
const twrLabel = document.getElementById("twr-value");

const sliderVMax = document.getElementById("slider-vmax");
const vmaxLabel = document.getElementById("vmax-value");

sliderTWR.addEventListener("input", () => {
  dtTWR = parseFloat(sliderTWR.value);
  twrLabel.textContent = dtTWR.toFixed(2);

  // recompute broadcast scheduling
  twrOffsets = Array.from({ length: N }, (_, i) => (i / N) * dtTWR);
});

sliderVMax.addEventListener("input", () => {
  baseVMax = parseFloat(sliderVMax.value);
  vmaxLabel.textContent = baseVMax.toFixed(1);
});

// Global variable for bearing error in degrees
let bearingErrorSlider = document.getElementById("bearing-error-slider");
let bearingErrorValue = document.getElementById("bearing-error-value");

// Update label on change
bearingErrorSlider.addEventListener("input", () => {
  bearingErrorValue.textContent = bearingErrorSlider.value;
});

// ------------------------------------------
// ------------- LOGIC ----------------------
// ------------------------------------------

// Initialize N drones
function initSwarm(newN) {
  N = newN;

  // remove old drones from scene
  if (drones) {
    drones.forEach((d) => scene.remove(d.mesh));
  }

  // create drones and formation geometry
  const result = loadDrones(N, 16);
  drones = result.drones;
  distanceMatrix = result.distanceMatrix;

  // velocity buffers
  vTarget = Array.from({ length: N }, () => new THREE.Vector3());
  vDrone = Array.from({ length: N }, () => new THREE.Vector3());

  // TWR scheduling
  twrOffsets = Array.from({ length: N }, (_, i) => (i / N) * dtTWR);
  lastFiredCycle = Array(N).fill(-1);
}

// Load drones
function loadDrones(n_drones, height = 16) {
  const drones = [];
  const positions = computeDronePositions(n_drones);
  const distanceMatrix = computeDroneMatrix(positions);

  loader.load("/assets/js/simulations/swarm/assets/parrot_camo_drone.glb", (gltf) => {
    const baseDrone = gltf.scene;
    baseDrone.scale.set(0.06, 0.06, 0.06);
    baseDrone.rotation.z = Math.PI;

    for (let i = 0; i < n_drones; i++) {
      const drone = baseDrone.clone(true);

      // set shadows
      drone.traverse((child) => {
        if (child.isMesh) child.castShadow = true;
      });

      // position drone
      const p = positions[i];
      drone.position.set(p.x, height, p.z);

      // find rotor groups
      const rotors = [];
      drone.traverse((child) => {
        if (child.isObject3D && child.name.toLowerCase().includes("motor_props")) {
          rotors.push(child);
        }
      });

      scene.add(drone);
      drones.push({
        mesh: drone,
        rotors,
        velocity: new THREE.Vector3(0, 0, 0),
      });
    }
  });

  return { drones, distanceMatrix };
}

// Drone positions
function computeDronePositions(n_drones) {
  if (n_drones < 3 || n_drones > 8) {
    throw new Error("Number of drones must be between 3 and 8");
  }

  const positions = [];

  if (n_drones === 3) {
    // equilateral triangle, side = 5
    const a = 5;
    positions.push({ x: 0, z: 0 }); // first drone at origin
    positions.push({ x: a, z: 0 });
    positions.push({ x: a / 2, z: (Math.sqrt(3) / 2) * a });
  } else {
    // one in center, rest evenly spaced on circle
    const n_circle = n_drones - 1;
    const radius = 5 / (2 * Math.sin(Math.PI / n_circle));

    // center
    positions.push({ x: 0, z: 0 });

    // circle
    for (let i = 0; i < n_circle; i++) {
      const angle = (i / n_circle) * 2 * Math.PI;
      positions.push({
        x: radius * Math.cos(angle),
        z: radius * Math.sin(angle),
      });
    }
  }

  return positions;
}

// Compute the distance matrix given drone positions
function computeDroneMatrix(positions) {
  const n = positions.length;
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dx = positions[i].x - positions[j].x;
      const dz = positions[i].z - positions[j].z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      matrix[i][j] = dist;
      matrix[j][i] = dist; // symmetric
    }
  }

  return matrix;
}

// Update drone position - base case
function updateDrones(dt) {
  const baseTau = 0.15; // base memory [s]

  drones.forEach((d) => {
    // slightly jitter per-drone parameters
    const tau = baseTau * (0.7 + 0.6 * Math.random()); // ±30% variation
    const vMax = baseVMax * (0.7 + 0.6 * Math.random());

    // random target velocity
    const angle = Math.random() * 2 * Math.PI;
    const speed = (Math.random() * 2 - 1) * vMax;

    const vRand = new THREE.Vector3(Math.cos(angle) * speed, 0, Math.sin(angle) * speed);

    // velocity relaxation
    d.velocity.addScaledVector(vRand.sub(d.velocity), dt / tau);

    // integrate position
    d.mesh.position.addScaledVector(d.velocity, dt);

    // spin rotors
    d.rotors.forEach((r) => {
      r.rotation.y += 30 * dt;
    });
  });
}

// Update swarm position according to timers
function updateSwarm(simTime, dt) {
  const tau = 0.2; // relaxation time [s]

  const tModulo = simTime % dtTWR;
  const currentCycle = Math.floor(simTime / dtTWR);

  // Check if each drone is due to broadcast
  drones.forEach((d, i) => {
    if (tModulo >= twrOffsets[i] && lastFiredCycle[i] < currentCycle) {
      swarmDynamics(i);
      lastFiredCycle[i] = currentCycle;
    }

    // velocity relaxation
    vDrone[i].addScaledVector(vTarget[i].clone().sub(vDrone[i]), dt / tau);
    // damp velocity
    vDrone[i].multiplyScalar(0.9);
    // integrate position
    d.mesh.position.addScaledVector(vDrone[i], dt);
  });
}

// Two-way ranging broadcast. Return current distances and bearings vectors.
function TWRbroadcast(index) {
  const d0 = drones[index].mesh.position;
  const distances = new Array(N);
  const bearings = new Array(N);

  for (let j = 0; j < N; j++) {
    if (j === index) {
      distances[j] = 0;
      bearings[j] = 0;
      continue;
    }

    const dj = drones[j].mesh.position;
    const dx = dj.x - d0.x;
    const dz = dj.z - d0.z;

    const r = Math.sqrt(dx * dx + dz * dz); // 2D distance in XZ plane
    distances[j] = r;

    let theta = Math.atan2(dz, dx);

    // Inject bearing error based on slider
    const errorDeg = parseFloat(bearingErrorSlider.value);
    const errorRad = THREE.MathUtils.degToRad(errorDeg);
    theta += (Math.random() * 2 - 1) * errorRad; // ±error uniformly

    bearings[j] = theta;
  }

  return { distances, bearings };
}

// Swarm update logic
function swarmDynamics(i) {
  const { distances, bearings } = TWRbroadcast(i);

  const force = new THREE.Vector3();

  for (let j = 0; j < N; j++) {
    if (j === i) continue;

    const r = distances[j];
    const d = distanceMatrix[i][j];
    const theta = bearings[j];

    const error = r - d;

    // spring-like force
    force.x += error * Math.cos(theta);
    force.z += error * Math.sin(theta);
  }

  const K = 0.3;

  vTarget[i].x = K * force.x;
  vTarget[i].z = K * force.z;
}

initSwarm(4);
updateDroneLabel();

// MAIN UPDATE LOOP
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate); // always call next frame

  const dt = clock.getDelta();

  if (playFlag) {
    simTime += dt;

    // Base drone dynamics
    updateDrones(dt);

    // Swarm logic
    if (swarmFlag) updateSwarm(simTime, dt);
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();
