/**
 * Domain Validation Utilities
 *
 * Validates domain strings for use in research domain configuration.
 * Supports wildcards, subpaths, and standard domain formats.
 */

/**
 * Validation result for domain strings
 */
export interface DomainValidationResult {
	valid: boolean;
	error?: string;
	normalized?: string;
}

/**
 * Validate a domain string
 */
export function validateDomain(domain: string): DomainValidationResult {
	const trimmed = domain.trim();
	
	if (!trimmed) {
		return { valid: false, error: 'Domain cannot be empty' };
	}
	
	if (/\s/.test(trimmed)) {
		return { valid: false, error: 'Domain cannot contain spaces' };
	}
	
	const [domainPart] = trimmed.split('/');
	const hasWildcard = domainPart.startsWith('*.');
	const actualDomain = hasWildcard ? domainPart.substring(2) : domainPart;
	const [domainWithoutPort] = actualDomain.split(':');
	
	const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
	
	if (!domainRegex.test(domainWithoutPort)) {
		return { valid: false, error: 'Invalid domain format' };
	}
	
	if (domainWithoutPort.includes('..')) {
		return { valid: false, error: 'Domain cannot contain consecutive dots' };
	}
	
	const parts = domainWithoutPort.split('.');
	if (parts.length < 2) {
		return { valid: false, error: 'Domain must have at least one dot (e.g., example.com)' };
	}
	
	const tld = parts[parts.length - 1];
	if (tld.length < 2) {
		return { valid: false, error: 'Top-level domain must be at least 2 characters' };
	}
	
	return { valid: true, normalized: trimmed.toLowerCase() };
}

/**
 * Validate an array of domains
 */
export function validateDomains(
	domains: string[]
): { valid: boolean; errors: Record<number, string>; validDomains: string[] } {
	const errors: Record<number, string> = {};
	const validDomains: string[] = [];
	
	domains.forEach((domain, index) => {
		const result = validateDomain(domain);
		if (!result.valid) {
			errors[index] = result.error || 'Invalid domain';
		} else {
			validDomains.push(result.normalized || domain);
		}
	});
	
	return {
		valid: Object.keys(errors).length === 0,
		errors,
		validDomains
	};
}

/**
 * Normalize a domain string (trim, lowercase domain part)
 */
export function normalizeDomain(domain: string): string {
	const trimmed = domain.trim();
	const [domainPart, ...pathParts] = trimmed.split('/');
	const path = pathParts.length > 0 ? '/' + pathParts.join('/') : '';
	const normalizedDomain = domainPart.toLowerCase();
	return normalizedDomain + path;
}
