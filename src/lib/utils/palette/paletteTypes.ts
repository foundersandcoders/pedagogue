/** Type definitions for colour palette system
 * Based on structured palette definitions in src/lib/config/palettes/
 */

/** Individual colour definition with hex value */
export type ColourValue = string; // Hex colour code (e.g., "#00221Aff")

/** Named colour with optional metadata */
export interface NamedColour {
  name: string;
  colour: ColourValue;
}

/** Background colour tier with main, subtle, and nav variants */
export interface BackgroundTier {
  name: string;
  main: ColourValue;
  subtle: ColourValue;
  nav: ColourValue;
}

/** Foreground colour tier with dark, midi, and lite variants */
export interface ForegroundTier {
  name: string;
  dark: ColourValue;
  midi: ColourValue;
  lite: ColourValue;
}

/** Core palette structure used by all workflow palettes */
export interface PaletteStructure {
  metadata: {
    requiredImprovements: string[];
  };
  colours: {
    dark: NamedColour;
    background: {
      primary: BackgroundTier;
      alternate: BackgroundTier;
    };
    foreground: {
      primary: ForegroundTier;
      alternate: ForegroundTier;
    };
    line: {
      primary: NamedColour;
      alternate: NamedColour;
    };
  };
}

// ====== WORKFLOW MODULES ======
/** Rhea palette - main application branding */
export type RheaPalette = PaletteStructure;

/** Themis palette - course builder workflow */
export type ThemisPalette = PaletteStructure;

/** Tethys palette - arc designer workflow */
export type TethysPalette = PaletteStructure;

/** Metis palette - module generator workflow */
export type MetisPalette = PaletteStructure;

/** Theia palette - content manager workflow */
export type TheiaPalette = PaletteStructure;

// ====== UTILITY MODULES ======
export type ThalassaPalette = UnusedPalette;
export type MnemosynePalette = UnusedPalette;

// ====== TYPE COMPONENTS & UTILS ======
export interface UnusedPalette {
  background: ColourValue;
  "accent-1": ColourValue;
  "accent-2": ColourValue;
}

/** Valid workflow names that have defined palettes */
export type WorkflowName = "metis" | "rhea" | "tethys" | "theia" | "themis";

/** Theme modes - actual rendered theme */
export type ThemeMode = "light" | "dark";

/** Theme preference - includes system option */
export type ThemePreference = "light" | "dark" | "system";
