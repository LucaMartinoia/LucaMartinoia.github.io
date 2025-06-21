---
layout: page
title: ATM-EXCITE
description:
img: assets/img/projects/atm_excite/atm-excite.jpeg
importance: 1
category: engineering
related_publications: true
---

<h2 style="text-align: left;">ATM-EXCITE and SIMCOM: Enhancing Air Traffic Security</h2>

<p style="text-align: justify;">
The <a href="https://atm-excite.eu/" target="_blank" rel="noopener noreferrer">ATM-EXCITE</a> project is a collaborative effort funded by the SESAR JU Exploratory Research programme, involving a consortium of industrial and research partners, including STAM S.r.l. The project focuses on advancing the security and resilience of modern air traffic management systems by developing innovative cyber-security solutions. Its aim is to protect the integrity and reliability of critical surveillance technologies, ensuring safer and more robust airspace operations.
</p>

<p style="text-align: justify;">
Within this framework, <a href="https://github.com/LucaMartinoia/bluesky_SIMCOM" target="_blank" rel="noopener noreferrer">SIMCOM</a> has been developed as a key research solution. SIMCOM is a multi-agent simulation platform designed to evaluate cyber-attacks targeting the Automatic Dependent Surveillance–Broadcast (ADS-B) system. It provides a flexible and extensible environment for investigating ADS-B vulnerabilities and their impact on air traffic flow and control, supporting the wider goals of the ATM-EXCITE project.
</p>

<div class="row justify-content-sm-center">
  <div class="col-sm-10 col-md-8 mt-3 mt-md-0" style="text-align: center;">
    {% include figure.liquid path="assets/img/projects/atm_excite/ads-b_map.png" title="Overview of ADS-B system operation" class="img-fluid rounded z-depth-1" %}
    <div class="caption">
      Broad illustration of how ADS-B technology works in air traffic surveillance.
    </div>
  </div>
</div>

<h2 style="text-align: left; margin-top: 2rem;">Background on ADS-B</h2>

<p style="text-align: justify;">
  ADS-B is a surveillance technology widely adopted in both civil and military aviation, serving as a cornerstone of next-generation air traffic management. It relies on the Global Navigation Satellite System (GNSS) to determine an aircraft’s precise position, which is then automatically broadcast over radio frequencies alongside other key flight data such as speed, heading, and identification. These broadcasts enable ground stations and nearby aircraft to maintain real-time situational awareness over extensive geographic regions.
</p>

<p style="text-align: justify;">
  The ADS-B system comprises two main subsystems: ADS-B Out, which transmits the aircraft’s position and related data, and ADS-B In, which receives and decodes such messages from other aircraft and ground stations. Despite its advantages in terms of cost, coverage, and accuracy compared to traditional radar systems, ADS-B was not designed with security in mind. The unencrypted, plain-text broadcast of ADS-B messages exposes the system to multiple cyber threats including eavesdropping, spoofing, message injection, and denial-of-service attacks. These vulnerabilities raise significant concerns about trustworthiness and impede ADS-B’s full adoption as a radar replacement.
</p>

<div class="row justify-content-sm-center">
  <div class="col-sm-10 col-md-8 mt-4" style="text-align: center;">
    {% include figure.liquid path="assets/img/projects/atm_excite/ads-b_protocol.png" title="ADS-B communication protocol" class="img-fluid rounded z-depth-1" %}
    <div class="caption">
      Diagram illustrating the ADS-B communication protocol and message structure.
    </div>
  </div>
</div>

<div class="row justify-content-sm-center">
  <div class="col-sm-12 mt-3 mt-md-0" style="text-align: justify;">
    <h2 style="text-align: left;">SIMCOM: Multi-agent ATM simulation for attack evaluation on ASD-B communications</h2>
    <p>
      SIMCOM addresses these critical challenges by providing a comprehensive simulation environment to model and analyze the effects of cyber-attacks on ADS-B systems. Built on top of BlueSky, which is an open-source, research-grade air traffic management simulator, SIMCOM extends BlueSky’s modular architecture with specialized features tailored for cybersecurity research.
    </p>
    <p>
      The framework allows users to simulate a wide range of attack scenarios and evaluate their operational consequences on air traffic management. Beyond threat analysis, SIMCOM also functions as a testbed for developing, verifying, and benchmarking cyber-defense strategies. Researchers, aviation authorities, and system integrators can leverage SIMCOM to experiment with mitigation techniques in a controlled setting, ensuring their effectiveness before deployment in real-world environments.
    </p>
    <p>
      Through this simulation-based approach, SIMCOM plays a pivotal role in supporting the goals of ATM-EXCITE by advancing ADS-B security from theoretical concepts to operationally viable solutions. These efforts not only improve the safety and resilience of civil aviation but also facilitate secure data sharing in civil-military cooperation scenarios, where reliable airspace surveillance is essential.
    </p>
  </div>
</div>
