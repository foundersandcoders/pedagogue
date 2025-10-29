import type { TethysPalette } from "$lib/utils/palette/paletteTypes";

export const tethysPaletteDark: TethysPalette = {
  metadata: {
    requiredImprovements: []
  },
  colours: {
    dark: {
      name: "abyss",
      colour: "#0A1214ff"
    },
    background: {
      primary: {
        name: "coral",
        main: "#2D1A0Fff",
        subtle: "#3D2615ff",
        nav: "#352013ff",
      },
      alternate: {
        name: "teal",
        main: "#0F2623ff",
        subtle: "#1A3632ff",
        nav: "#142E2Bff"
      }
    },
    foreground: {
      primary: {
        name: "emerald",
        dark: "#5FD4B0ff",
        midi: "#7FE0C4ff",
        lite: "#9FE8D4ff",
      },
      alternate: {
        name: "amber",
        dark: "#FFB366ff",
        midi: "#FFC285ff",
        lite: "#FFD1A3ff"
      }
    },
    line: {
      primary: {
        name: "mist",
        colour: "#2D4A47ff"
      },
      alternate: {
        name: "rust",
        colour: "#4A3426ff"
      }
    }
  }
};
