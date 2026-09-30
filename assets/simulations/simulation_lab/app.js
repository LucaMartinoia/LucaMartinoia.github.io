//----------------------------------------------
//
//    ENGINE
//
//----------------------------------------------
class Engine {
  constructor() {
    this.renderer = new Renderer();
    this.plotter = new Plotter();
    this.ui = new UI();
    this.explanation = new Explanation();

    this.running = false;
    this.renderCounter = 0;

    this.bindUI();
  }

  loadModel(model) {
    this.model = this.createModel(model);

    // reset loop state
    this.running = false;
    this.renderCounter = 0;

    const onParamChange = () => {
      this.plotter.render(this.model);
    };

    // initialize UI
    this.ui.render(this.model, onParamChange);
    this.plotter.render(this.model);
    this.explanation.render(this.model);
    this.renderer.render(this.model);

    this.start();
  }

  // Create model tabs
  bindUI() {
    const tabs = document.getElementById("simulation-tabs");

    const models = [
      ["ising", "Ising model"],
      ["SOC", "Self-criticality"],
      ["vicsek", "Vicsek"],
    ];

    models.forEach(([id, label], index) => {
      const button = document.createElement("button");

      button.classList.add("tab");
      if (index === 0) button.classList.add("active");

      button.dataset.model = id;
      button.textContent = label;

      button.addEventListener("click", () => {
        tabs.querySelectorAll("[data-model]").forEach((b) => {
          b.classList.remove("active");
        });

        button.classList.add("active");
        this.loadModel(id);
      });

      tabs.appendChild(button);
    });
  }

  createModel(name) {
    switch (name) {
      case "ising":
        return new IsingModel();
      case "SOC":
        return new SOCModel();
      case "vicsek":
        return new VicsekModel();
      default:
        throw new Error(`Unknown model: ${name}`);
    }
  }

  // ------------------
  // Animation loops
  // ------------------
  start() {
    if (!this.model) return;

    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    this.renderCounter = 0;
  }

  loop() {
    if (!this.running) return;

    this.step();
    requestAnimationFrame(() => this.loop());
  }

  step() {
    const onModelChange = () => {
      this.plotter.render(this.model);
    };

    this.model.update(onModelChange);

    this.renderCounter++;

    if (this.renderCounter >= this.model.framesPerStep()) {
      this.renderCounter = 0;

      this.renderer.render(this.model);
    }
  }
}

//----------------------------------------------
//
//    RENDERER
//
//----------------------------------------------
class Renderer {
  constructor() {
    // Attach to simulation container
    this.container = document.getElementById("simulation-canvas");

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Create off-screen element for scaling purposes
    this.offCanvas = document.createElement("canvas");
    this.offCtx = this.offCanvas.getContext("2d");

    // Create mathematical overlay
    this.overlay = document.createElement("div");
    this.overlay.classList.add("simulation-canvas-label");
    this.container.appendChild(this.overlay);

    // Resize handler
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  setOverlay(label, value) {
    if (this.overlayLabel !== label) {
      this.overlay.innerHTML = `${label} = <span class="simulation-value"></span>`;
      this.overlayValue = this.overlay.querySelector(".simulation-value");
      this.overlayLabel = label;

      MathJax.typesetPromise([this.overlay]);
    }

    this.overlayValue.textContent = value;
  }

  clearOverlay() {
    this.overlay.innerHTML = "";
    this.overlayValue = null;
    this.overlayLabel = null;
  }

  // ---------------
  //  ENTRY POINT
  // ---------------
  render(model) {
    this.clearOverlay();
    model.renderOn(this);
  }

  // ------------
  //  ISING
  // ------------
  Ising(model) {
    const { spins, N, M } = model.getData();
    // Takes and imageData, draws in offCanvas
    // and scale the offCanva into the real one
    const W = this.canvas.width;
    const H = this.canvas.height;
    const offCanvas = this.offCanvas;

    const imageData = this.imageIsing(spins, N);

    offCanvas.width = imageData.width;
    offCanvas.height = imageData.height;
    this.offCtx.putImageData(imageData, 0, 0);

    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.imageSmoothingEnabled = false;

    this.ctx.drawImage(
      offCanvas,
      0, 0,
      offCanvas.width,
      offCanvas.height,
      0, 0,
      W, H
    );

    this.setOverlay("\\(\\langle M\\rangle\\)", M.toFixed(3));
  }

  imageIsing(spins, N) {
    // produce ImageData with nice red/blue colors
    const img = new ImageData(N, N);
    const data = img.data;

    // define colors for -1 and +1 spins
    const blue = [38, 139, 210]; // steelblue-ish
    const red = [220, 50, 47]; // crimson-ish

    for (let i = 0; i < spins.length; i++) {
      const idx = i * 4;
      const spin = spins[i];

      const color = spin === 1 ? red : blue;

      data[idx + 0] = color[0];
      data[idx + 1] = color[1];
      data[idx + 2] = color[2];
      data[idx + 3] = 255; // alpha fully opaque
    }

    return img;
  }

  // ------------
  //  SOC
  // ------------
  SOC(model) {
    const { grid, N } = model.getData();

    const W = this.canvas.width;
    const H = this.canvas.height;
    const offCanvas = this.offCanvas;

    const imageData = this.imageSOC(grid, N);

    this.offCanvas.width = imageData.width;
    this.offCanvas.height = imageData.height;
    this.offCtx.putImageData(imageData, 0, 0);

    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(0, 0, W, H);

    this.ctx.imageSmoothingEnabled = false;

    this.ctx.drawImage(
      offCanvas,
      0, 0,
      offCanvas.width,
      offCanvas.height,
      0, 0,
      W, H
    );
  }

  imageSOC(grid, N) {
    const img = new ImageData(N, N);
    const data = img.data;

    // states:
    // 0 = empty
    // 1 = tree
    // 2 = burning
    const empty = [30, 30, 30]; // dark background
    const tree = [34, 139, 34]; // green
    const fire = [255, 80, 0]; // orange/red

    for (let i = 0; i < grid.length; i++) {
      const idx = i * 4;
      const s = grid[i];

      let color;
      if (s === 1) color = tree;
      else if (s === 2) color = fire;
      else color = empty;

      data[idx + 0] = color[0];
      data[idx + 1] = color[1];
      data[idx + 2] = color[2];
      data[idx + 3] = 255;
    }

    return img;
  }

  // ------------
  //  Vicsek
  // ------------
  Vicsek(model) {
    const { x, y, theta, N, L } = model.getData();

    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // clear background
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, H);

    // scale from unit box → canvas
    const scale = Math.min(W, H);
    const scaleX = W / scale;

    // triangle size (in pixels)
    const size = 6;

    ctx.fillStyle = "#1f77b4";

    for (let i = 0; i < N; i++) {
      // map to screen coordinates
      const px = x[i] * scale * scaleX;
      const py = y[i] * scale;

      const angle = theta[i];

      // triangle pointing along angle
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(size, 0); // tip
      ctx.lineTo(-size * 0.6, size * 0.4);
      ctx.lineTo(-size * 0.6, -size * 0.4);
      ctx.closePath();

      ctx.fill();
      ctx.restore();
    }

    // draw order parameter
    const phi = model.orderParam;
    this.setOverlay("\\(\\phi\\)", phi.toFixed(3));
  }
}

//----------------------------------------------
//
//    SETTINGS
//
//----------------------------------------------
class UI {
  constructor() {
    this.container = document.getElementById("simulation-parameters");
  }

  init() {
    this.container.innerHTML = "";
  }

  // -------------------------
  // Entry point
  // -------------------------
  render(model, onParamChange) {
    this.init();
    model.paramsOn(this, onParamChange);
  }

  // -------------------------
  // Slider factory
  // -------------------------
  createSlider({ label, min, max, step, value, onInput, onChange, format = (v) => v }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("simulation-slider-wrapper");

    // label line
    const labelEl = document.createElement("label");
    labelEl.classList.add("simulation-slider-label");

    const labelText = document.createElement("span");
    labelText.textContent = label + ": ";

    const valueText = document.createElement("span");
    valueText.textContent = format(value);

    labelEl.appendChild(labelText);
    labelEl.appendChild(valueText);

    // slider
    const slider = document.createElement("input");
    slider.classList.add("simulation-slider");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    const update = (v) => {
      valueText.textContent = format(v);
    };

    if (onInput) {
      slider.oninput = (e) => {
        const v = parseFloat(e.target.value);
        update(v);
        onInput(v);
      };
    }

    if (onChange) {
      slider.oninput = (e) => {
        const v = parseFloat(e.target.value);
        update(v);
        onChange(v);
      };
    }

    wrapper.appendChild(labelEl);
    wrapper.appendChild(slider);

    return wrapper;
  }

  // -------------------------
  // Ising
  // -------------------------
  Ising(model, onParamChange) {
    const { N, T } = model.getParams();

    const tempSlider = this.createSlider({
      label: "Temperature",
      min: 0.1,
      max: 4.0,
      step: 0.01,
      value: T,
      onChange: (v) => {
        model.setTemperature(v);
        onParamChange?.();
      },
      format: (v) => v.toFixed(2),
    });

    const sizeSlider = this.createSlider({
      label: "Size",
      min: 80,
      max: 300,
      step: 10,
      value: N,
      onChange: (v) => {
        model.setSize(v);
        onParamChange?.();
      },
      format: (v) => v,
    });

    this.container.appendChild(tempSlider);
    this.container.appendChild(sizeSlider);
  }

  // -------------------------
  // SOC
  // -------------------------
  SOC(model, onParamChange) {
    const { p, p_min, p_max, f, f_min, f_max } = model.getParams();

    const pSlider = this.createSlider({
      label: "Growth probability",
      min: p_min,
      max: p_max,
      step: 0.001,
      value: p,
      onChange: (v) => {
        model.setParams({ p: v, f: model.f });
        onParamChange?.();
      },
      format: (v) => v.toFixed(4),
    });

    const fSlider = this.createSlider({
      label: "Fire probability",
      min: f_min,
      max: f_max,
      step: 0.00001,
      value: f,
      onChange: (v) => {
        model.setParams({ p: model.p, f: v });
        onParamChange?.();
      },
      format: (v) => v.toFixed(5),
    });

    this.container.appendChild(pSlider);
    this.container.appendChild(fSlider);
  }

  // -------------------------
  // Vicsek
  // -------------------------
  Vicsek(model, onParamChange) {
    const { noise, noise_min, noise_max, r, r_min, r_max } = model.getParams();

    const noiseSlider = this.createSlider({
      label: "Noise",
      min: noise_min,
      max: noise_max,
      step: 0.01,
      value: noise,
      onChange: (v) => {
        model.setParams(v, model.r);
        onParamChange?.();
      },
      format: (v) => v.toFixed(3),
    });

    const rSlider = this.createSlider({
      label: "Interaction radius",
      min: r_min,
      max: r_max,
      step: 0.001,
      value: r,
      onChange: (v) => {
        model.setParams(model.noise, v);
        onParamChange?.();
      },
      format: (v) => v.toFixed(3),
    });

    this.container.appendChild(noiseSlider);
    this.container.appendChild(rSlider);
  }
}

//----------------------------------------------
//
//    PLOTTER
//
//----------------------------------------------
class Plotter {
  constructor() {
    this.div = document.getElementById("simulation-plots");

    this.plot = document.createElement("div");
    this.plot.id = "simulation-plot";

    const pre = document.createElement("pre");
    pre.style.display = "none";

    const code = document.createElement("code");
    code.textContent = JSON.stringify({ data: [] });

    pre.appendChild(code);
    this.div.appendChild(pre);
    this.div.appendChild(this.plot);

    this.height = 200;
    this.margin = { t: 30, b: 50, l: 60, r: 20 };
  }

  clearPlots() {
      Plotly.purge(this.plot);
  }

  // -----------------
  // Entry point
  // -----------------
  render(model) {
    this.clearPlots();
    model.plotOn(this);
  }

  // -----------------
  // Ising
  // -----------------
  Ising(model) {
    const vlineColor = "#ff7f0e";

    const { Tarr, Marr, M_interp, T } = model.getPlotData();

    const plotData = [
      // --- Magnetization ---
      {
        x: Tarr,
        y: Marr,
        mode: "lines",
        line: { width: 3, color: "#1f77b4" },
        xaxis: "x",
        yaxis: "y",
        name: "M",
        showlegend: false,
      },

      {
        x: [T, T],
        y: [0, M_interp],
        mode: "lines+markers",
        line: { width: 2, dash: "dot", color: vlineColor },
        marker: { size: 8, color: vlineColor },
        xaxis: "x",
        yaxis: "y",
        showlegend: false,
      },
    ];

    const layout = {
      grid: {
        rows: 1,
        columns: 1,
        pattern: "independent",
        roworder: "top to bottom",
        ygap: 0.4,
      },

      xaxis: { title: { text: "T", standoff: 5 } },
      yaxis: { title: { text: "M", standoff: 5 }, range: [0, 1] },

      annotations: [
        {
          x: 0.98,
          y: 0.98,
          xref: "x domain",
          yref: "y domain",
          text: `M = ${M_interp.toFixed(3)}`,
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

      margin: this.margin,
      height: this.height,
    };

    Plotly.react(this.plot, plotData, layout, { responsive: true });
  }

  // -----------------
  // SOC
  // -----------------
  SOC(model) {
    const { data, theory, N } = model.getPlotData();

    const x = data.map((d) => d.s);
    const y = data.map((d) => d.p);

    const x_th = theory.map((d) => d.s);
    const y_th = theory.map((d) => d.p);

    const plotData = [
      // --- empirical ---
      {
        x,
        y,
        mode: "markers",
        marker: {
          size: 6,
          color: "#1f77b4",
        },
        name: "empirical",
        showlegend: true,
      },

      // --- theoretical exponential ---
      {
        x: x_th,
        y: y_th,
        mode: "lines",
        line: {
          width: 2,
          color: "#d62728",
        },
        name: "exp tail",
        showlegend: true,
      },
    ];

    const layout = {
      xaxis: {
        title: { text: "Avalanche size s", standoff: 5 },
        type: "log",
        range: [Math.log10(1), Math.log10(N * N)],
      },
      yaxis: {
        title: { text: "P(s)", standoff: 5 },
        type: "log",
        range: [Math.log10(1e-5), Math.log10(1)],
      },
      legend: {
        x: 0.98,
        y: 0.98,
        xanchor: "right",
        yanchor: "top",
        bgcolor: "rgba(255,255,255,0.7)",
      },

      margin: this.margin,
      height: this.height,

      annotations: [
        {
          text: "SOC avalanche distribution",
          x: 0.5,
          y: 1.2,
          xref: "paper",
          yref: "paper",
          showarrow: false,
          font: { size: 14 },
        },
      ],
    };

    Plotly.react(this.plot, plotData, layout, { responsive: true });
  }

  // -------------------------
  // Vicsek
  // -------------------------
  Vicsek(model) {
    const { phi, t } = model.getPlotData();

    const plotData = [
      {
        x: t,
        y: phi,
        mode: "lines",
        line: { width: 2, color: "#1f77b4" },
        name: "order parameter",
        showlegend: false,
      },
    ];

    const layout = {
      xaxis: {
        title: { text: "time", standoff: 5 },
      },
      yaxis: {
        title: { text: "φ", standoff: 5 },
        range: [0, 1],
      },
      margin: this.margin,
      height: this.height,

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

    Plotly.react(this.plot, plotData, layout, { responsive: true });
  }
}

//----------------------------------------------
//
//    EXPLANATION
//
//----------------------------------------------
class Explanation {
  constructor() {
    this.div = document.getElementById("simulation-text");
  }

  clearText() {
    this.div.innerHTML = "";
  }

  // -----------------
  // Entry point
  // -----------------
  render(model) {
    this.clearText();
    model.explainOn(this);
  }

  // -----------------
  // Ising
  // -----------------
  Ising() {
    this.div.innerHTML = `
      <b>Ising model</b><br>
      Phase transitions are changes in the state of a system when an external condition, such as temperature, is varied. A familiar example is water turning into ice. In some systems, the change is smooth at the microscopic level but leads to sudden, large-scale effects; these are called second-order (or continuous) phase transitions. Near such transitions, small fluctuations can propagate over long distances, and physical quantities can change very rapidly.

      The Ising model is a simple mathematical model used to study this kind of behavior. It consists of a square grid of points, where each point carries a “spin” that can be either +1 or −1. You can think of each spin as a tiny magnet that can point up or down. The spins interact only with their nearest neighbors on the grid.

      Two competing effects determine the behavior of the system. Neighboring spins tend to align with each other, which promotes order. At the same time, temperature introduces random fluctuations that tend to disrupt this alignment. At low temperature, alignment dominates and most spins point in the same direction, so the system is ordered. At high temperature, randomness dominates and the spins are disordered, with roughly equal numbers of +1 and −1. The transition between these two regimes happens at a specific temperature, called the critical temperature, where the system changes rapidly from ordered to disordered. A useful quantity to describe this is the average magnetization, which measures the overall alignment of the spins.

      The simulation shown here uses Monte Carlo methods to reproduce this behavior numerically. Starting from a random configuration, the system is updated step by step according to probabilistic rules that mimic thermal fluctuations. Far from the critical temperature, a simple update rule (Metropolis algorithm) is sufficient, while near the transition a more efficient cluster-based method (Wolff algorithm) is used. The plot compares the measured magnetization from the simulation with the theoretical prediction for an infinitely large system. The agreement is good away from the critical point, while near the transition finite-size effects make the simulated system deviate from the ideal behavior. Increasing the size of the lattice (i.e., using more spins) reduces these finite-size effects and improves the agreement with the theoretical curve.`;
  }

  // -----------------
  // SOC
  // -----------------
  SOC() {
    this.div.innerHTML = `
      <b>Self-organized criticality</b><br>
      Self-organized criticality (SOC) describes systems that naturally evolve toward a special state where events of all sizes occur, without the need to fine-tune external parameters. In this state, small disturbances can sometimes trigger very large responses, and there is no single “typical” scale for the events. This is often reflected in broad, scale-free distributions rather than simple exponential decay.

      A standard example is the forest-fire model. The system is a grid where each cell can be empty or contain a tree. Trees grow slowly over time, while fires start randomly and spread to neighboring trees, burning entire connected clusters. As a result, fires can be very small (burning just a few trees) or very large (spanning a significant portion of the grid). When the system operates in the SOC regime, the distribution of fire sizes includes events across many scales.

      The key mechanism is again a balance between competing processes. Tree growth gradually builds up large connected regions, while fires destroy them. If growth is slow and fires are rare, the system has time to develop complex structures, and a single ignition can lead to fires of widely varying sizes. This interplay drives the system toward a critical state without external tuning.

      In the simulation, this behavior is analyzed through the distribution of fire sizes. The plot shows the probability density: the continuous curve represents an exponential decay (which would indicate a characteristic size), while the points are the empirical data from the simulation. In the SOC regime—when both the growth rate and the fire ignition rate are small, and one is much smaller than the other—the empirical data deviates from the exponential tail, signaling the presence of events across many scales. If instead growth or ignition becomes too frequent, this balance is lost: the system either produces mostly system-wide fires or mostly very small ones, and the distribution follows the exponential behavior more closely.
    `;
  }

  // -------------------------
  // Vicsek
  // -------------------------
  Vicsek(model) {
    this.div.innerHTML = `
      <b>Vicsek</b><br>
      The Vicsek model is a simple model used to study how coordinated, collective motion can emerge from many individual agents following very basic rules. It is often used to describe phenomena such as flocks of birds, schools of fish, or groups of moving particles. Unlike equilibrium systems, this is an example of an out-of-equilibrium system, where continuous motion and local interactions drive the dynamics.

      In the model, each agent moves at constant speed in space and adjusts its direction at each step to align with the average direction of its neighbors, with some added noise. This noise represents randomness or uncertainty in the alignment. Even though each agent only interacts locally, the system can display a global transition: from disordered motion, where agents move in random directions, to ordered motion, where a large fraction of agents move coherently in the same direction.

      The key mechanism is again a competition. Alignment tends to create order by making agents follow their neighbors, while noise tends to disrupt this coherence. At high noise, the system remains disordered. As noise is reduced, a transition occurs where collective motion suddenly emerges. This transition shares similarities with phase transitions, although it takes place in a non-equilibrium setting.

      In the simulation, this behavior is quantified through an order parameter, defined as the average (normalized) velocity of all agents, which measures how aligned the system is. The plot shows the order parameter as a function of time.
    `;
  }
}

//----------------------------------------------
//
//    ISING
//
//----------------------------------------------
class IsingModel {
  static T_c = 2 / Math.log(1 + Math.sqrt(2));

  constructor() {
    this.T = 1.5;
    this.setSize(100);

    this.Twindow = 0.3; // Window around T_c
    this.alpha = 0.2;
  }

  // ------------------
  //  Setter methods
  // ------------------
  setTemperature(T) {
    this.T = T; // temperature (controls acceptance probability)

    this.initialize();
  }

  setSize(N) {
    this.N = N; // linear system size (grid is N x N)
    this.spins = new Int8Array(N * N); // flat array storing spins ±1
    this.stepsN = N * N; // Number of Monte Carlo steps per update
    this.corrTime = N; // Correlation time estimate

    this.initialize(); // initialize system in random state
  }

  initialize() {
    this.mt = 0; // reset magnetization
    this.Mabs = 0; // Magnetization
    this.time = 0; // Monte Carlo time [int]

    this.phaseTransition = this.T > IsingModel.T_c && this.T < IsingModel.T_c + this.Twindow;
    this.method = this.phaseTransition ? "wolff" : "metropolis";

    // assign each spin randomly to ±1 (infinite temperature initial condition)
    for (let i = 0; i < this.spins.length; i++) {
      this.spins[i] = Math.random() < 0.5 ? -1 : 1;
      this.mt += this.spins[i];
    }
  }

  // ------------------
  //  Update
  // ------------------
  update() {
    // choose dynamics depending on temperature
    if (this.phaseTransition) {
      // --- Wolff step near criticality
      this.wolffStep();
    } else {
      // --- Full Metropolis sweep away from Tc
      for (let i = 0; i < this.stepsN; i++) {
        this.metropolisStep();
      }
    }

    this.time += 1;

    // measure only every corrTime sweeps
    if (this.time % this.corrTime === 0) {
      const norm = this.N * this.N;

      const m = this.mt / norm;

      // EMA smoothing
      this.Mabs = (1 - this.alpha) * this.Mabs + this.alpha * Math.abs(m);
    }
  }

  index(i, j) {
    const N = this.N;

    // periodic boundary conditions:
    return ((i + N) % N) * N + ((j + N) % N);
  }

  metropolisStep() {
    const N = this.N;

    // pick a random lattice site
    const i = Math.floor(Math.random() * N);
    const j = Math.floor(Math.random() * N);

    const idx = this.index(i, j);
    const s = this.spins[idx]; // current spin (+1 or -1)

    // sum of nearest neighbors (4-neighbor lattice)
    const sum =
      this.spins[this.index(i - 1, j)] + this.spins[this.index(i + 1, j)] + this.spins[this.index(i, j - 1)] + this.spins[this.index(i, j + 1)];

    // energy change ΔE if this spin is flipped
    // (J = 1 assumed, standard normalization)
    const dE = 2 * s * sum;

    // Metropolis acceptance rule:
    if (dE <= 0 || Math.random() < Math.exp(-dE / this.T)) {
      this.spins[idx] = -s; // flip spin
      this.mt -= 2 * s;
    }
  }

  wolffStep() {
    const N = this.N;
    const spins = this.spins;

    // pick random seed
    const i0 = Math.floor(Math.random() * N);
    const j0 = Math.floor(Math.random() * N);
    const seedIdx = this.index(i0, j0);
    const spin0 = spins[seedIdx];

    // bond probability
    const p = 1 - Math.exp(-2 / this.T);

    // cluster storage
    const stack = [seedIdx];
    const cluster = new Set([seedIdx]);

    while (stack.length > 0) {
      const idx = stack.pop();

      const i = Math.floor(idx / N);
      const j = idx % N;

      // check 4 neighbors
      const neighbors = [this.index(i + 1, j), this.index(i - 1, j), this.index(i, j + 1), this.index(i, j - 1)];

      for (const nIdx of neighbors) {
        // only consider same-spin neighbors not already in cluster
        if (spins[nIdx] === spin0 && !cluster.has(nIdx)) {
          if (Math.random() < p) {
            cluster.add(nIdx);
            stack.push(nIdx);
          }
        }
      }
    }

    // flip entire cluster
    let deltaM = 0;

    for (const idx of cluster) {
      const s = spins[idx];
      spins[idx] = -s;
      deltaM -= 2 * s;
    }
    this.mt += deltaM;
  }

  // ------------------
  //  Getter methods
  // ------------------
  getData() {
    return { spins: this.spins, N: this.N, M: this.Mabs };
  }

  getParams() {
    return { N: this.N, T: this.T };
  }

  getPlotData() {
    const Tc = IsingModel.T_c;

    const Tmin = 0.01;
    const Tmax = 4;
    const dT = 0.01;

    const N = Math.floor((Tmax - Tmin) / dT) + 1;

    const Tarr = new Array(N);
    const Marr = new Array(N);

    for (let k = 0; k < N; k++) {
      const t = Tmin + k * dT;
      Tarr[k] = t;

      if (t < Tc) {
        const x = Math.sinh(2 / t);
        const x2 = x * x;
        const x4 = x2 * x2;

        const inside = 1 - 1 / x4;

        // numerical safety (avoid tiny negative due to floating error)
        Marr[k] = inside > 0 ? Math.pow(inside, 1 / 8) : 0;
      } else {
        Marr[k] = 0;
      }
    }

    // ---- interpolation ----
    const idx = (this.T - Tmin) / dT;
    const i = Math.max(0, Math.min(N - 2, Math.floor(idx)));

    const t1 = Tarr[i];
    const t2 = Tarr[i + 1];
    const m1 = Marr[i];
    const m2 = Marr[i + 1];

    const alpha = (this.T - t1) / (t2 - t1);
    const M_interp = m1 + alpha * (m2 - m1);

    return {
      Tarr,
      Marr,
      M_interp,
      T: this.T,
    };
  }

  // -----------------
  //  Entry points
  // -----------------
  renderOn(renderer) {
    renderer.Ising(this);
  }

  paramsOn(ui, onParamChange) {
    ui.Ising(this, onParamChange);
  }

  plotOn(plotter) {
    plotter.Ising(this);
  }

  explainOn(explainer) {
    explainer.Ising(this);
  }

  framesPerStep() {
    return this.method === "wolff" ? 10 : 1;
  }
}

//----------------------------------------------
//
//    Self-organized criticality
//
//----------------------------------------------
class SOCModel {
  constructor() {
    this.setSize(300);

    // probabilities
    this.p = 0.005; // tree growth
    this.f = 0.00001; // lightning

    this.p_min = 0.001;
    this.p_max = 0.5;

    this.f_min = 0.000001;
    this.f_max = 0.001;

    this.initialize();
  }

  // ------------------
  //  Setter methods
  // ------------------
  setSize(N) {
    this.N = N;
    this.grid = new Uint8Array(N * N); // 0 empty, 1 tree, 2 burning
    this.initialize();
  }

  setParams({ p, f }) {
    this.p = p;
    this.f = f;
    this.initialize();
  }

  initialize() {
    this.time = 0;

    this.fireSizes = [];
    this.currentFireSize = 0;
    this.wasBurning = false;

    this.theoryData = null;

    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] = 0;
    }
  }

  index(i, j) {
    const N = this.N;
    return ((i + N) % N) * N + ((j + N) % N);
  }

  // ------------------
  //  Update
  // ------------------
  update(onModelChange) {
    const N = this.N;
    const old = this.grid;
    const newGrid = new Uint8Array(old.length);

    // -------------------------------------------------
    // 1. detect whether fire exists in current state
    // -------------------------------------------------
    let wasBurning = false;
    for (let i = 0; i < old.length; i++) {
      if (old[i] === 2) {
        wasBurning = true;
        break;
      }
    }

    // -------------------------------------------------
    // 2. evolve system (propagation + extinction only)
    // -------------------------------------------------
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const idx = this.index(i, j);
        const state = old[idx];

        if (state === 2) {
          newGrid[idx] = 0; // burning -> empty
          continue;
        }

        if (state === 1) {
          const up = old[this.index(i - 1, j)];
          const down = old[this.index(i + 1, j)];
          const left = old[this.index(i, j - 1)];
          const right = old[this.index(i, j + 1)];

          const hasFire = up === 2 || down === 2 || left === 2 || right === 2;

          newGrid[idx] = hasFire ? 2 : 1;
          continue;
        }

        // empty stays empty for now (growth handled later)
        newGrid[idx] = 0;
      }
    }

    // -------------------------------------------------
    // 3. avalanche bookkeeping (burning cells count)
    // -------------------------------------------------
    let burningNow = false;

    for (let i = 0; i < newGrid.length; i++) {
      if (newGrid[i] === 2) {
        burningNow = true;
        this.currentFireSize++;
      }
    }

    // -------------------------------------------------
    // 4. growth + lightning only if system is calm
    // -------------------------------------------------
    if (!burningNow) {
      for (let i = 0; i < newGrid.length; i++) {
        if (newGrid[i] === 0) {
          if (Math.random() < this.p) {
            newGrid[i] = 1;
          }
        } else if (newGrid[i] === 1) {
          if (Math.random() < this.f) {
            newGrid[i] = 2;
          }
        }
      }
    }

    // -------------------------------------------------
    // 5. commit avalanche when fire ends
    // -------------------------------------------------
    if (this.wasBurning && !burningNow) {
      if (this.currentFireSize > 0) {
        this.fireSizes.push(this.currentFireSize);
        onModelChange();
      }
      this.currentFireSize = 0;
    }

    this.wasBurning = burningNow;
    this.grid = newGrid;
    this.time++;
  }
  // ------------------
  // Getter methods
  // ------------------
  getData() {
    return { grid: this.grid, N: this.N };
  }

  getParams() {
    return {
      p: this.p,
      p_min: this.p_min,
      p_max: this.p_max,
      f: this.f,
      f_min: this.f_min,
      f_max: this.f_max,
    };
  }

  getPlotData() {
    const sizes = this.fireSizes;

    // -------------------------
    // 1. empirical histogram
    // -------------------------
    const hist = new Map();

    for (const s of sizes) {
      if (s <= 0) continue;
      const k = Math.floor(Math.log(s));
      hist.set(k, (hist.get(k) || 0) + 1);
    }

    const Nsamples = sizes.length;
    const data = [];

    for (const [k, count] of hist.entries()) {
      const s = Math.exp(k);
      const p = count / Nsamples / s; // Jacobian
      data.push({ s, p });
    }

    data.sort((a, b) => a.s - b.s);

    // -------------------------
    // 2. fixed theory curve
    // -------------------------
    if (!this.theoryData) {
      const sMin = 1;
      const sMax = this.N * this.N;

      const nPoints = 200; // dense, smooth curve
      const logMin = Math.log(sMin);
      const logMax = Math.log(sMax);

      const s0 = this.N; // or N^2 depending on how sharp you want decay

      this.theoryData = [];

      for (let i = 0; i < nPoints; i++) {
        const t = i / (nPoints - 1);
        const logS = logMin + t * (logMax - logMin);
        const s = Math.exp(logS);

        const p = (0.1 * Math.exp(-s / s0)) / s;

        this.theoryData.push({ s, p });
      }
    }

    return {
      data,
      theory: this.theoryData,
      N: this.N,
    };
  }

  // ------------------
  // Entry points
  // ------------------
  renderOn(renderer) {
    renderer.SOC(this);
  }

  paramsOn(ui, onParamChange) {
    ui.SOC(this, onParamChange);
  }

  plotOn(plotter) {
    plotter.SOC(this);
  }

  explainOn(explainer) {
    explainer.SOC(this);
  }

  framesPerStep() {
    return 2;
  }
}

//----------------------------------------------
//
//    Vicsek
//
//----------------------------------------------
class VicsekModel {
  constructor() {
    // ------------------
    // parameters
    // ------------------
    this.N = 200; // number of particles
    this.L = 1.0; // box size (assume unit square)
    this.r = 0.05; // interaction radius (alignment radius)
    this.r_min = 0.01;
    this.r_max = 0.1;
    this.v0 = 0.003; // self-propulsion speed
    this.noise = 1.5; // angular noise strength
    this.noise_min = 0.1;
    this.noise_max = 1.5;

    // averaging / observables
    this.avgWindow = 100;
    this.orderParam = 0;
    this.maxHistory = 2000;
    this.lastPlotTime = 0;

    this.setSize(this.N);
  }

  // ------------------
  // setter methods
  // ------------------
  setParams(eta, r) {
    this.noise = eta;
    this.r = r;
  }

  setSize(N) {
    this.N = N;

    // positions (x, y)
    this.x = new Float32Array(N);
    this.y = new Float32Array(N);

    // velocities (angle representation)
    this.theta = new Float32Array(N);

    // auxiliary storage
    this.vx = new Float32Array(N);
    this.vy = new Float32Array(N);

    this.initialize();
  }

  initialize() {
    this.time = 0;

    // random positions in unit box
    for (let i = 0; i < this.N; i++) {
      this.x[i] = Math.random() * this.L;
      this.y[i] = Math.random() * this.L;

      this.theta[i] = Math.random() * 2 * Math.PI;

      this.vx[i] = this.v0 * Math.cos(this.theta[i]);
      this.vy[i] = this.v0 * Math.sin(this.theta[i]);
    }

    this.orderParam = 0;
    this.orderHistory = [];
    this.timeHistory = [];
  }

  // ------------------
  // update
  // ------------------
  update(onModelChange) {
    const N = this.N;
    const L = this.L;
    const r2 = this.r * this.r;

    const x = this.x;
    const y = this.y;
    const theta = this.theta;

    // temporary storage for new angles
    const newTheta = new Float32Array(N);

    // -----------------------------
    // alignment + noise
    // -----------------------------
    for (let i = 0; i < N; i++) {
      let sumx = 0;
      let sumy = 0;

      const xi = x[i];
      const yi = y[i];

      for (let j = 0; j < N; j++) {
        // periodic distance
        let dx = x[j] - xi;
        let dy = y[j] - yi;

        dx -= Math.round(dx / L) * L;
        dy -= Math.round(dy / L) * L;

        const dist2 = dx * dx + dy * dy;

        if (dist2 < r2) {
          sumx += Math.cos(theta[j]);
          sumy += Math.sin(theta[j]);
        }
      }

      // average direction
      const angle = Math.atan2(sumy, sumx);

      // add angular noise (uniform in [-noise/2, noise/2])
      const eta = this.noise * (Math.random() - 0.5);

      newTheta[i] = angle + eta;
    }

    // -----------------------------
    // update state
    // -----------------------------
    for (let i = 0; i < N; i++) {
      theta[i] = newTheta[i];

      // update direction vectors (unit)
      this.vx[i] = Math.cos(theta[i]);
      this.vy[i] = Math.sin(theta[i]);

      // move with speed v0
      x[i] += this.v0 * this.vx[i];
      y[i] += this.v0 * this.vy[i];

      // periodic boundary conditions
      if (x[i] < 0) x[i] += L;
      if (x[i] >= L) x[i] -= L;
      if (y[i] < 0) y[i] += L;
      if (y[i] >= L) y[i] -= L;
    }

    // -----------------------------
    // order parameter
    // -----------------------------
    let vxSum = 0;
    let vySum = 0;

    for (let i = 0; i < N; i++) {
      vxSum += this.vx[i];
      vySum += this.vy[i];
    }

    const vnorm = Math.sqrt(vxSum * vxSum + vySum * vySum);
    const phi = vnorm / N;

    // EMA smoothing
    const alpha = 2 / (this.avgWindow + 1);
    this.orderParam = (1 - alpha) * this.orderParam + alpha * phi;

    this.orderHistory.push(this.orderParam);
    this.timeHistory.push(this.time);

    // keep bounded memory
    if (this.orderHistory.length > this.maxHistory) {
      this.orderHistory.shift();
      this.timeHistory.shift();
    }

    if (performance.now() - this.lastPlotTime > 100) {
      onModelChange();
      this.lastPlotTime = performance.now();
    }

    this.time++;
  }

  // ------------------
  // getter methods
  // ------------------
  getData() {
    return {
      x: this.x,
      y: this.y,
      theta: this.theta,
      N: this.N,
      order: this.orderParam,
    };
  }

  getParams() {
    return {
      noise: this.noise,
      noise_min: this.noise_min,
      noise_max: this.noise_max,
      r: this.r,
      r_min: this.r_min,
      r_max: this.r_max,
    };
  }

  getPlotData() {
    return {
      phi: this.orderHistory,
      t: this.timeHistory,
    };
  }

  // ------------------
  // entry points (Engine dispatch)
  // ------------------
  renderOn(renderer) {
    renderer.Vicsek(this);
  }

  paramsOn(ui) {
    ui.Vicsek(this);
  }

  plotOn(plotter) {
    plotter.Vicsek(this);
  }

  explainOn(explainer) {
    explainer.Vicsek(this);
  }

  framesPerStep() {
    return 1;
  }
}

//----------------------------------------------
//
//    MAIN APP
//
//----------------------------------------------

const engine = new Engine();

engine.loadModel("ising");
