---
layout: simulation
title: Drone swarm dynamics
description: TODO ALLTODO ALLTODO ALLTODO ALLTODO ALLTODO ALLTODO ALL
category: simulations
img: assets/simulations/swarm/cover.jpg
script: swarm/app.js
---

<div id="canvas-container" class="simulation-canvas">
  <div id="three-container" class="simulation-canvas"></div>

  <!-- Full-size transparent button -->

<button id="playpause-button"><i class="fa-solid fa-play"></i></button>
</div>

<!-- GUI -->
<div
  id="bottom-panel"
  style="
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin: 20px auto;
    gap: 20px;
  "
>
  <!-- Left: Swarm parameters -->
  <div
    id="swarm-panel"
    style="
      width: 320px;
      background-color: transparent;
      border: 2px solid var(--global-theme-color);
      border-radius: 8px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px; /* spacing between top row and sliders */
    "
  >
    <h3 style="margin-top: 0; text-align: center">Parameters</h3>
    <!-- Top row: drones + toggle -->
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 4px;">
        <span>Drones:</span>
        <span id="drone-count" style="min-width: 15px; text-align: center;">4</span>
        <button id="btn-minus" class="symbol-btn"><i class="fa-solid fa-minus"></i></button>
        <button id="btn-plus" class="symbol-btn"><i class="fa-slab fa-regular fa-plus"></i></button>
      </div>
      <div style="display: flex; align-items: center; gap: 4px;">
        <input type="checkbox" id="swarm-toggle" checked />
        <label for="swarm-toggle" style="margin:0;">Swarm logic</label>
      </div>
    </div>
    <!-- Sliders -->
    <div>
      <label for="slider-twr">Ranging period (s):</label>
      <span id="twr-value">0.5</span>
      <input id="slider-twr" type="range" min="0.01" max="1" step="0.01" value="0.5" class="full-width slider" />
    </div>
    <div>
      <label for="slider-vmax">Drone noise (m/s):</label>
      <span id="vmax-value">4.0</span>
      <input id="slider-vmax" type="range" min="0" max="10" step="0.1" value="4" class="full-width slider" />
    </div>
    <div>
      <label for="bearing-error-slider">Bearing error (°):</label>
      <span id="bearing-error-value">0</span>
      <input id="bearing-error-slider" type="range" min="0" max="20" step="0.1" value="0" class="full-width slider" />
    </div>

  </div>

  <!-- Right: Explanation -->
  <div id="explanation" style="flex: 1; padding: 2px; text-align: justify; margin-top: 0px">
    <h3>Explanation</h3>
    <p>
      This simulation models a small aerial drone swarm in a GNSS-denied
      environment. Each drone moves with a strong relaxational random-walk,
      mimicking natural drift, and performs two-way ranging broadcasts in
      the Ultra-Wide Band (UWB) frequency range to measure distances to its
      neighbors. We assume that each reply occurs on a slightly different
      frequency, so the sender can identify which drone responded.
    </p>
    <p>
      We further assume the drones are equipped small antenna array to
      estimate the bearing of nearby drones. Using only distance and bearing
      measurements, the swarm maintains a prescribed geometric formation,
      showing how coordinated behavior can emerge from simple decentralized
      sensing and interactions.
    </p>
  </div>
</div>
