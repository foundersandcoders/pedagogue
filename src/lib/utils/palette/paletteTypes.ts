/** Type definitions for colour palette system
 * Based on palettes defined in docs/palettes.jsonc
 */

/** Individual colour definition with hex value */
export type ColourValue = string; // Hex colour code (e.g., "#00221Aff")

// ====== CORE MODULES ======
/** Rhea palette - main application branding
 * Most comprehensive palette with multiple foreground variants
 */
export interface RheaPalette {
  "bg-dark": ColourValue;
  "bg-light": ColourValue;
  "bg-subtle-teal": ColourValue;
  "bg-subtle-gold": ColourValue;
  "bg-nav-teal": ColourValue;
  "bg-nav-gold": ColourValue;
  "fg-dark": ColourValue;
  "fg-mid": ColourValue;
  "fg-light": ColourValue;
  line: ColourValue;
}

// ====== WORKFLOW MODULES ======
/** Themis palette - course builder workflow
 * Simpler palette with single foreground colour
 */
export interface ThemisPalette {
  bg: ColourValue;
  "bg-subtle": ColourValue;
  "bg-nav": ColourValue;
  fg: ColourValue;
  line: ColourValue;
}

/** Tethys palette - arc designer workflow
 * Two-tone foreground palette
 */
export interface TethysPalette {
  bg: ColourValue;
  "bg-subtle": ColourValue;
  "bg-nav": ColourValue;
  "fg-dark": ColourValue;
  "fg-light": ColourValue;
}

/** Metis palette - module generator workflow
 * Two-tone foreground palette
 */
export interface MetisPalette {
  bg: ColourValue;
  "bg-subtle": ColourValue;
  "bg-nav": ColourValue;
  "fg-dark": ColourValue;
  "fg-light": ColourValue;
}

// ====== UTILITY MODULES ======
export type AtlasPalette = UnusedPalette;
export interface TheiaPalette {
  bg: ColourValue;
  "bg-subtle": ColourValue;
  "bg-nav": ColourValue;
  fg: ColourValue;
  line: ColourValue;
}
export type MnemosynePalette = UnusedPalette;

// ====== TYPE COMPONENTS & UTILS ======
export interface UnusedPalette {
  background: ColourValue;
  "accent-1": ColourValue;
  "accent-2": ColourValue;
}

/** Complete palette collection from palettes.jsonc */
export interface PaletteCollection {
  atlas: AtlasPalette;
  metis: MetisPalette;
  mnemosyne: MnemosynePalette;
  rhea: RheaPalette;
  tethys: TethysPalette;
  theia: TheiaPalette;
  themis: ThemisPalette;
  "unused-1": UnusedPalette;
  "unused-2": UnusedPalette;
  "unused-3": UnusedPalette;
  "unused-4": UnusedPalette;
  "unused-5": UnusedPalette;
}

/** Valid palette names that can be applied to workflows */
export type PaletteName = keyof PaletteCollection;

/** Workflow identifiers that map to specific palettes */
export type WorkflowName = "atlas" | "metis" | "mnemosyne" | "rhea" | "tethys" | "theia" | "themis";

/** Normalised palette structure for easier CSS variable generation
 * All palettes are converted to this structure with bg/fg/accent naming
 */
export interface NormalisedPalette {
  name: PaletteName;
  colours: {
    primary: ColourValue; // Main background or primary brand colour
    secondary?: ColourValue; // Secondary background or alternate colour
    backgroundSubtle?: ColourValue; // Very light background for cards and containers
    backgroundSubtleAlt?: ColourValue; // Alternate subtle background (Rhea only)
    backgroundNav?: ColourValue; // Navigation bar background
    backgroundNavAlt?: ColourValue; // Alternate navigation background (Rhea only)
    foreground: ColourValue; // Main foreground/text colour
    foregroundAlt?: ColourValue; // Alternate foreground colour
    accent?: ColourValue; // Accent/highlight colour
    line?: ColourValue; // Border/divider colour
  };
}
