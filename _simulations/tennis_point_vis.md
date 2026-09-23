---
layout: page
title: Tennis match visualizer
description:
category: simulation
img: assets/img/simulations/tennis_viz/cover.jpeg
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
    The app reads CSV files from the Match Charting Project and brings the match to life using <a href="https://vpython.org/">VPython</a>, a (very) simple 3D animation library. While the data is not precise enough for an exact reconstruction of every shot, the main goal was to provide a clear and engaging visual impression of the flow, positioning, and dynamics of each point.
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
    This project started purely as a personal side hobby. It grew out of curiosity and a desire to explore Python, GUI development, and 3D animations. The goal has always been to learn by doing and experiment with visualizations.
</p>
