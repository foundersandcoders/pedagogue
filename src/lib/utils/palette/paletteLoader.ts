/**
 * Palette loader - loads and provides access to colour palettes
 * Reads from docs/palettes.jsonc and provides type-safe palette access
 */

import type {
  PaletteCollection,
  PaletteName,
  WorkflowName,
  NormalisedPalette,
  MetisPalette,
  ThemisPalette,
  RheaPalette,
  TethysPalette,
} from "./paletteTypes";

// Import palette data
// Note: In production, this would be loaded from the file system or API
// For now, we'll define it inline for type safety
const PALETTES: PaletteCollection = {
  rhea: {
    "bg-dark": "#00221Aff",
    "bg-light": "#0E6B68ff",
    "bg-subtle-teal": "#F0F8F7ff",
    "bg-subtle-gold": "#FEF9EBff",
    "bg-nav-teal": "#D5E8E6ff",
    "bg-nav-gold": "#FAF0D4ff",
    "fg-dark": "#D7B130ff",
    "fg-mid": "#D4A927ff",
    "fg-light": "#D1AA2Eff",
    line: "#00100Eff",
  },
  themis: {
    bg: "#1A0E3Bff",
    "bg-subtle": "#F0ECF8ff",
    "bg-nav": "#E0D8F0ff",
    fg: "#7551BAff",
    line: "#0A021Dff",
  },
  tethys: {
    bg: "#03121Fff",
    "bg-subtle": "#FFF4EDff",
    "bg-nav": "#FFE8D8ff",
    "fg-dark": "#A45818ff",
    "fg-light": "#F1991Fff",
  },
  metis: {
    bg: "#00121Fff",
    "bg-subtle": "#E8F1F8ff",
    "bg-nav": "#D0E4F0ff",
    "fg-dark": "#096A78ff",
    "fg-light": "#0E9191ff",
  },
  "unused-1": {
    background: "#2C2220",
    "accent-1": "#E15F2E",
    "accent-2": "#F2E6CF",
  },
  "unused-2": {
    background: "#174B3A",
    "accent-1": "#E3C565",
    "accent-2": "#0B0B0B",
  },
  "unused-3": {
    background: "#2B124C",
    "accent-1": "#B98ED7",
    "accent-2": "#0D0D0D",
  },
  "unused-4": {
    background: "#2E3440",
    "accent-1": "#7DF9FF",
    "accent-2": "#101010",
  },
  "unused-5": {
    background: "#0F3D56",
    "accent-1": "#C07E45",
    "accent-2": "#0A0A0A",
  },
};

/**
 * Get a specific palette by name
 */
export function getPalette(name: PaletteName): PaletteCollection[typeof name] {
  return PALETTES[name];
}

/**
 * Get palette for a specific workflow
 */
export function getWorkflowPalette(
  workflow: WorkflowName
): MetisPalette | ThemisPalette | RheaPalette | TethysPalette {
  return PALETTES[workflow];
}

/**
 * Get all available palette names
 */
export function getPaletteNames(): PaletteName[] {
  return Object.keys(PALETTES) as PaletteName[];
}

/**
 * Normalise a palette to a consistent structure for CSS variable generation
 * This converts various palette structures (rhea, metis, themis, etc.) into
 * a unified format with predictable property names
 */
export function normalisePalette(name: PaletteName): NormalisedPalette {
  const palette = PALETTES[name];

  // Handle Rhea palette (most comprehensive)
  if (name === "rhea") {
    const rheaPalette = palette as RheaPalette;
    return {
      name,
      colours: {
        primary: rheaPalette["bg-dark"],
        secondary: rheaPalette["bg-light"],
        backgroundSubtle: rheaPalette["bg-subtle-teal"],
        backgroundSubtleAlt: rheaPalette["bg-subtle-gold"],
        backgroundNav: rheaPalette["bg-nav-teal"],
        backgroundNavAlt: rheaPalette["bg-nav-gold"],
        foreground: rheaPalette["fg-dark"],
        foregroundAlt: rheaPalette["fg-light"],
        accent: rheaPalette["fg-mid"],
        line: rheaPalette.line,
      },
    };
  }

  // Handle Themis palette
  if (name === "themis") {
    const themisPalette = palette as ThemisPalette;
    return {
      name,
      colours: {
        primary: themisPalette.bg,
        backgroundSubtle: themisPalette["bg-subtle"],
        backgroundNav: themisPalette["bg-nav"],
        foreground: themisPalette.fg,
        line: themisPalette.line,
      },
    };
  }

  // Handle Tethys and Metis palettes (same structure)
  if (name === "tethys" || name === "metis") {
    const tieredPalette = palette as TethysPalette | MetisPalette;
    return {
      name,
      colours: {
        primary: tieredPalette.bg,
        backgroundSubtle: tieredPalette["bg-subtle"],
        backgroundNav: tieredPalette["bg-nav"],
        foreground: tieredPalette["fg-dark"],
        foregroundAlt: tieredPalette["fg-light"],
      },
    };
  }

  // Handle unused palettes
  const unusedPalette = palette as { background: string; "accent-1": string; "accent-2": string };
  return {
    name,
    colours: {
      primary: unusedPalette.background,
      foreground: unusedPalette["accent-1"],
      accent: unusedPalette["accent-2"],
    },
  };
}

/**
 * Generate CSS custom property definitions for a palette
 * Returns an object mapping CSS variable names to colour values
 */
export function generateCSSVariables(
  name: PaletteName
): Record<string, string> {
  const normalised = normalisePalette(name);
  const variables: Record<string, string> = {};

  variables["--palette-primary"] = normalised.colours.primary;
  variables["--palette-foreground"] = normalised.colours.foreground;

  if (normalised.colours.secondary) {
    variables["--palette-secondary"] = normalised.colours.secondary;
  }

  if (normalised.colours.backgroundSubtle) {
    variables["--palette-bg-subtle"] = normalised.colours.backgroundSubtle;
  }

  if (normalised.colours.backgroundSubtleAlt) {
    variables["--palette-bg-subtle-alt"] = normalised.colours.backgroundSubtleAlt;
  }

  if (normalised.colours.backgroundNav) {
    variables["--palette-bg-nav"] = normalised.colours.backgroundNav;
  }

  if (normalised.colours.backgroundNavAlt) {
    variables["--palette-bg-nav-alt"] = normalised.colours.backgroundNavAlt;
  }

  if (normalised.colours.foregroundAlt) {
    variables["--palette-foreground-alt"] = normalised.colours.foregroundAlt;
  }

  if (normalised.colours.accent) {
    variables["--palette-accent"] = normalised.colours.accent;
  }

  if (normalised.colours.line) {
    variables["--palette-line"] = normalised.colours.line;
  }

  return variables;
}

/**
 * Generate CSS custom property string for inline styles or style tags
 */
export function generateCSSVariableString(name: PaletteName): string {
  const variables = generateCSSVariables(name);
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/**
 * Map workflow route to palette name
 */
export function getWorkflowPaletteName(pathname: string): WorkflowName | null {
  if (pathname.startsWith("/metis")) return "metis";
  if (pathname.startsWith("/themis")) return "themis";
  if (pathname.startsWith("/tethys")) return "tethys";
  if (pathname === "/" || pathname.startsWith("/rhea")) return "rhea";
  return null;
}
