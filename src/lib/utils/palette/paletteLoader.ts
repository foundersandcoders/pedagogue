/**
 * Palette loader - loads and provides access to colour palettes
 * Single source of truth: src/lib/config/palettes/
 */

import type {
  WorkflowName,
  PaletteStructure,
} from "./paletteTypes";
import { rheaPalette } from "$lib/config/palettes/rheaPalette";
import { metisPalette } from "$lib/config/palettes/metisPalette";
import { themisPalette } from "$lib/config/palettes/themisPalette";
import { tethysPalette } from "$lib/config/palettes/tethysPalette";
import { theiaPalette } from "$lib/config/palettes/theiaPalette";
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
 * Palette collection mapped by workflow name
 * All palettes imported from single source of truth
 */
const PALETTES: Record<WorkflowName, PaletteStructure> = {
  rhea: rheaPalette,
  metis: metisPalette,
  themis: themisPalette,
  tethys: tethysPalette,
  theia: theiaPalette,
};

/**
 * Get palette for a specific workflow
 */
export function getWorkflowPalette(workflow: WorkflowName): PaletteStructure {
  return PALETTES[workflow];
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
 */
export function generateCSSVariables(
  workflow: WorkflowName,
  useAlternates: boolean = false
): Record<string, string> {
  const palette = PALETTES[workflow];
  return transformPaletteToCSSVars(palette, useAlternates);
}

/**
 * Generate CSS custom property string for inline styles or style tags
 */
export function generateCSSVariableString(
  workflow: WorkflowName,
  useAlternates: boolean = false
): string {
  const variables = generateCSSVariables(workflow, useAlternates);
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
