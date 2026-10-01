import { UI } from "../common/ui.js";
import { Renderer } from "../common/renderer.js";
import { Explanation } from "../common/explanation.js";
import { Plotter } from "../common/plotter.js";

import { Ising } from "./assets/ising.js";
import { SOC } from "./assets/soc.js";
import { Vicsek } from "./assets/vicsek.js";

// ----------------------
// Main app Engine
// ----------------------
export class Engine {
  constructor() {
    this.renderer = new Renderer();
    this.plotter = new Plotter();
    this.ui = new UI();
    this.explanation = new Explanation();

    this.models = new Map();
    this.model = null;
    this.running = false;
    this.animationFrame = null;
    this.activeButton = null;
    this.tabs = document.getElementById("simulation-tabs");
  }

  registerModel({ id, label, create }) {
    if (this.models.has(id)) {
      throw new Error(`Model already registered: ${id}`);
    }

    const entry = { create, button: null };
    this.models.set(id, entry);

    if (this.tabs) {
      const button = document.createElement("button");
      button.classList.add("tab");
      button.dataset.model = id;
      button.textContent = label;
      button.addEventListener("click", () => this.selectModel(id));
      this.tabs.appendChild(button);
      entry.button = button;
    }

    if (!this.model) {
      this.selectModel(id);
    }
  }

  selectModel(id) {
    const entry = this.models.get(id);
    if (!entry) {
      throw new Error(`Unknown model: ${id}`);
    }

    if (this.activeButton) {
      this.activeButton.classList.remove("active");
    }

    entry.button?.classList.add("active");
    this.activeButton = entry.button;

    this.loadModel(
      new entry.create({
        renderer: this.renderer,
        plotter: this.plotter,
        ui: this.ui,
        explanation: this.explanation,
      })
    );
  }

  loadModel(model) {
    this.stop();
    this.model = model;

    this.ui.clear();
    this.renderer.clearOverlay();

    this.model.configureUI(() => this.model.plot());
    this.model.plot();
    this.model.explain();
    this.model.render();

    this.start();
  }

  start() {
    if (!this.model || this.running) return;

    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  loop() {
    if (!this.running) return;

    this.step();
    this.animationFrame = requestAnimationFrame(() => this.loop());
  }

  step() {
    this.model.update(() => this.model.plot());
    this.model.render();
  }
}

// ----------------------
// Entry point
// ----------------------
export const engine = new Engine();

engine.registerModel({
  id: "ising",
  label: "Ising model",
  create: Ising,
});

engine.registerModel({
  id: "SOC",
  label: "Self-criticality",
  create: SOC,
});

engine.registerModel({
  id: "vicsek",
  label: "Vicsek",
  create: Vicsek,
});
