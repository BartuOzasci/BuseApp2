// Single source of truth for colors used outside Tailwind (charts, SVG, canvas).
// Palette is unchanged — pink brand + neutral ink scale.
const colors = {
  primary: "#ec4899",
  primaryLight: "#f9a8d4",
  primaryLighter: "#fce7f3",
  primaryLightest: "#fdf2f8",
  primaryDark: "#db2777",
  primaryDeep: "#9d174d",
  accent: "#f472b6",
  white: "#ffffff",
  background: "#fffdfe",
  card: "#ffffff",
  text: {
    dark: "#26262b",
    medium: "#6b6b74",
    light: "#8b8b94",
    pink: "#db2777",
  },
  border: "#f5e6ee",
  shadow: "rgba(157, 23, 77, 0.12)",
  gradient: {
    from: "#db2777",
    to: "#f472b6",
    light: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
    strong: "linear-gradient(135deg, #db2777 0%, #ec4899 45%, #f472b6 100%)",
  },
  chart: {
    line: "#db2777",
    areaFrom: "rgba(236, 72, 153, 0.22)",
    areaTo: "rgba(236, 72, 153, 0)",
    grid: "#f5e6ee",
    dot: "#9d174d",
    axis: "#b6b6bd",
  },
  // Heatmap ramp — pure tints of the brand pink, no new hues
  heat: ["#fdf2f8", "#fce7f3", "#fbcfe8", "#f9a8d4", "#ec4899", "#be185d"],
};

export default colors;
