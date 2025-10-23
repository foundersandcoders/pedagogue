/**
 * Palette store - manages active colour palette state
 * Provides reactive palette switching for different workflows
 */

import { writable, get } from "svelte/store";
import type { WorkflowName } from "$lib/utils/palette/paletteTypes";
import { getWorkflowPaletteName } from "$lib/utils/palette/paletteLoader";

/**
 * Current active palette name
 * Defaults to 'rhea' (main application palette)
 */
export const activePalette = writable<WorkflowName>("rhea");

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
  return get(activePalette);
}
