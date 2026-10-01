---
layout: simulation
title: Drone swarms
description: Exploring decentralized swarm behaviour
category: simulations
img: assets/simulations/swarm/cover.jpg
script: swarm/app.js
chart:
  plotly: true
---

<p style="text-align: justify">
  The idea for this simulation comes from the EDF <a href="https://defence-industry-space.ec.europa.eu/document/download/6abd0f72-808a-4c1d-8b2e-b271abdb1db7_en?filename=EDF-2023-LS-RA-SMERO-NT%20STEALTH.pdf">STEALTH</a> project, which aims to develop methods and tools for enabling UAV swarms to operate in GNSS-denied environments.
</p>

<p style="text-align: justify">
  Inspired by this problem, I wanted to explore whether a simple first-order control algorithm could help a distributed swarm maintain its formation without relying on a centralized authority. The simulation deliberately uses a simplified model, focusing on the interplay between natural drift, imperfect measurements, and asynchronous local control.
</p>

<p style="text-align: justify">
  Each drone is assigned a preferred planar drift velocity, randomly chosen at the beginning of the simulation. This term represents persistent effects such as wind, mechanical imperfections, or errors in the control and sensing loop. At each time step, a further random perturbation is added to this drift velocity, representing smaller and more rapidly varying disturbances. The resulting target velocity is then used in a relaxational random-walk process, modelled as an Ornstein-Uhlenbeck process, to update the drone's actual velocity and position.
</p>

<p style="text-align: justify">
  With the swarm logic disabled, these independent disturbances naturally cause the formation to disperse. The default drift is intentionally relatively large to make this effect visible; in a real system, I expect the uncontrolled drones to remain in formation for longer.
</p>

<p style="text-align: justify">
  When the swarm logic is enabled, each drone independently estimates the correction needed to maintain the formation. One possible engineering implementation would be to use ultra-wideband (UWB) two-way ranging to measure the distances to neighbouring drones, together with a small antenna array to estimate their approximate bearings. The measurements are performed asynchronously, so each drone updates its control command independently rather than relying on a centralized controller.
</p>

<p style="text-align: justify">
  The measured distances and bearings are compared with the desired formation geometry to determine a corrective velocity. This control contribution is added to the drone's natural drift and passed through the same relaxational dynamics as the uncontrolled motion. The resulting behaviour illustrates the limits of the simple distributed controller: maintaining the formation becomes increasingly difficult as the drift velocity or bearing error increases, while very small swarms provide fewer relative measurements and therefore less geometric redundancy.
</p>
