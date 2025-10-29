import type { MetisPalette } from "$lib/utils/palette/paletteTypes";

export const metisPaletteDark: MetisPalette = {
  metadata: {
    requiredImprovements: []
  },
  colours: {
    dark: {
      name: "void",
      colour: "#0A1619ff"
    },
    background: {
      primary: {
        name: "cyan",
        main: "#0F2630ff",
        subtle: "#1A3540ff",
        nav: "#142B34ff",
      },
      alternate: {
        name: "coral",
        main: "#2D1A0Fff",
        subtle: "#3D2615ff",
        nav: "#352013ff"
      }
    },
    foreground: {
      primary: {
        name: "terracotta",
        dark: "#F5A76Eff",
        midi: "#FFB885ff",
        lite: "#FFC99Eff",
      },
      alternate: {
        name: "teal",
        dark: "#3FC4D8ff",
        midi: "#5FD4E6ff",
        lite: "#7FE0F0ff"
      }
    },
    line: {
      primary: {
        name: "frost",
        colour: "#2D4A54ff"
      },
      alternate: {
        name: "ember",
        colour: "#4A3426ff"
      }
    }
  }
};
