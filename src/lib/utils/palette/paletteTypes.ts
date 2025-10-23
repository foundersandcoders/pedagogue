/**
 * Type definitions for colour palette system
 * Based on palettes defined in docs/palettes.jsonc
 */

/**
 * Individual colour definition with hex value
 */
export type ColorValue = string; // Hex colour code (e.g., "#00221Aff")

/**
 * Rhea palette - main application branding
 * Most comprehensive palette with multiple foreground variants
 */
export interface RheaPalette {
  "bg-dark": ColorValue;
  "bg-light": ColorValue;
  "bg-subtle-teal": ColorValue;
  "bg-subtle-gold": ColorValue;
  "bg-nav-teal": ColorValue;
  "bg-nav-gold": ColorValue;
  "fg-dark": ColorValue;
  "fg-mid": ColorValue;
  "fg-light": ColorValue;
  line: ColorValue;
}

/**
 * Themis palette - course builder workflow
 * Simpler palette with single foreground colour
 */
export interface ThemisPalette {
  bg: ColorValue;
  "bg-subtle": ColorValue;
  "bg-nav": ColorValue;
  fg: ColorValue;
  line: ColorValue;
}

/**
 * Tethys palette - arc designer workflow
 * Two-tone foreground palette
 */
export interface TethysPalette {
  bg: ColorValue;
  "bg-subtle": ColorValue;
  "bg-nav": ColorValue;
  "fg-dark": ColorValue;
  "fg-light": ColorValue;
}

/**
 * Metis palette - module generator workflow
 * Two-tone foreground palette
 */
export interface MetisPalette {
  bg: ColorValue;
  "bg-subtle": ColorValue;
  "bg-nav": ColorValue;
  "fg-dark": ColorValue;
  "fg-light": ColorValue;
}

/**
 * Generic unused palette structure
 * For future expansion or experimentation
 */
export interface UnusedPalette {
  background: ColorValue;
  "accent-1": ColorValue;
  "accent-2": ColorValue;
}

/**
 * Complete palette collection from palettes.jsonc
 */
export interface PaletteCollection {
  rhea: RheaPalette;
  themis: ThemisPalette;
  tethys: TethysPalette;
  metis: MetisPalette;
  "unused-1": UnusedPalette;
  "unused-2": UnusedPalette;
  "unused-3": UnusedPalette;
  "unused-4": UnusedPalette;
  "unused-5": UnusedPalette;
}

/**
 * Valid palette names that can be applied to workflows
 */
export type PaletteName = keyof PaletteCollection;

/**
 * Workflow identifiers that map to specific palettes
 */
export type WorkflowName = "rhea" | "metis" | "themis" | "tethys";

/**
 * Normalised palette structure for easier CSS variable generation
 * All palettes are converted to this structure with bg/fg/accent naming
 */
export interface NormalisedPalette {
  name: PaletteName;
  colours: {
    primary: ColorValue; // Main background or primary brand colour
    secondary?: ColorValue; // Secondary background or alternate colour
    backgroundSubtle?: ColorValue; // Very light background for cards and containers
    backgroundSubtleAlt?: ColorValue; // Alternate subtle background (Rhea only)
    backgroundNav?: ColorValue; // Navigation bar background
    backgroundNavAlt?: ColorValue; // Alternate navigation background (Rhea only)
    foreground: ColorValue; // Main foreground/text colour
    foregroundAlt?: ColorValue; // Alternate foreground colour
    accent?: ColorValue; // Accent/highlight colour
    line?: ColorValue; // Border/divider colour
  };
}
