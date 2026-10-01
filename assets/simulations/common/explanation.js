// ----------------------
// Explainer
// ----------------------
export class Explanation {
  constructor() {
    this.container = document.getElementById("simulation-text");
  }

  clear() {
    this.container.innerHTML = "";
  }

  setContent(html) {
    this.container.innerHTML = html;

    globalThis.MathJax?.typesetPromise?.([this.container]);
  }
}
