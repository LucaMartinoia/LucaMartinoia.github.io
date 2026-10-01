// ----------------------
// Plotter
// ----------------------
export class Plotter {
  constructor() {
    this.container = document.getElementById("simulation-plots");

    this.plot = document.createElement("div");
    this.plot.id = "simulation-plot";

    // Compatibility with al-folio's setPlotlyTheme().
    const pre = document.createElement("pre");
    pre.style.display = "none";
    const code = document.createElement("code");
    code.textContent = JSON.stringify({ data: [] });

    pre.appendChild(code);
    this.container.appendChild(pre);
    this.container.appendChild(this.plot);

    this.height = 200;
    this.margin = { t: 30, b: 50, l: 60, r: 20 };

    this.theme = document.documentElement.dataset.theme || "light";

    this.themeObserver = new MutationObserver(() => {
      const theme = document.documentElement.dataset.theme || "light";

      if (theme === this.theme) return;

      this.theme = theme;
      this.updateTheme();
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  }

  draw(traces, layout) {
    const themedLayout = {
      ...layout,
      template: this.getThemeTemplate(),
    };

    Plotly.react(this.plot, traces, themedLayout, { responsive: true });
  }

  updateTheme() {
    if (!this.plot.data) return;

    Plotly.relayout(this.plot, {
      template: this.getThemeTemplate(),
    });
  }

  getThemeTemplate() {
    return this.theme === "dark" ? plotlyDarkTemplate : plotlyLightTemplate;
  }
}

const plotlyDarkTemplate = {
  layout: {
    autotypenumbers: "strict",
    colorway: ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"],
    font: { color: "#f2f5fa" },
    hovermode: "closest",
    hoverlabel: { align: "left" },
    paper_bgcolor: "rgb(17,17,17)",
    plot_bgcolor: "rgb(17,17,17)",
    polar: {
      bgcolor: "rgb(17,17,17)",
      angularaxis: { gridcolor: "#506784", linecolor: "#506784", ticks: "" },
      radialaxis: { gridcolor: "#506784", linecolor: "#506784", ticks: "" },
    },
    ternary: {
      bgcolor: "rgb(17,17,17)",
      aaxis: { gridcolor: "#506784", linecolor: "#506784", ticks: "" },
      baxis: { gridcolor: "#506784", linecolor: "#506784", ticks: "" },
      caxis: { gridcolor: "#506784", linecolor: "#506784", ticks: "" },
    },
    coloraxis: { colorbar: { outlinewidth: 0, ticks: "" } },
    colorscale: {
      sequential: [
        [0.0, "#0d0887"],
        [0.1111111111111111, "#46039f"],
        [0.2222222222222222, "#7201a8"],
        [0.3333333333333333, "#9c179e"],
        [0.4444444444444444, "#bd3786"],
        [0.5555555555555556, "#d8576b"],
        [0.6666666666666666, "#ed7953"],
        [0.7777777777777778, "#fb9f3a"],
        [0.8888888888888888, "#fdca26"],
        [1.0, "#f0f921"],
      ],
      sequentialminus: [
        [0.0, "#0d0887"],
        [0.1111111111111111, "#46039f"],
        [0.2222222222222222, "#7201a8"],
        [0.3333333333333333, "#9c179e"],
        [0.4444444444444444, "#bd3786"],
        [0.5555555555555556, "#d8576b"],
        [0.6666666666666666, "#ed7953"],
        [0.7777777777777778, "#fb9f3a"],
        [0.8888888888888888, "#fdca26"],
        [1.0, "#f0f921"],
      ],
      diverging: [
        [0, "#8e0152"],
        [0.1, "#c51b7d"],
        [0.2, "#de77ae"],
        [0.3, "#f1b6da"],
        [0.4, "#fde0ef"],
        [0.5, "#f7f7f7"],
        [0.6, "#e6f5d0"],
        [0.7, "#b8e186"],
        [0.8, "#7fbc41"],
        [0.9, "#4d9221"],
        [1, "#276419"],
      ],
    },
    xaxis: {
      gridcolor: "#283442",
      linecolor: "#506784",
      ticks: "",
      title: { standoff: 15 },
      zerolinecolor: "#283442",
      automargin: true,
      zerolinewidth: 2,
    },
    yaxis: {
      gridcolor: "#283442",
      linecolor: "#506784",
      ticks: "",
      title: { standoff: 15 },
      zerolinecolor: "#283442",
      automargin: true,
      zerolinewidth: 2,
    },
    scene: {
      xaxis: {
        backgroundcolor: "rgb(17,17,17)",
        gridcolor: "#506784",
        linecolor: "#506784",
        showbackground: true,
        ticks: "",
        zerolinecolor: "#C8D4E3",
        gridwidth: 2,
      },
      yaxis: {
        backgroundcolor: "rgb(17,17,17)",
        gridcolor: "#506784",
        linecolor: "#506784",
        showbackground: true,
        ticks: "",
        zerolinecolor: "#C8D4E3",
        gridwidth: 2,
      },
      zaxis: {
        backgroundcolor: "rgb(17,17,17)",
        gridcolor: "#506784",
        linecolor: "#506784",
        showbackground: true,
        ticks: "",
        zerolinecolor: "#C8D4E3",
        gridwidth: 2,
      },
    },
    shapedefaults: { line: { color: "#f2f5fa" } },
    annotationdefaults: { arrowcolor: "#f2f5fa", arrowhead: 0, arrowwidth: 1 },
    geo: {
      bgcolor: "rgb(17,17,17)",
      landcolor: "rgb(17,17,17)",
      subunitcolor: "#506784",
      showland: true,
      showlakes: true,
      lakecolor: "rgb(17,17,17)",
    },
    title: { x: 0.05 },
    updatemenudefaults: { bgcolor: "#506784", borderwidth: 0 },
    sliderdefaults: { bgcolor: "#C8D4E3", borderwidth: 1, bordercolor: "rgb(17,17,17)", tickwidth: 0 },
    mapbox: { style: "dark" },
  },
  data: {
    histogram2dcontour: [
      {
        type: "histogram2dcontour",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    choropleth: [{ type: "choropleth", colorbar: { outlinewidth: 0, ticks: "" } }],
    histogram2d: [
      {
        type: "histogram2d",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    heatmap: [
      {
        type: "heatmap",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    contourcarpet: [{ type: "contourcarpet", colorbar: { outlinewidth: 0, ticks: "" } }],
    contour: [
      {
        type: "contour",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    surface: [
      {
        type: "surface",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    mesh3d: [{ type: "mesh3d", colorbar: { outlinewidth: 0, ticks: "" } }],
    scatter: [{ marker: { line: { color: "#283442" } }, type: "scatter" }],
    parcoords: [{ type: "parcoords", line: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatterpolargl: [{ type: "scatterpolargl", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    bar: [
      {
        error_x: { color: "#f2f5fa" },
        error_y: { color: "#f2f5fa" },
        marker: { line: { color: "rgb(17,17,17)", width: 0.5 }, pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } },
        type: "bar",
      },
    ],
    scattergeo: [{ type: "scattergeo", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatterpolar: [{ type: "scatterpolar", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    histogram: [{ marker: { pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } }, type: "histogram" }],
    scattergl: [{ marker: { line: { color: "#283442" } }, type: "scattergl" }],
    scatter3d: [{ type: "scatter3d", line: { colorbar: { outlinewidth: 0, ticks: "" } }, marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scattermap: [{ type: "scattermap", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scattermapbox: [{ type: "scattermapbox", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatterternary: [{ type: "scatterternary", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scattercarpet: [{ type: "scattercarpet", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    carpet: [
      {
        aaxis: { endlinecolor: "#A2B1C6", gridcolor: "#506784", linecolor: "#506784", minorgridcolor: "#506784", startlinecolor: "#A2B1C6" },
        baxis: { endlinecolor: "#A2B1C6", gridcolor: "#506784", linecolor: "#506784", minorgridcolor: "#506784", startlinecolor: "#A2B1C6" },
        type: "carpet",
      },
    ],
    table: [
      {
        cells: { fill: { color: "#506784" }, line: { color: "rgb(17,17,17)" } },
        header: { fill: { color: "#2a3f5f" }, line: { color: "rgb(17,17,17)" } },
        type: "table",
      },
    ],
    barpolar: [
      { marker: { line: { color: "rgb(17,17,17)", width: 0.5 }, pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } }, type: "barpolar" },
    ],
    pie: [{ automargin: true, type: "pie" }],
  },
};

const plotlyLightTemplate = {
  layout: {
    autotypenumbers: "strict",
    colorway: ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"],
    font: { color: "#2a3f5f" },
    hovermode: "closest",
    hoverlabel: { align: "left" },
    paper_bgcolor: "white",
    plot_bgcolor: "white",
    polar: {
      bgcolor: "white",
      angularaxis: { gridcolor: "#EBF0F8", linecolor: "#EBF0F8", ticks: "" },
      radialaxis: { gridcolor: "#EBF0F8", linecolor: "#EBF0F8", ticks: "" },
    },
    ternary: {
      bgcolor: "white",
      aaxis: { gridcolor: "#DFE8F3", linecolor: "#A2B1C6", ticks: "" },
      baxis: { gridcolor: "#DFE8F3", linecolor: "#A2B1C6", ticks: "" },
      caxis: { gridcolor: "#DFE8F3", linecolor: "#A2B1C6", ticks: "" },
    },
    coloraxis: { colorbar: { outlinewidth: 0, ticks: "" } },
    colorscale: {
      sequential: [
        [0.0, "#0d0887"],
        [0.1111111111111111, "#46039f"],
        [0.2222222222222222, "#7201a8"],
        [0.3333333333333333, "#9c179e"],
        [0.4444444444444444, "#bd3786"],
        [0.5555555555555556, "#d8576b"],
        [0.6666666666666666, "#ed7953"],
        [0.7777777777777778, "#fb9f3a"],
        [0.8888888888888888, "#fdca26"],
        [1.0, "#f0f921"],
      ],
      sequentialminus: [
        [0.0, "#0d0887"],
        [0.1111111111111111, "#46039f"],
        [0.2222222222222222, "#7201a8"],
        [0.3333333333333333, "#9c179e"],
        [0.4444444444444444, "#bd3786"],
        [0.5555555555555556, "#d8576b"],
        [0.6666666666666666, "#ed7953"],
        [0.7777777777777778, "#fb9f3a"],
        [0.8888888888888888, "#fdca26"],
        [1.0, "#f0f921"],
      ],
      diverging: [
        [0, "#8e0152"],
        [0.1, "#c51b7d"],
        [0.2, "#de77ae"],
        [0.3, "#f1b6da"],
        [0.4, "#fde0ef"],
        [0.5, "#f7f7f7"],
        [0.6, "#e6f5d0"],
        [0.7, "#b8e186"],
        [0.8, "#7fbc41"],
        [0.9, "#4d9221"],
        [1, "#276419"],
      ],
    },
    xaxis: {
      gridcolor: "#EBF0F8",
      linecolor: "#EBF0F8",
      ticks: "",
      title: { standoff: 15 },
      zerolinecolor: "#EBF0F8",
      automargin: true,
      zerolinewidth: 2,
    },
    yaxis: {
      gridcolor: "#EBF0F8",
      linecolor: "#EBF0F8",
      ticks: "",
      title: { standoff: 15 },
      zerolinecolor: "#EBF0F8",
      automargin: true,
      zerolinewidth: 2,
    },
    scene: {
      xaxis: {
        backgroundcolor: "white",
        gridcolor: "#DFE8F3",
        linecolor: "#EBF0F8",
        showbackground: true,
        ticks: "",
        zerolinecolor: "#EBF0F8",
        gridwidth: 2,
      },
      yaxis: {
        backgroundcolor: "white",
        gridcolor: "#DFE8F3",
        linecolor: "#EBF0F8",
        showbackground: true,
        ticks: "",
        zerolinecolor: "#EBF0F8",
        gridwidth: 2,
      },
      zaxis: {
        backgroundcolor: "white",
        gridcolor: "#DFE8F3",
        linecolor: "#EBF0F8",
        showbackground: true,
        ticks: "",
        zerolinecolor: "#EBF0F8",
        gridwidth: 2,
      },
    },
    shapedefaults: { line: { color: "#2a3f5f" } },
    annotationdefaults: { arrowcolor: "#2a3f5f", arrowhead: 0, arrowwidth: 1 },
    geo: { bgcolor: "white", landcolor: "white", subunitcolor: "#C8D4E3", showland: true, showlakes: true, lakecolor: "white" },
    title: { x: 0.05 },
    mapbox: { style: "light" },
  },
  data: {
    histogram2dcontour: [
      {
        type: "histogram2dcontour",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    choropleth: [{ type: "choropleth", colorbar: { outlinewidth: 0, ticks: "" } }],
    histogram2d: [
      {
        type: "histogram2d",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    heatmap: [
      {
        type: "heatmap",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    contourcarpet: [{ type: "contourcarpet", colorbar: { outlinewidth: 0, ticks: "" } }],
    contour: [
      {
        type: "contour",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    surface: [
      {
        type: "surface",
        colorbar: { outlinewidth: 0, ticks: "" },
        colorscale: [
          [0.0, "#0d0887"],
          [0.1111111111111111, "#46039f"],
          [0.2222222222222222, "#7201a8"],
          [0.3333333333333333, "#9c179e"],
          [0.4444444444444444, "#bd3786"],
          [0.5555555555555556, "#d8576b"],
          [0.6666666666666666, "#ed7953"],
          [0.7777777777777778, "#fb9f3a"],
          [0.8888888888888888, "#fdca26"],
          [1.0, "#f0f921"],
        ],
      },
    ],
    mesh3d: [{ type: "mesh3d", colorbar: { outlinewidth: 0, ticks: "" } }],
    scatter: [{ fillpattern: { fillmode: "overlay", size: 10, solidity: 0.2 }, type: "scatter" }],
    parcoords: [{ type: "parcoords", line: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatterpolargl: [{ type: "scatterpolargl", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    bar: [
      {
        error_x: { color: "#2a3f5f" },
        error_y: { color: "#2a3f5f" },
        marker: { line: { color: "white", width: 0.5 }, pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } },
        type: "bar",
      },
    ],
    scattergeo: [{ type: "scattergeo", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatterpolar: [{ type: "scatterpolar", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    histogram: [{ marker: { pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } }, type: "histogram" }],
    scattergl: [{ type: "scattergl", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatter3d: [{ type: "scatter3d", line: { colorbar: { outlinewidth: 0, ticks: "" } }, marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scattermap: [{ type: "scattermap", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scattermapbox: [{ type: "scattermapbox", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scatterternary: [{ type: "scatterternary", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    scattercarpet: [{ type: "scattercarpet", marker: { colorbar: { outlinewidth: 0, ticks: "" } } }],
    carpet: [
      {
        aaxis: { endlinecolor: "#2a3f5f", gridcolor: "#C8D4E3", linecolor: "#C8D4E3", minorgridcolor: "#C8D4E3", startlinecolor: "#2a3f5f" },
        baxis: { endlinecolor: "#2a3f5f", gridcolor: "#C8D4E3", linecolor: "#C8D4E3", minorgridcolor: "#C8D4E3", startlinecolor: "#2a3f5f" },
        type: "carpet",
      },
    ],
    table: [
      {
        cells: { fill: { color: "#EBF0F8" }, line: { color: "white" } },
        header: { fill: { color: "#C8D4E3" }, line: { color: "white" } },
        type: "table",
      },
    ],
    barpolar: [{ marker: { line: { color: "white", width: 0.5 }, pattern: { fillmode: "overlay", size: 10, solidity: 0.2 } }, type: "barpolar" }],
    pie: [{ automargin: true, type: "pie" }],
  },
};
