/**
 * Palette Transformer
 *
 * Converts structured palette definitions (PaletteStructure) into flat CSS variable
 * objects suitable for applying to the DOM.
 *
 * This keeps transformation logic separate from palette data definitions.
 */

import type { PaletteStructure } from "./paletteTypes";

/**
 * CSS variable mapping for a palette
 */
export interface CSSVariableMap {
  [key: string]: string | undefined;
  "--palette-primary": string;
  "--palette-secondary"?: string;
  "--palette-bg-subtle": string;
  "--palette-bg-subtle-alt"?: string;
  "--palette-bg-nav": string;
  "--palette-bg-nav-alt"?: string;
  "--palette-foreground": string;
  "--palette-foreground-alt"?: string;
  "--palette-accent"?: string;
  "--palette-line": string;
}

/**
 * Transform a structured palette into CSS custom properties
 *
 * Maps semantic palette structure to the CSS variable naming convention
 * expected by the application's stylesheets.
 *
 * @param palette - The structured palette definition
 * @param useAlternates - Whether to use alternate colours (default: false)
 * @returns Object mapping CSS variable names to hex colour values
 */
export function transformPaletteToCSSVars(
  palette: PaletteStructure,
  useAlternates: boolean = false
): CSSVariableMap {
  const bg = useAlternates ? palette.colours.background.alternate : palette.colours.background.primary;
  const fg = useAlternates ? palette.colours.foreground.alternate : palette.colours.foreground.primary;
  const line = useAlternates ? palette.colours.line.alternate : palette.colours.line.primary;

  return {
    // Primary background (darkest colour)
    "--palette-primary": palette.colours.dark.colour,

    // Secondary background (main colour for cards, etc.)
    "--palette-secondary": bg.main,

    // Subtle backgrounds
    "--palette-bg-subtle": bg.subtle,
    "--palette-bg-subtle-alt": useAlternates
      ? palette.colours.background.primary.subtle
      : palette.colours.background.alternate.subtle,

    // Navigation backgrounds
    "--palette-bg-nav": bg.nav,
    "--palette-bg-nav-alt": useAlternates
      ? palette.colours.background.primary.nav
      : palette.colours.background.alternate.nav,

    // Foreground colours
    "--palette-foreground": fg.dark,
    "--palette-foreground-alt": fg.lite,

    // Accent (middle foreground tone)
    "--palette-accent": fg.midi,

    // Line/border colour
    "--palette-line": line.colour,
  };
}

/**
 * Generate CSS variable string for inline styles or style tags
 *
 * @param palette - The structured palette definition
 * @param useAlternates - Whether to use alternate colours
 * @returns CSS string like "--palette-primary: #00221A; --palette-foreground: #D7B130"
 */
export function generateCSSVariableString(
  palette: PaletteStructure,
  useAlternates: boolean = false
): string {
  const variables = transformPaletteToCSSVars(palette, useAlternates);

  return Object.entries(variables)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/**
 * Apply palette CSS variables to a DOM element
 *
 * @param element - The DOM element to apply variables to
 * @param palette - The structured palette definition
 * @param useAlternates - Whether to use alternate colours
 */
export function applyPaletteToElement(
  element: HTMLElement,
  palette: PaletteStructure,
  useAlternates: boolean = false
): void {
  const variables = transformPaletteToCSSVars(palette, useAlternates);

  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined) {
      element.style.setProperty(key, value);
    }
  });
}
