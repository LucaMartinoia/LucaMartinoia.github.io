---
layout: simulation
title: SIMCOM
description:
category: simulation
img: assets/img/simulations/simcom/cover.jpeg
---

<p style="text-align: justify;">
<a href="https://github.com/LucaMartinoia/bluesky-SIMCOM">SIMCOM</a> is an Air Traffic Management and Control simulator to study cyber-threats and countermeasures on CNS systems developed for the <a href="{{ "/projects/atm_excite/" | relative_url }}">ATM-EXCITE</a> project. SIMCOM is based on <a href="https://github.com/TUDelft-CNS-ATM/bluesky">BlueSky</a>, an ATM simulator developed by Joost Ellerbroek and Jacco Hoekstra at TU Delft, and extends the core simulator with ADS-B-specific functionality, enabling users to model aircraft communications, receivers, and attacker behavior in a realistic air traffic management environment. SIMCOM allows simulation and analysis of cyber-attacks on ADS-B, including message replay, jamming, spoofing, ghost injection, and the evaluation of security measures such as AES-GCM encryption.
</p>

<div class="row justify-content-sm-center">
    <div class="col-sm-11 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/simulations/simcom/simcom.jpg" title="SIMCOM" class="img-fluid rounded z-depth-1 mt-3" %}
    </div>
	<div class="caption">
		Screenshot of the SIMCOM simulator.
	</div>
</div>

<p style="text-align: justify;">
While the current implementation is mostly a prototype, it is designed for researchers and engineers interested in studying the impact of cyber-attacks on air traffic operations, evaluating mitigation strategies, and testing security schemes while maintaining the high-level dynamics of ATM networks. It integrates message encoding/decoding, propagation, noise, and receiver selection logic, allowing attacks and countermeasures to be evaluated in the context of realistic flight scenarios.
</p>

<p style="text-align: justify;">
The architecture is agent-based and mirrors real-world ATM elements. The core plugin orchestrates all components and manages logging. The World module handles the agents: aircraft, attackers, and receivers, including propagation, noise, and distance-based constraints. Each Aircraft maintains its ADS-B Out registry, emits messages, and optionally encrypts them. Attackers can intercept, modify, or inject messages, while Receivers collect transmissions, decode them according to the security scheme, and provide data to the GUI or conflict detection module.
</p>
