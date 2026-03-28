---
layout: page
title: ATM-EXCITE
description:
img: assets/img/projects/atm_excite/cover.jpeg
importance: 1
category: engineering
related_publications: false
---

<p style="text-align: justify;">
The <a href="https://atm-excite.eu/" target="_blank" rel="noopener noreferrer">ATM-EXCITE</a> project is a collaborative effort funded by the SESAR JU Exploratory Research programme, involving a consortium of industrial and research partners, including my company, STAM S.r.l. The project focuses on advancing the security and resilience of modern air traffic management systems by developing innovative cyber-security solutions. The aim is to protect the integrity and reliability of critical surveillance technologies, ensuring safer and more robust airspace operations.
</p>

<p style="text-align: justify;">
Within this framework I am working towards developing <a href="https://github.com/LucaMartinoia/bluesky_SIMCOM" target="_blank" rel="noopener noreferrer">SIMCOM</a>, a key research solution. SIMCOM is a multi-agent simulation platform designed to evaluate cyber-attacks targeting the Automatic Dependent Surveillance–Broadcast (ADS-B) system. It provides a flexible and extensible environment for investigating ADS-B vulnerabilities and their impact on air traffic flow and control, supporting the wider goals of the ATM-EXCITE project.
</p>

<div class="row justify-content-sm-center">
  <div class="col-sm-7 mt-3 mt-md-0">
    {% include figure.liquid path="assets/img/projects/atm_excite/ads-b_map.jpg" title="Overview of ADS-B system operation" class="img-fluid rounded z-depth-1" %}
    <div class="caption">
      Broad illustration of how ADS-B technology works in air traffic surveillance.
    </div>
  </div>
  <div class="col-sm-5 mt-3 mt-md-0" style='text-align: justify;'>
		<p>ADS-B is a surveillance technology widely adopted in both civil and military aviation, serving as a cornerstone of next-generation air traffic management. It relies on the Global Navigation Satellite System (GNSS) to determine an aircraft’s precise position, which is then automatically broadcast over radio frequencies alongside other key flight data such as speed, heading, and identification. These broadcasts enable ground stations and nearby aircraft to maintain real-time situational awareness over extensive geographic regions. The ADS-B system comprises two main subsystems: ADS-B Out, which transmits the aircraft’s position and related data, and ADS-B In, which receives and decodes such messages from other aircraft and ground stations.</p>
  </div>
</div>

<p style="text-align: justify;">
  Despite its advantages in terms of cost, coverage, and accuracy compared to traditional radar systems, ADS-B was not designed with security in mind. The unencrypted, plain-text broadcast of ADS-B messages exposes the system to multiple cyber threats including eavesdropping, spoofing, message injection, and denial-of-service attacks. These vulnerabilities raise significant concerns about trustworthiness and impede ADS-B’s full adoption as a radar replacement.
</p>

<div class="row justify-content-sm-center">
  <div class="col-sm-10 col-md-8 mt-4" style="text-align: center;">
    {% include figure.liquid path="assets/img/projects/atm_excite/ads-b_protocol.jpg" title="ADS-B communication protocol" class="img-fluid rounded z-depth-1" %}
    <div class="caption">
      Diagram illustrating the ADS-B communication protocol and message structure.
    </div>
  </div>
</div>

<div class="row justify-content-sm-center">
  <div class="col-sm-12 mt-3 mt-md-0" style="text-align: justify;">
    <p>
      For ATM-EXCITE, I am developing SIMCOM as a simulation environment to study how cyber-attacks affect ADS-B–based air traffic surveillance. The simulator is built on top of BlueSky, an open-source, research-grade air traffic management platform, which I extend with dedicated modules for cybersecurity analysis. This lets me model realistic attack scenarios and observe their operational impact on air traffic management, rather than stopping at abstract threat descriptions.
    </p>
    <p>
      Beyond attack modeling, I use SIMCOM as a testbed to design, implement, and benchmark cyber-defense strategies in a controlled environment. The goal is to validate mitigation techniques under realistic traffic conditions before considering real-world deployment. In the context of ATM-EXCITE, this work helps push ADS-B security from theory toward operationally credible solutions, with direct relevance for civil aviation safety and for secure civil–military airspace data sharing.
    </p>
  </div>
</div>
