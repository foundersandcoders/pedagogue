/**
 * localStorage Persistence Utilities
 *
 * Utilities for automatic store synchronization with localStorage.
 * Handles serialization, error handling, and SSR compatibility.
 */

import { writable, type Writable } from 'svelte/store';

/**
 * Configuration for persisted store
 */
export interface PersistenceConfig<T> {
	/** localStorage key */
	key: string;
	/** Initial/default value */
	defaultValue: T;
	/** Optional deserializer for complex types (e.g., Date conversion) */
	deserialize?: (value: T) => T;
	/** Optional serializer for custom encoding */
	serialize?: (value: T) => string;
}

/**
 * Load value from localStorage with error handling
 *
 * @param key - localStorage key
 * @param defaultValue - Value to return if key not found or error occurs
 * @param deserialize - Optional function to transform parsed value
 * @returns Loaded value or default
 */
export function loadFromLocalStorage<T>(
	key: string,
	defaultValue: T,
	deserialize?: (value: T) => T
): T {
	// SSR guard
	if (typeof window === 'undefined') {
		return defaultValue;
	}

	try {
		const stored = localStorage.getItem(key);
		if (!stored) {
			return defaultValue;
		}

		const parsed = JSON.parse(stored) as T;
		return deserialize ? deserialize(parsed) : parsed;
	} catch (e) {
		console.error(`Failed to load from localStorage (key: ${key}):`, e);
		return defaultValue;
	}
}

/**
 * Save value to localStorage with error handling
 *
 * @param key - localStorage key
 * @param value - Value to save
 * @param serialize - Optional custom serializer
 */
export function saveToLocalStorage<T>(
	key: string,
	value: T,
	serialize?: (value: T) => string
): void {
	// SSR guard
	if (typeof window === 'undefined') {
		return;
	}

	try {
		const serialized = serialize ? serialize(value) : JSON.stringify(value);
		localStorage.setItem(key, serialized);
	} catch (e) {
		console.error(`Failed to save to localStorage (key: ${key}):`, e);
	}
}

/**
 * Remove value from localStorage
 *
 * @param key - localStorage key to remove
 */
export function removeFromLocalStorage(key: string): void {
	// SSR guard
	if (typeof window === 'undefined') {
		return;
	}

	try {
		localStorage.removeItem(key);
	} catch (e) {
		console.error(`Failed to remove from localStorage (key: ${key}):`, e);
	}
}

/**
 * Create a writable store with automatic localStorage persistence
 *
 * The store automatically:
 * - Loads initial value from localStorage (or uses default)
 * - Saves to localStorage on every update
 * - Handles SSR gracefully (no localStorage access during server rendering)
 * - Provides error handling for storage operations
 *
 * @param config - Persistence configuration
 * @returns Writable store that syncs with localStorage
 *
 * @example
 * // Simple usage
 * const theme = persistedStore({ key: 'theme', defaultValue: 'light' });
 *
 * @example
 * // With custom deserializer for Date objects
 * const course = persistedStore({
 *   key: 'currentCourse',
 *   defaultValue: null,
 *   deserialize: (value) => {
 *     if (value) {
 *       value.createdAt = new Date(value.createdAt);
 *       value.updatedAt = new Date(value.updatedAt);
 *     }
 *     return value;
 *   }
 * });
 */
export function persistedStore<T>(config: PersistenceConfig<T>): Writable<T> {
	const { key, defaultValue, deserialize, serialize } = config;

	// Load initial value from localStorage
	const initialValue = loadFromLocalStorage(key, defaultValue, deserialize);

	// Create base writable store
	const store = writable<T>(initialValue);

	// Subscribe to changes and save to localStorage
	if (typeof window !== 'undefined') {
		store.subscribe(value => {
			// Don't save if value is null/undefined and we want to clear storage
			if (value === null || value === undefined) {
				removeFromLocalStorage(key);
			} else {
				saveToLocalStorage(key, value, serialize);
			}
		});
	}

	return store;
}

/**
 * Wrap an existing writable store with localStorage persistence
 *
 * Useful when you want to add persistence to an already-created store.
 *
 * @param store - Existing writable store
 * @param key - localStorage key
 * @param serialize - Optional custom serializer
 * @returns The same store (for chaining), now with persistence
 *
 * @example
 * const myStore = writable(initialValue);
 * withLocalStorage(myStore, 'myKey');
 */
export function withLocalStorage<T>(
	store: Writable<T>,
	key: string,
	serialize?: (value: T) => string
): Writable<T> {
	if (typeof window !== 'undefined') {
		store.subscribe(value => {
			if (value === null || value === undefined) {
				removeFromLocalStorage(key);
			} else {
				saveToLocalStorage(key, value, serialize);
			}
		});
	}

	return store;
}
