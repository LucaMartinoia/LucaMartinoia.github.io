---
layout: page
title: Tennis match visualizer
description:
category: simulations
img: assets/simulations/tennis_viz/cover.jpg
---

<p style="text-align: justify">
    <a href="https://github.com/LucaMartinoia/tennis-match-viz">Tennis Match Visualizer</a> is a simple interactive application that I have written to visualize professional tennis matches point by point. It parses shot-by-shot data from the <a href="https://www.tennisabstract.com/blog/2015/09/23/the-match-charting-project-quick-start-guide/">Match Charting Project</a>, an initiative that systematically records pro tennis matches in a standardized format, making it possible to analyze patterns and strategies.
</p>

<div class="row justify-content-sm-center">
    <div class="col-md-10 mt-2">
        {% include figure.liquid path="assets/img/simulations/tennis_viz/tennis.jpg"
          title="Tennis Match Visualizer"
          class="img-fluid rounded z-depth-1"
        %}
        <div class="caption">
            Screenshot of the GUI.
        </div>
    </div>
</div>

<p style="text-align: justify">
    The app reads CSV files from the Match Charting Project and uses <a href="https://vpython.org/">VPython</a> to turn the match data into a 3D animation. The data is not precise enough to reconstruct every shot exactly, but it should (hopefully) be detailed enough to reproduce the general movement and dynamics of each point.
</p>

<p style="text-align: justify">
    The Match Charting Project records the approximate landing point of each shot, but does not provide the full initial conditions needed to reconstruct its trajectory. A traditional numerical integration approach would therefore require me to guess the initial position, velocity, and other parameters for each shot. Instead, I chose to work backwards from the available information: I use simplified models of the ball's dynamics to derive analytic trajectories connecting the (approximate) starting and ending points of each shot. This obviously does not reproduce the exact physical trajectory; the aim is simply to obtain consistent motion from the available data.
</p>

<p style="text-align: justify">
    The application allows users to:
    <ul>
        <li>Select the tournament and match to visualize</li>
        <li>Run matches point by point, with full animation</li>
        <li>Control playback with play/pause, slow motion, and point navigation buttons</li>
        <li>Switch between day and night modes for the court</li>
        <li>Interact with the camera: zoom, rotate, and move freely</li>
        <li>View a live score table and follow the match progression</li>
    </ul>
</p>

<p style="text-align: justify">
    This project started purely as a personal side project, driven by curiosity and a desire to explore Python, object-oriented design, GUI development, and 3D animation. The goal has always been to learn by doing and experiment with these ideas on a project of my own.
</p>
