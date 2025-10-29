/**
 * Themis Hierarchical Config Resolver
 *
 * Resolves research configuration through the three-level hierarchy:
 * Module → Arc → Course
 *
 * Used in Themis workflow to determine the effective research configuration
 * for a specific module based on hierarchical overrides.
 */

import type { ResearchConfig } from '$lib/schemas/apiValidator';
import type { DomainConfig } from '$lib/schemas/apiValidator';
import { resolveDomainList, type DomainResolutionResult } from './domainResolver';

/**
 * Resolved research configuration for a module
 */
export interface ResolvedResearchConfig {
	enabled: boolean;
	domainConfig?: DomainConfig;
	domains: string[];
	resolvedFrom: 'module' | 'arc' | 'course' | 'default';
	errors: string[];
}

/**
 * Resolve research configuration for a module using hierarchical cascade
 *
 * Resolution priority:
 * 1. Module-level config (highest priority)
 * 2. Arc-level config
 * 3. Course-level config
 * 4. Default (research enabled with AI Engineering list)
 */
export function resolveModuleResearchConfig(
	moduleConfig?: ResearchConfig,
	arcConfig?: ResearchConfig,
	courseConfig?: ResearchConfig
): ResolvedResearchConfig {
	let effectiveConfig: ResearchConfig | undefined;
	let resolvedFrom: 'module' | 'arc' | 'course' | 'default' = 'default';

	// Priority 1: Module-level config
	if (moduleConfig && moduleConfig.level !== 'selective') {
		effectiveConfig = moduleConfig;
		resolvedFrom = 'module';
	}
	// Priority 2: Arc-level config
	else if (arcConfig && arcConfig.level !== 'selective') {
		effectiveConfig = arcConfig;
		resolvedFrom = 'arc';
	}
	// Priority 3: Course-level config
	else if (courseConfig && courseConfig.level !== 'selective') {
		effectiveConfig = courseConfig;
		resolvedFrom = 'course';
	}

	// If no config found or all are 'selective', use default
	if (!effectiveConfig) {
		const domainResult = resolveDomainList({
			useList: 'ai-engineering',
			customDomains: []
		});

		return {
			enabled: true,
			domainConfig: { useList: 'ai-engineering', customDomains: [] },
			domains: domainResult.domains,
			resolvedFrom: 'default',
			errors: domainResult.errors
		};
	}

	// Determine if research is enabled
	const enabled = effectiveConfig.level === 'all';

	if (enabled) {
		const domainResult = resolveDomainList(effectiveConfig.domainConfig);

		return {
			enabled: true,
			domainConfig: effectiveConfig.domainConfig,
			domains: domainResult.domains,
			resolvedFrom,
			errors: domainResult.errors
		};
	}

	// Research disabled
	return {
		enabled: false,
		domainConfig: undefined,
		domains: [],
		resolvedFrom,
		errors: []
	};
}

/**
 * Resolve research configuration for an entire arc
 */
export function resolveArcResearchConfig(
	arcConfig?: ResearchConfig,
	courseConfig?: ResearchConfig
): ResolvedResearchConfig {
	return resolveModuleResearchConfig(undefined, arcConfig, courseConfig);
}

/**
 * Check if a given level requires child-level configuration
 */
export function requiresChildConfig(level: string): boolean {
	return level === 'selective';
}
