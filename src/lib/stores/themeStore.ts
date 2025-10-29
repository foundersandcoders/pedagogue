/**
 * Theme Store - manages light/dark mode preference
 *
 * Provides:
 * - User theme preference (light/dark/system)
 * - System preference detection
 * - Effective theme resolution (resolves "system" to actual light/dark)
 * - localStorage persistence
 */

import { writable, derived, get, type Readable } from 'svelte/store';
import { persistedStore } from '$lib/utils/state/persistenceUtils';

/**
 * User's theme preference
 * - 'light': Always use light theme
 * - 'dark': Always use dark theme
 * - 'system': Follow OS/browser preference
 */
export type ThemePreference = 'light' | 'dark' | 'system';

/**
 * Actual theme mode (light or dark)
 */
export type ThemeMode = 'light' | 'dark';

/**
 * User's theme preference (persisted to localStorage)
 * Defaults to 'system' to respect user's OS preference
 */
export const themePreference = persistedStore<ThemePreference>({
	key: 'theme-preference',
	defaultValue: 'system'
});

/**
 * System theme preference (from OS/browser)
 * Reactive - updates when user changes system theme
 */
export const systemTheme = writable<ThemeMode>('light');

/**
 * Initialize system theme detection
 * Call this once during app initialization (client-side only)
 * @returns Cleanup function to remove event listener (optional)
 */
export function initSystemThemeDetection(): void | (() => void) {
	// SSR guard
	if (typeof window === 'undefined') {
		return;
	}

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

	// Set initial value
	systemTheme.set(mediaQuery.matches ? 'dark' : 'light');

	// Listen for changes
	const listener = (e: MediaQueryListEvent) => {
		systemTheme.set(e.matches ? 'dark' : 'light');
	};

	// Modern browsers
	if (mediaQuery.addEventListener) {
		mediaQuery.addEventListener('change', listener);
	}
	// Legacy browsers
	else if (mediaQuery.addListener) {
		mediaQuery.addListener(listener);
	}

	// Cleanup function (though typically not needed for app-lifetime listeners)
	return () => {
		if (mediaQuery.removeEventListener) {
			mediaQuery.removeEventListener('change', listener);
		} else if (mediaQuery.removeListener) {
			mediaQuery.removeListener(listener);
		}
	};
}

/**
 * Effective theme mode
 * Resolves "system" preference to actual light/dark based on system theme
 */
export const effectiveTheme: Readable<ThemeMode> = derived(
	[themePreference, systemTheme],
	([$themePreference, $systemTheme]) => {
		if ($themePreference === 'system') {
			return $systemTheme;
		}
		return $themePreference;
	}
);

/**
 * Set theme preference
 * @param preference - The theme preference to set
 */
export function setThemePreference(preference: ThemePreference): void {
	themePreference.set(preference);
}

/**
 * Get current theme preference (non-reactive)
 */
export function getCurrentThemePreference(): ThemePreference {
	return get(themePreference);
}

/**
 * Get current effective theme (non-reactive)
 */
export function getCurrentEffectiveTheme(): ThemeMode {
	return get(effectiveTheme);
}

/**
 * Toggle between light and dark themes
 * If current preference is 'system', sets to opposite of current system theme
 */
export function toggleTheme(): void {
	const current = get(themePreference);
	const effective = get(effectiveTheme);

	if (current === 'system' || effective === 'light') {
		themePreference.set('dark');
	} else {
		themePreference.set('light');
	}
}

/**
 * Cycle through theme preferences: light → dark → system → light
 */
export function cycleThemePreference(): void {
	const current = get(themePreference);

	switch (current) {
		case 'light':
			themePreference.set('dark');
			break;
		case 'dark':
			themePreference.set('system');
			break;
		case 'system':
			themePreference.set('light');
			break;
	}
}
