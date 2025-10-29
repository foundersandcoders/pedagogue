import type { ThemisPalette } from "$lib/utils/palette/paletteTypes";

export const themisPaletteDark: ThemisPalette = {
  metadata: {
    requiredImprovements: []
  },
  colours: {
    dark: {
      name: "midnight",
      colour: "#0A0614ff"
    },
    background: {
      primary: {
        name: "amethyst",
        main: "#140A24ff",
        subtle: "#1A0E2Eff",
        nav: "#241339ff",
      },
      alternate: {
        name: "gold",
        main: "#2D2618ff",
        subtle: "#2A2418ff",
        nav: "#352D1Cff"
      }
    },
    foreground: {
      primary: {
        name: "amber",
        dark: "#F0D26Fff",
        midi: "#F7DD8Aff",
        lite: "#FAE5A3ff",
      },
      alternate: {
        name: "violet",
        dark: "#B89EE6ff",
        midi: "#C8B3F0ff",
        lite: "#D6C7F7ff"
      }
    },
    line: {
      primary: {
        name: "twilight",
        colour: "#3D2A5Aff"
      },
      alternate: {
        name: "bronze",
        colour: "#4A3F2Dff"
      }
    }
  }
};
