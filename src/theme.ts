// Steel and Daylight: the app's own themes on the kit's fifteen tokens, from the game's palette (site/index.html:
// steel #070b0f, plate #131a22, the MAD's green #3dff8a, the alarm red). The kit checks every pairing for contrast
// (lib/theme.ts checks()) and drops a theme that fails; app.config.ts offers them (theme.extra) and opens in Steel.
import type { Theme } from "@tinymachines/kit/lib/theme-types";

export const THEMES: Theme[] = [
  { id: "mad-day", name: "Daylight", colors: {
    ground: "#e4e8ea", sheet: "#f7f9f9", ink: "#0d141b", ink2: "#26323d", mute: "#52606b", line: "#bfc8cd", tint: "#d3efe0", brand: "#0a6b3a", brandBg: "#070b0f", onInk: "#eef4f9", onInkMute: "#a9b3bd", alert: "#b3261e", mapSea: "#dbe7f3", mapLand: "#f4f1ea", mapLine: "#8a8f98" } },
  { id: "mad-steel", name: "Steel", colors: {
    ground: "#070b0f", sheet: "#131a22", ink: "#eef4f9", ink2: "#d0d9e1", mute: "#9aa3ad", line: "#2c3946", tint: "#12301f", brand: "#3dff8a", brandBg: "#04070a", onInk: "#eef4f9", onInkMute: "#a9b3bd", alert: "#ff6b78", mapSea: "#0b1118", mapLand: "#1a2430", mapLine: "#66727f" } },
];
