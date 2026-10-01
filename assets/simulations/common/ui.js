// ----------------------
// UI
// ----------------------
export class UI {
  constructor() {
    this.container = document.getElementById("simulation-parameters");
  }

  clear() {
    this.container.innerHTML = "";
  }

  createSlider({ label, min, max, step, value, onInput, onChange, format = (v) => v }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("simulation-slider-wrapper");

    const labelEl = document.createElement("label");
    labelEl.classList.add("simulation-slider-label");

    const labelText = document.createElement("span");
    labelText.textContent = `${label}: `;

    const valueText = document.createElement("span");
    valueText.innerHTML = format(value);

    labelEl.append(labelText, valueText);

    const slider = document.createElement("input");
    slider.classList.add("simulation-slider");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    slider.addEventListener("input", (event) => {
      const nextValue = parseFloat(event.target.value);
      valueText.innerHTML = format(nextValue);
      onInput?.(nextValue);
    });

    slider.addEventListener("change", (event) => {
      onChange?.(parseFloat(event.target.value));
    });

    wrapper.append(labelEl, slider);
    return wrapper;
  }

  appendControl(control) {
    this.container.appendChild(control);
  }

  createCheckbox({ label, checked = false, onChange }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("simulation-checkbox-wrapper");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = checked;
    checkbox.classList.add("simulation-checkbox");

    const labelEl = document.createElement("label");
    labelEl.classList.add("simulation-checkbox-label");
    labelEl.textContent = label;

    checkbox.addEventListener("change", (event) => {
      onChange?.(event.target.checked);
    });

    wrapper.append(checkbox, labelEl);
    return wrapper;
  }

  createValueControl({ label, value, min, max, onChange }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("simulation-value-wrapper");

    const labelEl = document.createElement("span");
    labelEl.classList.add("simulation-value-label");
    labelEl.textContent = `${label}: `;

    const valueEl = document.createElement("span");
    valueEl.classList.add("simulation-value");
    valueEl.textContent = value;

    const minus = document.createElement("button");
    minus.textContent = "−";

    const plus = document.createElement("button");
    plus.textContent = "+";

    const update = (nextValue) => {
      if (nextValue < min || nextValue > max) return;

      value = nextValue;
      valueEl.textContent = value;
      onChange?.(value);
    };

    minus.addEventListener("click", () => update(value - 1));
    plus.addEventListener("click", () => update(value + 1));

    wrapper.append(labelEl, valueEl, minus, plus);
    return wrapper;
  }
}
