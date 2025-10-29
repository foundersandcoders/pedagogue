import type { RheaPalette } from "$lib/utils/palette/paletteTypes";

export const rheaPaletteDark: RheaPalette = {
  metadata: {
    requiredImprovements: []
  },
  colours: {
    dark: {
      name: "depths",
      colour: "#060F0Eff"
    },
    background: {
      primary: {
        name: "teal",
        main: "#081E1Cff",
        subtle: "#0C2220ff",
        nav: "#0E2E2Bff",
      },
      alternate: {
        name: "gold",
        main: "#2D2618ff",
        subtle: "#2A2418ff",
        nav: "#332A1Cff"
      }
    },
    foreground: {
      primary: {
        name: "bronze",
        dark: "#E5C558ff",
        midi: "#F0D26Fff",
        lite: "#F7DD8Aff",
      },
      alternate: {
        name: "jade",
        dark: "#3FC4BAff",
        midi: "#5FD4CCff",
        lite: "#7FE0D9ff"
      }
    },
    line: {
      primary: {
        name: "mist",
        colour: "#2D4A47ff"
      },
      alternate: {
        name: "sand",
        colour: "#4A3F2Dff"
      }
    }
  }
};
