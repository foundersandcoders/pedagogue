/**
 * Domain Resolution Utilities
 *
 * Resolves domain configurations into arrays of domain strings for use with web search.
 * Handles predefined lists, custom domains, and validation.
 */

import type { DomainConfig } from '$lib/schemas/apiValidator';
import { getDomainListById, extractDomainUrls } from '$lib/config/researchDomains';
import { validateDomains, normalizeDomain } from '$lib/utils/validation/domainValidator';

/**
 * Resolution result with domains and any validation errors
 */
export interface DomainResolutionResult {
	domains: string[];
	errors: string[];
	hasRestrictions: boolean;
}

/**
 * Resolve a domain configuration to an array of domain strings
 *
 * Resolution logic:
 * - If useList is null → empty array (no restrictions)
 * - If useList is a valid ID → predefined list + custom domains
 * - If useList is invalid → custom domains only (with warning)
 * - Custom domains are validated and normalized
 */
export function resolveDomainList(config?: DomainConfig): DomainResolutionResult {
	// If no config provided, use default (AI Engineering list)
	if (!config) {
		const defaultList = getDomainListById('ai-engineering');
		if (defaultList) {
			return {
				domains: Array.from(extractDomainUrls(defaultList)),
				errors: [],
				hasRestrictions: true
			};
		}
		return {
			domains: [],
			errors: ['Default domain list not found, allowing all domains'],
			hasRestrictions: false
		};
	}

	const errors: string[] = [];
	let domains: string[] = [];

	// Case 1: No restrictions (useList is null)
	if (config.useList === null) {
		if (config.customDomains && config.customDomains.length > 0) {
			const validation = validateDomains(config.customDomains);
			if (!validation.valid) {
				Object.entries(validation.errors).forEach(([index, error]) => {
					errors.push(`Custom domain ${parseInt(index) + 1}: ${error}`);
				});
			}
			domains = validation.validDomains.map(normalizeDomain);

			return {
				domains,
				errors,
				hasRestrictions: domains.length > 0
			};
		}

		// No list, no custom domains = no restrictions
		return {
			domains: [],
			errors,
			hasRestrictions: false
		};
	}

	// Case 2: Use predefined list
	const domainList = getDomainListById(config.useList);
	if (domainList) {
		domains = Array.from(extractDomainUrls(domainList));
	} else {
		errors.push(`Domain list '${config.useList}' not found`);
	}

	// Case 3: Add custom domains
	if (config.customDomains && config.customDomains.length > 0) {
		const validation = validateDomains(config.customDomains);

		if (!validation.valid) {
			Object.entries(validation.errors).forEach(([index, error]) => {
				errors.push(`Custom domain ${parseInt(index) + 1}: ${error}`);
			});
		}

		// Add valid custom domains (normalized and deduplicated)
		const normalizedCustom = validation.validDomains.map(normalizeDomain);
		const existingSet = new Set(domains.map(d => d.toLowerCase()));

		normalizedCustom.forEach(domain => {
			if (!existingSet.has(domain.toLowerCase())) {
				domains.push(domain);
			}
		});
	}

	return {
		domains,
		errors,
		hasRestrictions: domains.length > 0 || config.useList !== null
	};
}

/**
 * Get a flat array of domains from a config (convenience wrapper)
 */
export function getDomains(config?: DomainConfig): string[] {
	return resolveDomainList(config).domains;
}

/**
 * Check if a domain configuration allows unrestricted research
 */
export function isUnrestricted(config?: DomainConfig): boolean {
	if (!config || config.useList === null) {
		return !config?.customDomains || config.customDomains.length === 0;
	}
	return false;
}

/**
 * Get a human-readable description of the domain configuration
 */
export function describeDomainConfig(config?: DomainConfig): string {
	if (!config || config.useList === null) {
		if (config?.customDomains && config.customDomains.length > 0) {
			const count = config.customDomains.length;
			return `${count} custom domain${count === 1 ? '' : 's'} only`;
		}
		return 'No restrictions (all domains)';
	}

	const domainList = getDomainListById(config.useList);
	const listName = domainList?.name || config.useList;

	if (config.customDomains && config.customDomains.length > 0) {
		const count = config.customDomains.length;
		return `${listName} list + ${count} custom domain${count === 1 ? '' : 's'}`;
	}

	return `${listName} list`;
}
