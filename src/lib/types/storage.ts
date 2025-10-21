/**
 * Configuration for persisted store
 */
export interface PersistenceConfig<T> {
	key: string; /** localStorage key */
	defaultValue: T; /** default value */
	/* Optional deserialiser for complex types (e.g., Date conversion) */
	deserialize?: (value: T) => T;
	/* Optional serialiser for custom encoding */
	serialize?: (value: T) => string;
}
