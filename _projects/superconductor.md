---
layout: page
title: Thin film superconductor
description:
img: assets/img/superconductivity.jpg
importance: 2
category: physics
related_publications: true
---

<p style='text-align: justify;'>It is a comon lore that static external electric fields should have almost no effect on bulk metallic superconductors. This is because standard BCS superconductors contain many free charges that reorganize to screen the electric field, as it happens in normal metals.</p>

<p style='text-align: justify;'>Recently, however, it has been reported that a static electric field can be used to control the value of the supercurrent in thin superconductive films. In particular, for a large enough electric field, a transition to the normal metallic phase has been observed. This effect is called Superconductive Field Effect (SFE). In these films the screening length is much smaller then the thickness of the film, which is about the same size as the coherence length, therefore the external electric field should have no effect on the bulk. Furthermore, it was observed that increasing the thickness of the sample completely suppresses the SFE and no transition to the metal phase occurs.</p>

<div class="row justify-content-sm-center align-items-center">
    <div class="col-sm-5 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/experimental_setup.jpg" title="experimental setup" class="img-fluid rounded z-depth-1" %}
    </div>
    <div class="col-sm-7 mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/critical_current.jpg" title="critical_current" class="img-fluid rounded z-depth-1" %}
    </div>
	<div class="caption">
			<b>Left:</b> experimental setup. <b>Right:</b> suppression of the critical current.
		</div>
</div>

<p style='text-align: justify;'>Part of my research deals with trying to understand this effect. Given the universality of the SFE, my advisor's group and I proposed a modified Ginzburg-Landau model that captures the effective theory of the system below the critical temperature, and managed to reproduce the main features of the SFE observed in experiments {% cite Amoretti:2022smp %}. We also proposed a new prediction that can be tested in the lab. Because we believe the thin film undergoes a true phase transition in the presence of an external electric field, we are now working trying to describe it from a microscopic perspective, hoping eventually to map the two descriptions together.</p>
