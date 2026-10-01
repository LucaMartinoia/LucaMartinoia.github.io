// ----------------------
// Simulation logic
// ----------------------
class VicsekImplementation {
  constructor() {
    this.particleCount = 200;
    this.boxSize = 1;
    this.interactionRadius = 0.05;
    this.speed = 0.003;
    this.noise = 0.8;
    this.averageWindow = 100;
    this.orderParameter = 0;
    this.setSize(this.particleCount);
  }

  setParams(noise, interactionRadius) {
    this.noise = noise;
    this.interactionRadius = interactionRadius;
  }

  setSize(particleCount) {
    this.particleCount = particleCount;
    this.x = new Float32Array(particleCount);
    this.y = new Float32Array(particleCount);
    this.theta = new Float32Array(particleCount);
    this.vx = new Float32Array(particleCount);
    this.vy = new Float32Array(particleCount);
    this.initialize();
  }

  initialize() {
    this.time = 0;
    for (let index = 0; index < this.particleCount; index++) {
      this.x[index] = Math.random() * this.boxSize;
      this.y[index] = Math.random() * this.boxSize;
      this.theta[index] = Math.random() * 2 * Math.PI;
      this.vx[index] = Math.cos(this.theta[index]);
      this.vy[index] = Math.sin(this.theta[index]);
    }

    this.orderParameter = 0;
  }

  update() {
    const count = this.particleCount;
    const boxSize = this.boxSize;
    const radiusSquared = this.interactionRadius * this.interactionRadius;
    const newTheta = new Float32Array(count);

    // Find each particle's local mean direction using periodic minimum-image distances.
    for (let index = 0; index < count; index++) {
      let directionX = 0;
      let directionY = 0;
      const currentX = this.x[index];
      const currentY = this.y[index];

      for (let other = 0; other < count; other++) {
        let dx = this.x[other] - currentX;
        let dy = this.y[other] - currentY;
        dx -= Math.round(dx / boxSize) * boxSize;
        dy -= Math.round(dy / boxSize) * boxSize;

        if (dx * dx + dy * dy < radiusSquared) {
          directionX += Math.cos(this.theta[other]);
          directionY += Math.sin(this.theta[other]);
        }
      }

      // Average unit vectors rather than angles, avoiding wraparound at +/- pi.
      const averageAngle = Math.atan2(directionY, directionX);
      const angularNoise = this.noise * (Math.random() - 0.5);
      newTheta[index] = averageAngle + angularNoise;
    }

    // Apply all new headings together, then move at constant speed with wraparound.
    for (let index = 0; index < count; index++) {
      this.theta[index] = newTheta[index];
      this.vx[index] = Math.cos(this.theta[index]);
      this.vy[index] = Math.sin(this.theta[index]);
      this.x[index] += this.speed * this.vx[index];
      this.y[index] += this.speed * this.vy[index];

      if (this.x[index] < 0) this.x[index] += boxSize;
      if (this.x[index] >= boxSize) this.x[index] -= boxSize;
      if (this.y[index] < 0) this.y[index] += boxSize;
      if (this.y[index] >= boxSize) this.y[index] -= boxSize;
    }

    let velocityX = 0;
    let velocityY = 0;
    for (let index = 0; index < count; index++) {
      velocityX += this.vx[index];
      velocityY += this.vy[index];
    }

    // The normalized resultant velocity measures global alignment on [0, 1].
    const alignment = Math.sqrt(velocityX * velocityX + velocityY * velocityY) / count;
    const smoothing = 2 / (this.averageWindow + 1);
    this.orderParameter = (1 - smoothing) * this.orderParameter + smoothing * alignment;

    this.time++;
  }
}

// ----------------------
// Vicsek-specific UI
// ----------------------
class VicsekUI {
  constructor(ui) {
    this.ui = ui;
  }

  render(model, onParameterChange) {
    const noiseSlider = this.ui.createSlider({
      label: "Noise",
      min: 0.1,
      max: 1.5,
      step: 0.01,
      value: model.noise,
      onInput: (noise) => {
        model.setParams(noise, model.interactionRadius);
        onParameterChange();
      },
      format: (value) => value.toFixed(3),
    });

    const radiusSlider = this.ui.createSlider({
      label: "Interaction radius",
      min: 0.01,
      max: 0.1,
      step: 0.001,
      value: model.interactionRadius,
      onInput: (radius) => {
        model.setParams(model.noise, radius);
        onParameterChange();
      },
      format: (value) => value.toFixed(3),
    });

    this.ui.appendControl(noiseSlider);
    this.ui.appendControl(radiusSlider);
  }
}

// ----------------------
// Vicsek-specific renderer
// ----------------------
class VicsekRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render(model) {
    const { x, y, theta, particleCount, boxSize, orderParameter } = model;
    const context = this.renderer.ctx;
    const width = this.renderer.canvas.width;
    const height = this.renderer.canvas.height;

    context.fillStyle = "#111";
    context.fillRect(0, 0, width, height);

    const scale = Math.min(width, height);
    const scaleX = width / scale;
    const particleSize = 6;

    context.fillStyle = "#1f77b4";

    for (let index = 0; index < particleCount; index++) {
      const px = (x[index] / boxSize) * scale * scaleX;
      const py = (y[index] / boxSize) * scale;

      context.save();
      context.translate(px, py);
      context.rotate(theta[index]);
      context.beginPath();
      context.moveTo(particleSize, 0);
      context.lineTo(-particleSize * 0.6, particleSize * 0.4);
      context.lineTo(-particleSize * 0.6, -particleSize * 0.4);
      context.closePath();
      context.fill();
      context.restore();
    }

    this.renderer.setOverlay("\\(\\phi\\)", orderParameter.toFixed(3));
  }
}

// ----------------------
// Vicsek-specific plotter
// ----------------------
class VicsekPlotter {
  constructor(plotter) {
    this.plotter = plotter;
    this.lastRenderTime = null;
    this.renderInterval = 100;
    this.orderHistory = [];
    this.timeHistory = [];
    this.maxHistory = 2000;
  }

  render(model) {
    const now = performance.now();

    if (this.lastRenderTime !== null && now - this.lastRenderTime < this.renderInterval) {
      return;
    }

    this.lastRenderTime = now;

    this.orderHistory.push(model.orderParameter);
    this.timeHistory.push(model.time);

    if (this.orderHistory.length > this.maxHistory) {
      this.orderHistory.shift();
      this.timeHistory.shift();
    }

    const traces = [
      {
        x: [...this.timeHistory],
        y: [...this.orderHistory],
        mode: "lines",
        line: { width: 2, color: "#1f77b4" },
        showlegend: false,
      },
    ];

    const layout = {
      xaxis: { title: { text: "time", standoff: 5 } },
      yaxis: { title: { text: "φ", standoff: 5 }, range: [0, 1] },
      margin: this.plotter.margin,
      height: this.plotter.height,
      annotations: [
        {
          text: "Order parameter",
          x: 0.5,
          y: 1.2,
          xref: "paper",
          yref: "paper",
          showarrow: false,
          font: { size: 14 },
        },
      ],
    };

    this.plotter.draw(traces, layout);
  }
}

// ----------------------
// Vicsek-specific text
// ----------------------
class VicsekExplanation {
  constructor(explanation) {
    this.explanation = explanation;
  }

  render() {
    this.explanation.setContent(`
			<b>Vicsek</b><br>
      <p>
        The Vicsek model is a simple model used to study how coordinated collective motion can emerge from many individual agents following a few local rules. It can be used as a simplified description of phenomena such as bird flocks, schools of fish, or groups of self-propelled particles. Unlike equilibrium systems, the Vicsek model describes an out-of-equilibrium system: the agents are continuously moving, and their dynamics are driven by local interactions and noise.
      </p>

      <p>
        In the model, each agent moves at a constant speed and adjusts its direction at every time step to align with the average direction of its neighbors, with some random noise added to the alignment. The noise represents fluctuations or uncertainty in the agents' motion. Although each agent only responds to its local neighborhood, these interactions can produce collective behavior at the scale of the entire system.
      </p>

      <p>
        The resulting transition is driven by a competition between alignment and noise. Alignment tends to propagate directional order through the system, while noise disrupts this coherence. When noise is sufficiently strong, the system remains disordered. As the noise is reduced, collective motion emerges and the system develops a non-zero global alignment. This transition is analogous in some respects to a phase transition, but it occurs in a non-equilibrium system with persistent motion.
      </p>

      <p>
        The degree of collective order can be quantified using an order parameter defined as the magnitude of the average normalized velocity of all agents. It is close to zero when the agents move in unrelated directions and approaches one when they move coherently in the same direction. The plot shows how this order parameter evolves over time, allowing the emergence and stability of collective motion to be observed directly.
      </p>
		`);
  }
}

// ----------------------
// Main entry point
// ----------------------
export class Vicsek {
  constructor({ renderer, plotter, ui, explanation }) {
    this.implementation = new VicsekImplementation();

    this.ui = new VicsekUI(ui);
    this.renderer = new VicsekRenderer(renderer);
    this.plotter = new VicsekPlotter(plotter);
    this.explanation = new VicsekExplanation(explanation);
  }

  update(onModelChange) {
    this.implementation.update();
    onModelChange?.();
  }

  configureUI(onParameterChange) {
    this.ui.render(this.implementation, onParameterChange);
  }

  render() {
    this.renderer.render(this.implementation);
  }

  plot() {
    this.plotter.render(this.implementation);
  }

  explain() {
    this.explanation.render();
  }
}
