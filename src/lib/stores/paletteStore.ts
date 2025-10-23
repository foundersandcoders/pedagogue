/**
 * Palette store - manages active colour palette state
 * Provides reactive palette switching for different workflows
 */

import { writable, derived } from "svelte/store";
import type { WorkflowName } from "$lib/utils/palette/paletteTypes";
import {
  generateCSSVariables,
  getWorkflowPaletteName,
} from "$lib/utils/palette/paletteLoader";

/**
 * Current active palette name
 * Defaults to 'rhea' (main application palette)
 */
export const activePalette = writable<WorkflowName>("rhea");

/**
 * CSS variables for the active palette
 * Automatically updates when activePalette changes
 */
export const paletteVariables = derived(activePalette, ($activePalette) => {
  return generateCSSVariables($activePalette);
});

/**
 * Set the active palette based on current route
 * Call this in layout or page components when route changes
 */
export function setPaletteFromRoute(pathname: string): void {
  const paletteName = getWorkflowPaletteName(pathname);
  if (paletteName) {
    activePalette.set(paletteName);
  }
}

/**
 * Manually set a specific palette
 */
export function setPalette(palette: WorkflowName): void {
  activePalette.set(palette);
}

/**
 * Get current palette value (non-reactive)
 */
export function getCurrentPalette(): WorkflowName {
  let current: WorkflowName = "rhea";
  activePalette.subscribe((value) => {
    current = value;
  })();
  return current;
}
