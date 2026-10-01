// ----------------------
// Simulation logic
// ----------------------
class SOCImplementation {
  constructor() {
    this.size = 300;
    this.growthProbability = 0.005;
    this.fireProbability = 0.00001;
    this.grid = new Uint8Array(this.size * this.size);
    this.initialize();
  }

  setParams({ growthProbability, fireProbability }) {
    this.growthProbability = growthProbability;
    this.fireProbability = fireProbability;
    this.initialize();
  }

  initialize() {
    this.time = 0;
    this.fireSizes = [];
    this.currentFireSize = 0;
    this.wasBurning = false;
    this.grid.fill(0);
  }

  index(row, column) {
    return ((row + this.size) % this.size) * this.size + ((column + this.size) % this.size);
  }

  update(onModelChange) {
    const oldGrid = this.grid;
    const nextGrid = new Uint8Array(oldGrid.length);

    // Evolve from a snapshot so every cell sees the same previous timestep.
    for (let row = 0; row < this.size; row++) {
      for (let column = 0; column < this.size; column++) {
        const index = this.index(row, column);
        const state = oldGrid[index];

        if (state === 2) {
          nextGrid[index] = 0;
          continue;
        }

        if (state === 1) {
          const hasFire =
            oldGrid[this.index(row - 1, column)] === 2 ||
            oldGrid[this.index(row + 1, column)] === 2 ||
            oldGrid[this.index(row, column - 1)] === 2 ||
            oldGrid[this.index(row, column + 1)] === 2;

          nextGrid[index] = hasFire ? 2 : 1;
        }
      }
    }

    let burningNow = false;

    for (let index = 0; index < nextGrid.length; index++) {
      if (nextGrid[index] === 2) {
        burningNow = true;
        this.currentFireSize++;
      }
    }

    if (!burningNow) {
      for (let index = 0; index < nextGrid.length; index++) {
        if (nextGrid[index] === 0 && Math.random() < this.growthProbability) {
          nextGrid[index] = 1;
        } else if (nextGrid[index] === 1 && Math.random() < this.fireProbability) {
          nextGrid[index] = 2;
        }
      }
    }

    if (this.wasBurning && !burningNow) {
      if (this.currentFireSize > 0) {
        this.fireSizes.push(this.currentFireSize);
        onModelChange?.();
      }
      this.currentFireSize = 0;
    }

    this.wasBurning = burningNow;
    this.grid = nextGrid;
    this.time++;
  }
}

// ----------------------
// SOC-specific UI
// ----------------------
class SOCUI {
  constructor(ui) {
    this.ui = ui;
  }

  render(model, onParameterChange) {
    const growthSlider = this.ui.createSlider({
      label: "Growth probability",
      min: 0.001,
      max: 0.2,
      step: 0.001,
      value: model.growthProbability,
      onInput: (growthProbability) => {
        model.setParams({
          growthProbability,
          fireProbability: model.fireProbability,
        });
        onParameterChange();
      },
      format: (value) => value.toFixed(3),
    });

    const fireSlider = this.ui.createSlider({
      label: "Fire probability",
      min: 0.000001,
      max: 0.0001,
      step: 0.000001,
      value: model.fireProbability,
      onInput: (fireProbability) => {
        model.setParams({
          growthProbability: model.growthProbability,
          fireProbability,
        });
        onParameterChange();
      },
      format: (value) => `10<sup>${Math.log10(value).toFixed(0)}</sup>`,
    });

    this.ui.appendControl(growthSlider);
    this.ui.appendControl(fireSlider);
  }
}

// ----------------------
// SOC-specific renderer
// ----------------------
class SOCRenderer {
  constructor(renderer) {
    this.renderer = renderer;
    this.renderCounter = 0;
  }

  render(model) {
    if (!this.shouldRender()) return;

    const { grid, size } = model;

    const imageData = new ImageData(size, size);
    const pixels = imageData.data;
    const colors = [
      [30, 30, 30],
      [34, 139, 34],
      [255, 80, 0],
    ];

    for (let index = 0; index < grid.length; index++) {
      const color = colors[grid[index]] || colors[0];
      const pixel = index * 4;

      pixels[pixel] = color[0];
      pixels[pixel + 1] = color[1];
      pixels[pixel + 2] = color[2];
      pixels[pixel + 3] = 255;
    }

    this.renderer.drawImageData(imageData);
  }

  shouldRender() {
    this.renderCounter++;

    if (this.renderCounter < 2) {
      return false;
    }

    this.renderCounter = 0;
    return true;
  }
}

// ----------------------
// SOC-specific plotter
// ----------------------
class SOCPlotter {
  constructor(plotter) {
    this.plotter = plotter;
    this.theoryData = null;
  }

  render(model) {
    const { data, theory, size } = this.getPlotData(model);

    const traces = [
      {
        x: data.map((point) => point.size),
        y: data.map((point) => point.probability),
        mode: "markers",
        marker: { size: 6, color: "#1f77b4" },
        name: "empirical",
        showlegend: true,
      },
      {
        x: theory.map((point) => point.size),
        y: theory.map((point) => point.probability),
        mode: "lines",
        line: { width: 2, color: "#d62728" },
        name: "exponential fit",
        showlegend: true,
      },
    ];

    const layout = {
      xaxis: {
        title: { text: "Avalanche size s", standoff: 5 },
        type: "log",
        range: [0, Math.log10(size * size)],
      },
      yaxis: {
        title: { text: "P(S ≥ s)", standoff: 5 },
        type: "log",
        range: [-5, 0],
      },
      legend: {
        x: 0.98,
        y: 0.98,
        xanchor: "right",
        yanchor: "top",
        bgcolor: "rgba(255,255,255,0.7)",
      },
      margin: this.plotter.margin,
      height: this.plotter.height,
      annotations: [
        {
          text: "Avalanche-size distribution",
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

  getPlotData(model) {
    const sizes = model.fireSizes.filter((size) => size > 0).sort((a, b) => a - b);

    const sampleCount = sizes.length;

    const data = [];
    let index = 0;

    while (index < sampleCount) {
      const size = sizes[index];

      while (index < sampleCount && sizes[index] === size) {
        index++;
      }

      data.push({
        size,
        probability: (sampleCount - index + 1) / sampleCount,
      });
    }

    const meanSize = sizes.reduce((sum, size) => sum + size, 0) / sampleCount;

    // Exponential reference fitted to the empirical mean.
    const theory = [];

    const minimumSize = Math.max(1, sizes[0]);
    const maximumSize = sizes[sizes.length - 1];

    const pointCount = 200;

    for (let i = 0; i < pointCount; i++) {
      const fraction = i / (pointCount - 1);
      const size = Math.exp(Math.log(minimumSize) + fraction * (Math.log(maximumSize) - Math.log(minimumSize)));

      theory.push({
        size,
        probability: Math.exp(-size / meanSize),
      });
    }

    return {
      data,
      theory,
      size: model.size,
    };
  }
}

// ----------------------
// SOC-specific text
// ----------------------
class SOCExplanation {
  constructor(explanation) {
    this.explanation = explanation;
  }

  render() {
    this.explanation.setContent(`
			<b>Self-organized criticality</b><br>
      <p>
        Self-organized criticality (SOC) describes systems that naturally evolve toward a critical state where events occur across a wide range of sizes, without the need to fine-tune external parameters. In such a state, small disturbances can sometimes trigger very large responses, and the system has no single characteristic event size. This behavior is often reflected in broad, approximately scale-free distributions rather than the exponential decay expected when a characteristic scale dominates.
      </p>

      <p>
        A standard example is the forest-fire model. The system consists of a grid in which each cell is either empty or contains a tree. Trees grow gradually over time, while fires are started randomly and spread to neighboring trees, burning entire connected clusters. Consequently, fires can range from very small events affecting only a few trees to large events spanning a substantial portion of the grid. In a critical regime, the distribution of fire sizes extends across many different scales.
      </p>

      <p>
        The key mechanism is a balance between two competing processes. Tree growth gradually builds up larger and more connected regions, while fires periodically destroy them. When growth and ignition are sufficiently slow, the system has time to develop complex structures before they are disrupted. A single ignition can then encounter very different local configurations and trigger fires of widely varying sizes. The interplay between these processes can therefore drive the system toward a critical regime without requiring the parameters to be precisely tuned to a particular critical value.
      </p>

      <p>
        In the simulation, the behavior is analyzed through the distribution of fire sizes. The plot shows the complementary cumulative distribution, \\( P(S \\geq s) \\), in a log-log scale. The points represent the empirical distribution measured in the simulation, while the continuous curve is an exponential fit to the data. Away from the critical regime, the empirical distribution is well described by this exponential curve, indicating that the fires have a characteristic size. As the system approaches the self-organized critical regime, the distribution develops a broad tail and the empirical data become approximately linear on the log-log plot. In this regime, an exponential distribution can no longer provide a good fit, indicating that fire sizes extend across a much broader range of scales. For example, in the simulation a representative critical regime is obtained with a tree-growth probability of \\( P_{\\text{growth}} = 5\\times 10^{−3} \\) and a fire-ignition probability of \\( P_{\\text{fire}} = 10^{−5} \\).
      </p>

      <p>
        If tree growth or fire ignition becomes too frequent, the balance between accumulation and destruction is lost. The system then tends to produce either predominantly small fires or large, system-spanning events, rather than a broad distribution spanning many scales. The empirical distribution consequently departs from the approximately linear behavior seen in the critical regime and can again be described more closely by a characteristic-scale distribution.
      </p>
		`);
  }
}

// ----------------------
// Main entry point
// ----------------------
export class SOC {
  constructor({ renderer, plotter, ui, explanation }) {
    this.implementation = new SOCImplementation();

    this.ui = new SOCUI(ui);
    this.renderer = new SOCRenderer(renderer);
    this.plotter = new SOCPlotter(plotter);
    this.explanation = new SOCExplanation(explanation);
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
