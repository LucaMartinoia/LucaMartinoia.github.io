// ----------------------
// Simulation logic
// ----------------------
class IsingImplementation {
  static criticalTemperature = 2 / Math.log(1 + Math.sqrt(2));

  constructor() {
    this.temperature = 1.5;
    this.transitionWindow = 0.3;
    this.alpha = 0.2;
    this.setSize(100);
  }

  setTemperature(temperature) {
    this.temperature = temperature;
    this.initialize();
  }

  setSize(size) {
    this.size = size;
    this.spins = new Int8Array(size * size);
    this.stepsPerSweep = size * size;
    this.correlationTime = size;
    this.initialize();
  }

  initialize() {
    this.totalMagnetization = 0;
    this.averageMagnetization = 0;
    this.time = 0;
    const criticalTemperature = IsingImplementation.criticalTemperature;
    this.nearTransition = this.temperature > criticalTemperature && this.temperature < criticalTemperature + this.transitionWindow;
    // Use cluster updates near criticality, where local flips become inefficient.
    this.method = this.nearTransition ? "wolff" : "metropolis";

    for (let index = 0; index < this.spins.length; index++) {
      this.spins[index] = Math.random() < 0.5 ? -1 : 1;
      this.totalMagnetization += this.spins[index];
    }
  }

  update() {
    if (this.nearTransition) {
      this.wolffStep();
    } else {
      for (let step = 0; step < this.stepsPerSweep; step++) this.metropolisStep();
    }

    this.time++;
    // Sample magnetization less often than the lattice update and smooth its fluctuations.
    if (this.time % this.correlationTime === 0) {
      const magnetization = this.totalMagnetization / (this.size * this.size);
      this.averageMagnetization = (1 - this.alpha) * this.averageMagnetization + this.alpha * Math.abs(magnetization);
    }
  }

  index(row, column) {
    // Wrap coordinates to implement periodic boundaries on the square lattice.
    return ((row + this.size) % this.size) * this.size + ((column + this.size) % this.size);
  }

  metropolisStep() {
    const row = Math.floor(Math.random() * this.size);
    const column = Math.floor(Math.random() * this.size);
    const index = this.index(row, column);
    const spin = this.spins[index];
    const neighborSum =
      this.spins[this.index(row - 1, column)] +
      this.spins[this.index(row + 1, column)] +
      this.spins[this.index(row, column - 1)] +
      this.spins[this.index(row, column + 1)];
    const energyChange = 2 * spin * neighborSum;

    // Accept downhill flips always and uphill flips with their Boltzmann probability.
    if (energyChange <= 0 || Math.random() < Math.exp(-energyChange / this.temperature)) {
      this.spins[index] = -spin;
      this.totalMagnetization -= 2 * spin;
    }
  }

  wolffStep() {
    const seedRow = Math.floor(Math.random() * this.size);
    const seedColumn = Math.floor(Math.random() * this.size);
    const seedIndex = this.index(seedRow, seedColumn);
    const seedSpin = this.spins[seedIndex];
    const bondProbability = 1 - Math.exp(-2 / this.temperature);
    const stack = [seedIndex];
    const cluster = new Set([seedIndex]);

    // Grow a connected cluster of like spins by probabilistically adding neighbors.
    while (stack.length > 0) {
      const index = stack.pop();
      const row = Math.floor(index / this.size);
      const column = index % this.size;
      const neighbors = [this.index(row + 1, column), this.index(row - 1, column), this.index(row, column + 1), this.index(row, column - 1)];

      for (const neighbor of neighbors) {
        if (this.spins[neighbor] === seedSpin && !cluster.has(neighbor) && Math.random() < bondProbability) {
          cluster.add(neighbor);
          stack.push(neighbor);
        }
      }
    }

    // Flip the completed cluster and update total magnetization incrementally.
    let magnetizationChange = 0;
    for (const index of cluster) {
      const spin = this.spins[index];
      this.spins[index] = -spin;
      magnetizationChange -= 2 * spin;
    }
    this.totalMagnetization += magnetizationChange;
  }
}

// ----------------------
// Ising-specific UI
// ----------------------
class IsingUI {
  constructor(ui) {
    this.ui = ui;
  }

  render(model, onParameterChange) {
    const temperatureSlider = this.ui.createSlider({
      label: "Temperature",
      min: 0.1,
      max: 4,
      step: 0.01,
      value: model.temperature,
      onInput: (value) => {
        model.setTemperature(value);
        onParameterChange();
      },
      format: (value) => value.toFixed(2),
    });

    const sizeSlider = this.ui.createSlider({
      label: "Size",
      min: 80,
      max: 300,
      step: 10,
      value: model.size,
      onInput: (value) => {
        model.setSize(value);
        onParameterChange();
      },
    });

    this.ui.appendControl(temperatureSlider);
    this.ui.appendControl(sizeSlider);
  }
}

// ----------------------
// Ising-specific renderer
// ----------------------
class IsingRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.renderCounter = 0;
  }

  render(model) {
    if (!this.shouldRender(model)) return;

    const { spins, size, averageMagnetization } = model;

    const imageData = new ImageData(size, size);
    const pixels = imageData.data;
    const downSpin = [38, 139, 210];
    const upSpin = [220, 50, 47];

    for (let index = 0; index < spins.length; index++) {
      const color = spins[index] === 1 ? upSpin : downSpin;
      const pixel = index * 4;

      pixels[pixel] = color[0];
      pixels[pixel + 1] = color[1];
      pixels[pixel + 2] = color[2];
      pixels[pixel + 3] = 255;
    }

    this.renderer.drawImageData(imageData);
    this.renderer.setOverlay("\\(\\langle M\\rangle\\)", averageMagnetization.toFixed(3));
  }

  shouldRender(model) {
    const renderInterval = model.method === "wolff" ? 10 : 1;

    this.renderCounter++;

    if (this.renderCounter < renderInterval) {
      return false;
    }

    this.renderCounter = 0;
    return true;
  }
}

// ----------------------
// Ising-specific plotter
// ----------------------
class IsingPlotter {
  constructor(plotter) {
    this.plotter = plotter;
  }

  render(model) {
    const { temperatures, magnetizations, interpolatedMagnetization, temperature } = this.getPlotData(model);

    const traces = [
      {
        x: temperatures,
        y: magnetizations,
        mode: "lines",
        line: { width: 3, color: "#1f77b4" },
        name: "M",
        showlegend: false,
      },
      {
        x: [temperature, temperature],
        y: [0, interpolatedMagnetization],
        mode: "lines+markers",
        line: { width: 2, dash: "dot", color: "#ff7f0e" },
        marker: { size: 8, color: "#ff7f0e" },
        showlegend: false,
      },
    ];

    const layout = {
      xaxis: { title: { text: "T", standoff: 5 } },
      yaxis: { title: { text: "M", standoff: 5 }, range: [0, 1] },
      annotations: [
        {
          x: 0.98,
          y: 0.98,
          xref: "x domain",
          yref: "y domain",
          text: `M = ${interpolatedMagnetization.toFixed(3)}`,
          showarrow: false,
          font: { size: 12, color: "black" },
        },
        {
          text: "Magnetization",
          x: 0.5,
          y: 1.2,
          xref: "x domain",
          yref: "y domain",
          showarrow: false,
          font: { size: 14 },
        },
      ],
      margin: this.plotter.margin,
      height: this.plotter.height,
    };

    this.plotter.draw(traces, layout);
  }

  getPlotData(model) {
    const minimumTemperature = 0.01;
    const maximumTemperature = 4;
    const temperatureStep = 0.01;
    const pointCount = Math.floor((maximumTemperature - minimumTemperature) / temperatureStep) + 1;

    const temperatures = new Array(pointCount);
    const magnetizations = new Array(pointCount);

    for (let index = 0; index < pointCount; index++) {
      const temperature = minimumTemperature + index * temperatureStep;
      temperatures[index] = temperature;

      if (temperature < IsingImplementation.criticalTemperature) {
        const sinh = Math.sinh(2 / temperature);
        const inside = 1 - 1 / sinh ** 4;
        magnetizations[index] = inside > 0 ? inside ** (1 / 8) : 0;
      } else {
        magnetizations[index] = 0;
      }
    }

    const index = Math.max(0, Math.min(pointCount - 2, Math.floor((model.temperature - minimumTemperature) / temperatureStep)));

    const fraction = (model.temperature - temperatures[index]) / (temperatures[index + 1] - temperatures[index]);

    const interpolatedMagnetization = magnetizations[index] + fraction * (magnetizations[index + 1] - magnetizations[index]);

    return {
      temperatures,
      magnetizations,
      interpolatedMagnetization,
      temperature: model.temperature,
    };
  }
}

// ----------------------
// Ising-specific text
// ----------------------
class IsingExplanation {
  constructor(explanation) {
    this.explanation = explanation;
  }

  render() {
    this.explanation.setContent(`
      <b>Ising model</b><br>
      <p>
        Phase transitions are changes between different states of a system as an external condition, such as temperature, is varied. Some transitions are abrupt, such as the freezing of water, while others are continuous: the microscopic state of the system changes gradually, but collective effects can change dramatically near the transition. These are called second-order, or continuous, phase transitions. Near such transitions, fluctuations can become correlated over very long distances, leading to characteristic changes in the macroscopic properties of the system.
      </p>

      <p>
        The Ising model is a simple mathematical model frequently used to study this kind of collective behavior. It consists of a square lattice in which each site carries a spin that can take one of two values, +1 or −1. The spins can be thought of as tiny magnets pointing in opposite directions, and each spin interacts only with its nearest neighbors on the lattice.
      </p>

      <p>
        Two competing effects determine the behavior of the system. The interaction between neighboring spins favors alignment, promoting an ordered state. Temperature, on the other hand, introduces random fluctuations that tend to disrupt this order. At low temperature, alignment dominates and most spins point in the same direction. At high temperature, thermal fluctuations dominate and the spins become disordered, with roughly equal numbers of +1 and −1 spins. Between these regimes lies a critical temperature, where the system undergoes a continuous phase transition. A useful quantity for characterizing this transition is the average magnetization, which measures the overall alignment of the spins.
      </p>

      <p>
        The simulation uses Monte Carlo methods to reproduce this behavior numerically. Starting from a random configuration, the lattice is updated step by step according to probabilistic rules that mimic thermal fluctuations. Away from the critical temperature, the Metropolis algorithm provides a simple way of sampling the system, while near the transition the Wolff cluster algorithm is used to more efficiently explore different configurations. The plot compares the magnetization measured in the simulation with the theoretical prediction for an infinitely large lattice. The agreement is good away from the critical point, while finite-size effects become more significant near the transition. Increasing the lattice size reduces these effects and brings the simulation closer to the theoretical prediction.
      </p>
    `);
  }
}

// ----------------------
// Main entry point
// ----------------------
export class Ising {
  constructor({ renderer, plotter, ui, explanation }) {
    this.implementation = new IsingImplementation();

    this.ui = new IsingUI(ui);
    this.renderer = new IsingRenderer(renderer);
    this.plotter = new IsingPlotter(plotter);
    this.explanation = new IsingExplanation(explanation);
  }

  update(onModelChange) {
    this.implementation.update(onModelChange);
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
