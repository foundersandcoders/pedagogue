/**
 * Palette loader - loads and provides access to colour palettes
 * Single source of truth: src/lib/config/palettes/
 */

import type {
  WorkflowName,
  PaletteStructure,
  ThemeMode,
} from "./paletteTypes";
import { rheaPalette } from "$lib/config/palettes/rheaPalette";
import { rheaPaletteDark } from "$lib/config/palettes/rheaPalette.dark";
import { metisPalette } from "$lib/config/palettes/metisPalette";
import { metisPaletteDark } from "$lib/config/palettes/metisPalette.dark";
import { themisPalette } from "$lib/config/palettes/themisPalette";
import { themisPaletteDark } from "$lib/config/palettes/themisPalette.dark";
import { tethysPalette } from "$lib/config/palettes/tethysPalette";
import { tethysPaletteDark } from "$lib/config/palettes/tethysPalette.dark";
import { theiaPalette } from "$lib/config/palettes/theiaPalette";
import { theiaPaletteDark } from "$lib/config/palettes/theiaPalette.dark";
import { transformPaletteToCSSVars } from "./paletteTransformer";

/**
 * Route prefixes for workflow palette mapping
 */
const ROUTE_PREFIXES = {
  METIS: "/metis",
  THEMIS: "/themis",
  TETHYS: "/tethys",
  THEIA: "/theia",
  RHEA: "/rhea",
  HOME: "/",
} as const;

/**
 * Palette collection mapped by workflow name and theme
 * All palettes imported from single source of truth
 */
const PALETTES: Record<WorkflowName, Record<ThemeMode, PaletteStructure>> = {
  rhea: {
    light: rheaPalette,
    dark: rheaPaletteDark,
  },
  metis: {
    light: metisPalette,
    dark: metisPaletteDark,
  },
  themis: {
    light: themisPalette,
    dark: themisPaletteDark,
  },
  tethys: {
    light: tethysPalette,
    dark: tethysPaletteDark,
  },
  theia: {
    light: theiaPalette,
    dark: theiaPaletteDark,
  },
};

/**
 * Get palette for a specific workflow and theme
 * @param workflow - The workflow name
 * @param theme - The theme mode (defaults to 'light')
 */
export function getWorkflowPalette(workflow: WorkflowName, theme: ThemeMode = "light"): PaletteStructure {
  return PALETTES[workflow][theme];
}

/**
 * Get all available workflow names
 */
export function getWorkflowNames(): WorkflowName[] {
  return Object.keys(PALETTES) as WorkflowName[];
}

/**
 * Generate CSS custom property definitions for a palette
 * Returns an object mapping CSS variable names to colour values
 * @param workflow - The workflow name
 * @param theme - The theme mode (defaults to 'light')
 * @param useAlternates - Whether to use alternate colours
 */
export function generateCSSVariables(
  workflow: WorkflowName,
  theme: ThemeMode = "light",
  useAlternates: boolean = false
): Record<string, string> {
  const palette = PALETTES[workflow][theme];
  return transformPaletteToCSSVars(palette, useAlternates);
}

/**
 * Generate CSS custom property string for inline styles or style tags
 * @param workflow - The workflow name
 * @param theme - The theme mode (defaults to 'light')
 * @param useAlternates - Whether to use alternate colours
 */
export function generateCSSVariableString(
  workflow: WorkflowName,
  theme: ThemeMode = "light",
  useAlternates: boolean = false
): string {
  const variables = generateCSSVariables(workflow, theme, useAlternates);
  return Object.entries(variables)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

/**
 * Map workflow route to palette name
 */
export function getWorkflowPaletteName(pathname: string): WorkflowName | null {
  if (pathname.startsWith(ROUTE_PREFIXES.METIS)) return "metis";
  if (pathname.startsWith(ROUTE_PREFIXES.THEMIS)) return "themis";
  if (pathname.startsWith(ROUTE_PREFIXES.TETHYS)) return "tethys";
  if (pathname.startsWith(ROUTE_PREFIXES.THEIA)) return "theia";
  if (pathname === ROUTE_PREFIXES.HOME || pathname.startsWith(ROUTE_PREFIXES.RHEA)) return "rhea";
  return null;
}
