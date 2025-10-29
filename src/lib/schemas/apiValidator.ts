/**
 * Zod Validation Schemas for API Requests and Responses
 *
 * Provides runtime validation with compile-time type inference for all API boundaries.
 * This replaces loose types like `Record<string, any>` with properly validated schemas.
 */

import { z } from 'zod';
import { validateDomain } from '$lib/utils/validation/domainValidator';

// ==================================================================
// Metis API
// ==================================================================

/**
 * Domain configuration for research
 */
export const DomainConfigSchema = z.object({
	useList: z.string().nullable(), // List ID (e.g., 'ai-engineering') or null for no restrictions
	customDomains: z.array(z.string()).default([])
}).refine(
	(data) => {
		// Validate custom domains if present
		if (data.customDomains.length > 0) {
			return data.customDomains.every(domain => validateDomain(domain).valid);
		}
		return true;
	},
	{
		message: 'One or more custom domains are invalid'
	}
);

export type DomainConfig = z.infer<typeof DomainConfigSchema>;

/**
 * Research configuration level for hierarchical config in Themis
 */
export const ResearchConfigLevelSchema = z.enum(['all', 'selective', 'none']);

/**
 * Research configuration for course/arc/module
 */
export const ResearchConfigSchema = z.object({
	level: ResearchConfigLevelSchema,
	domainConfig: DomainConfigSchema.optional()
});

export type ResearchConfig = z.infer<typeof ResearchConfigSchema>;

/**
 * Structured input data for module generation
 * (Previously typed as Record<string, any>)
 */
export const StructuredInputSchema = z.object({
	logistics: z.object({
		duration: z.number().int().positive(),
		startDate: z.string().optional()
	}),
	learners: z.object({
		cohortSize: z.number().int().positive(),
		experience: z.object({
			prereq: z.enum(['<= 1 year', '1-3 years', '>= 4 years']),
			focus: z.enum(['no experience', 'limited experience', 'skilled amateur', 'current professional'])
		})
	}),
	content: z.object({
		techs: z.array(z.string()),
		info: z.string()
	}),
	model: z.object({
		enableResearch: z.boolean(),
		useExtendedThinking: z.boolean(),
		domainConfig: DomainConfigSchema.optional()
	})
});

export type StructuredInput = z.infer<typeof StructuredInputSchema>;

/**
 * Module generation request body
 */
export const GenerateRequestSchema = z.object({
	projectsData: z.any(), // XML data - keeping as any for now since it's raw XML string
	skillsData: z.any(),
	researchData: z.any(),
	structuredInput: StructuredInputSchema.optional(),
	enableResearch: z.boolean().optional().default(false),
	useExtendedThinking: z.boolean().optional().default(false),
	domainConfig: DomainConfigSchema.optional()
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Module generation response
 */
export const GenerateResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
	content: z.string().optional(),
	xmlContent: z.string().nullish(),
	hasValidXML: z.boolean(),
	validationErrors: z.array(z.string()).default([]),
	validationWarnings: z.array(z.string()).optional(),
	attempts: z.number().int().positive().optional(),
	metadata: z.object({
		modelUsed: z.string(),
		timestamp: z.string().datetime(),
		enableResearch: z.boolean(),
		useExtendedThinking: z.boolean()
	}).optional()
});

export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

// ==================================================================
// Themis Structure API
// ==================================================================

/**
 * Learner experience levels for courses
 */
export const LearnerExperienceSchema = z.object({
	prereq: z.string(), // e.g., "<= 1 year", "1-3 years"
	focus: z.string() // e.g., "no experience", "limited experience"
});

/**
 * Module skeleton within an arc (for course structure requests)
 */
export const ModuleSkeletonSchema = z.object({
	order: z.number().int().positive(),
	title: z.string().min(1),
	description: z.string().optional(),
	durationWeeks: z.number().int().positive()
});

/**
 * Arc skeleton (for course structure requests)
 */
export const ArcSkeletonSchema = z.object({
	order: z.number().int().positive(),
	title: z.string().min(1),
	description: z.string(),
	theme: z.string(),
	durationWeeks: z.number().int().positive(),
	modules: z.array(ModuleSkeletonSchema).optional()
});

/**
 * Course structure generation request
 */
export const CourseStructureGenerationRequestSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	totalWeeks: z.number().int().positive(),
	daysPerWeek: z.number().int().positive(),
	cohortSize: z.number().int().positive(),
	structure: z.enum(['facilitated', 'peer-led']),
	learnerExperience: LearnerExperienceSchema,
	arcs: z.array(ArcSkeletonSchema).optional(),
	enableResearch: z.boolean().optional().default(false),
	supportingDocuments: z.array(z.string()).optional()
});

export type CourseStructureGenerationRequest = z.infer<typeof CourseStructureGenerationRequestSchema>;

/**
 * Enhanced module details from AI (in course structure response)
 */
export const EnhancedModuleSchema = z.object({
	order: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
	suggestedDurationWeeks: z.number().int().positive(),
	learningObjectives: z.array(z.string()),
	keyTopics: z.array(z.string())
});

/**
 * Enhanced arc with modules from AI
 */
export const EnhancedArcSchema = z.object({
	order: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
	theme: z.string(),
	arcThemeNarrative: z.string(),
	arcProgressionNarrative: z.string(),
	suggestedDurationWeeks: z.number().int().positive(),
	modules: z.array(EnhancedModuleSchema)
});

/**
 * Course structure generation response
 */
export const CourseStructureGenerationResponseSchema = z.object({
	success: z.boolean(),
	courseNarrative: z.string().optional(),
	arcs: z.array(EnhancedArcSchema),
	progressionNarrative: z.string().optional(),
	errors: z.array(z.string()).optional()
});

export type CourseStructureGenerationResponse = z.infer<typeof CourseStructureGenerationResponseSchema>;

// ==================================================================
// Themis Module Generation API
// ==================================================================

/**
 * Course context for course-aware module generation
 */
export const CourseContextSchema = z.object({
	title: z.string(),
	courseNarrative: z.string(),
	progressionNarrative: z.string(),
	arcNarrative: z.string(),
	arcProgression: z.string(),
	precedingModules: z.array(z.string()).optional()
});

export type CourseContext = z.infer<typeof CourseContextSchema>;

/**
 * Module slot data for generation
 */
export const ModuleSlotSchema = z.object({
	id: z.string(),
	arcId: z.string(),
	order: z.number().int().positive(),
	title: z.string(),
	description: z.string(),
	durationWeeks: z.number().int().positive(),
	status: z.enum(['planned', 'overview-ready', 'generating', 'complete', 'error']),
	learningObjectives: z.array(z.string()).optional(),
	keyTopics: z.array(z.string()).optional()
});

export type ModuleSlotData = z.infer<typeof ModuleSlotSchema>;

/**
 * Module generation request with course context
 */
export const ModuleGenerationRequestSchema = z.object({
	moduleSlot: ModuleSlotSchema,
	courseContext: CourseContextSchema,
	enableResearch: z.boolean().optional().default(true),
	domainConfig: DomainConfigSchema.optional()
});

export type ModuleGenerationRequest = z.infer<typeof ModuleGenerationRequestSchema>;

/**
 * Module generation response
 */
export const ModuleGenerationResponseSchema = z.object({
	success: z.boolean(),
	xmlContent: z.string().optional(),
	validationErrors: z.array(z.string()).optional(),
	validationWarnings: z.array(z.string()).optional(),
	attempts: z.number().int().positive().optional(),
	message: z.string().optional()
});

export type ModuleGenerationResponse = z.infer<typeof ModuleGenerationResponseSchema>;

// ==================================================================
// Validation Helpers
// ==================================================================

/**
 * Parse and validate data with Zod, returning either success or error
 *
 * @example
 * const result = safeValidate(GenerateRequestSchema, requestBody);
 * if (!result.success) {
 *   return json({ error: result.error.message }, { status: 400 });
 * }
 * const data = result.data;
 */
export function safeValidate<T extends z.ZodTypeAny>(
	schema: T,
	data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
	const result = schema.safeParse(data);
	if (result.success) {
		return { success: true, data: result.data };
	} else {
		return { success: false, error: result.error };
	}
}

/**
 * Format Zod errors into user-friendly messages
 */
export function formatZodError(error: z.ZodError): string[] {
	return error.errors.map(err => {
		const path = err.path.join('.');
		return path ? `${path}: ${err.message}` : err.message;
	});
}
