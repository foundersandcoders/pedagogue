import type { TheiaPalette } from "$lib/utils/palette/paletteTypes";

export const theiaPaletteDark: TheiaPalette = {
  metadata: {
    requiredImprovements: []
  },
  colours: {
    dark: {
      name: "void",
      colour: "#14091Aff"
    },
    background: {
      primary: {
        name: "rose",
        main: "#2D1426ff",
        subtle: "#3D1F33ff",
        nav: "#33182Bff",
      },
      alternate: {
        name: "cyan",
        main: "#0F2630ff",
        subtle: "#1A3540ff",
        nav: "#142B34ff"
      }
    },
    foreground: {
      primary: {
        name: "cyan",
        dark: "#47D8E6ff",
        midi: "#6FE3EEff",
        lite: "#8FEBF5ff",
      },
      alternate: {
        name: "magenta",
        dark: "#F078D4ff",
        midi: "#F593DFff",
        lite: "#F7ADE8ff"
      }
    },
    line: {
      primary: {
        name: "twilight",
        colour: "#4A2D54ff"
      },
      alternate: {
        name: "frost",
        colour: "#2D4A54ff"
      }
    }
  }
};
