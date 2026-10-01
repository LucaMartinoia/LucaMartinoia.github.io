// ----------------------
// Renderer
// ----------------------
export class Renderer {
  constructor() {
    this.container = document.getElementById("simulation-canvas");
    this.canvas = document.createElement("canvas");
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    this.offCanvas = document.createElement("canvas");
    this.offCtx = this.offCanvas.getContext("2d");

    this.overlay = document.createElement("div");
    this.overlay.classList.add("simulation-canvas-label");
    this.container.appendChild(this.overlay);

    this.overlayLabel = null;
    this.overlayValue = null;

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
  }

  clear(background = "#111") {
    this.ctx.fillStyle = background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImageData(imageData) {
    this.offCanvas.width = imageData.width;
    this.offCanvas.height = imageData.height;

    this.offCtx.putImageData(imageData, 0, 0);

    this.clear();
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.offCanvas, 0, 0, this.canvas.width, this.canvas.height);
  }

  setOverlay(label, value) {
    if (this.overlayLabel !== label) {
      this.overlay.innerHTML = `${label} = <span class="simulation-value"></span>`;
      this.overlayValue = this.overlay.querySelector(".simulation-value");
      this.overlayLabel = label;

      globalThis.MathJax?.typesetPromise?.([this.overlay]);
    }

    this.overlayValue.textContent = value;
  }

  clearOverlay() {
    this.overlay.innerHTML = "";
  }
}
