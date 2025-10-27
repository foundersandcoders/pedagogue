import type { TethysPalette } from "$lib/utils/palette/paletteTypes";

export const tethysPalette: TethysPalette = {
  metadata: {
    requiredImprovements: []
  },
  colours: {
    dark: {
      name: "abyss",
      colour: "#03121Fff"
    },
    background: {
      primary: {
        name: "coral",
        main: "#F5985Eff",
        subtle: "#FFF4EDff",
        nav: "#FFE8D8ff",
      },
      alternate: {
        name: "sage",
        main: "#5CAA82ff",
        subtle: "#F0F9F5ff",
        nav: "#D8F0E6ff"
      }
    },
    foreground: {
      primary: {
        name: "emerald",
        dark: "#2D7A5Eff",
        midi: "#3A9670ff",
        lite: "#4DB085ff",
      },
      alternate: {
        name: "amber",
        dark: "#A45818ff",
        midi: "#D47A17ff",
        lite: "#F1991Fff"
      }
    },
    line: {
      primary: {
        name: "midnight",
        colour: "#021318ff"
      },
      alternate: {
        name: "rust",
        colour: "#0D0803ff"
      }
    }
  }
};
