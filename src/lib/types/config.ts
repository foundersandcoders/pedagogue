/**
 * Domain List Configuration Types
 *
 * Type definitions for research domain configuration used in Metis and Themis workflows.
 * Supports structured domain lists with categories, custom domains, and validation.
 */

/**
 * Individual domain source
 */
export interface Domain {
	/** Display name for the domain/source */
	name: string;
	/** Domain URL (supports wildcards and subpaths) */
	url: string;
}

/**
 * Category of related domains
 */
export interface DomainListCategory {
	/** Category name (e.g., "AI Platforms", "Documentation") */
	name: string;
	/** Domain sources in this category */
	sources: Domain[];
}

/**
 * Type of domain list
 */
export type DomainListType = 'allow' | 'ban';

/**
 * Complete domain list configuration
 */
export interface DomainList {
	/** Unique identifier for the list */
	id: string;
	/** Display name for the list */
	name: string;
	/** List type: allowlist or banlist */
	type: DomainListType;
	/** Organized categories of domains */
	categories: DomainListCategory[];
}

/**
 * User's domain configuration selection
 */
export interface DomainConfig {
	/** Selected list ID, or null for no restrictions */
	useList: string | null;
	/** User-added custom domains */
	customDomains: string[];
}

/**
 * Research configuration levels for Themis hierarchical config
 */
export type ResearchConfigLevel = 'all' | 'selective' | 'none';

/**
 * Research configuration for course/arc/module
 */
export interface ResearchConfig {
	/** Configuration level */
	level: ResearchConfigLevel;
	/** Domain configuration (when research is enabled) */
	domainConfig?: DomainConfig;
}
