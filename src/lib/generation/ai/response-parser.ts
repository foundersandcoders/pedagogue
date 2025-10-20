/**
 * AI Response Parsing Utilities
 *
 * Handles extraction and parsing of content from Claude responses.
 * Supports both text and structured data extraction.
 */
import { cleanXML, sanitizeXMLEntities } from '$lib/schemas/xmlUtils.js';
import { calculateCardinality } from '$lib/schemas/cardinalityCalculator.js';
import type { CourseStructureGenerationResponse } from '$lib/validation/api-schemas.js';

/**
 * Extract text content from Claude's response
 *
 * When web search is used, response.content is an array of blocks including citations.
 * This function extracts only the text blocks and concatenates them.
 *
 * @param content - Raw content from Claude response (string or array)
 * @returns Extracted text content
 */
export function extractTextContent(content: any): string {
	if (typeof content === 'string') return content;

	if (Array.isArray(content)) {
		// Filter for text blocks only, ignoring citations and other metadata
		return content
			.filter(block => block.type === 'text')
			.map(block => block.text)
			.join('');
	}

	// Fallback for unexpected formats
	return String(content);
}

/**
 * Extract XML module specification from Claude's response
 *
 * Handles cases where Claude includes explanation text before/after the XML.
 * Strips comments, sanitizes entities, and adds cardinality attributes.
 *
 * @param content - Text content from Claude response
 * @returns Cleaned and processed XML string, or null if extraction failed
 */
export function extractModuleXML(content: string): string | null {
	// Try to find XML content between <Module> tags (capital M)
	const xmlMatch = content.match(/<Module>[\s\S]*?<\/Module>/i);
	if (xmlMatch) {
		const rawXML = xmlMatch[0];
		// Clean the XML (remove comments and normalize whitespace)
		let cleanedXML = cleanXML(rawXML);
		// Sanitize XML entities (escape unescaped ampersands, etc.)
		cleanedXML = sanitizeXMLEntities(cleanedXML);
		// Calculate and add cardinality attributes
		cleanedXML = calculateCardinality(cleanedXML);
		return `<?xml version="1.0" encoding="UTF-8"?>\n${cleanedXML}`;
	}

	// If no match, check if the entire content is valid XML
	const trimmed = content.trim();
	if (trimmed.match(/^<Module>/i) && trimmed.match(/<\/Module>$/i)) {
		let cleanedXML = cleanXML(trimmed);
		// Sanitize XML entities (escape unescaped ampersands, etc.)
		cleanedXML = sanitizeXMLEntities(cleanedXML);
		// Calculate and add cardinality attributes
		cleanedXML = calculateCardinality(cleanedXML);
		return `<?xml version="1.0" encoding="UTF-8"?>\n${cleanedXML}`;
	}

	return null;
}

/**
 * Parse course structure response from Claude
 *
 * Extracts and validates JSON structure from AI response text.
 *
 * @param responseText - Text response from Claude
 * @returns Parsed and validated course structure, or error response
 */
export function parseCourseStructureResponse(responseText: string): CourseStructureGenerationResponse {
	try {
		// Try to extract JSON from the response
		const jsonMatch = responseText.match(/\{[\s\S]*\}/);

		if (!jsonMatch) throw new Error('No JSON found in response');

		const parsed = JSON.parse(jsonMatch[0]);

		// Validate structure
		if (!parsed.arcs || !Array.isArray(parsed.arcs)) {
			throw new Error('Invalid response structure: missing arcs array');
		}

		return {
			success: true,
			courseNarrative: parsed.courseNarrative || '',
			arcs: parsed.arcs.map((arc: any, arcIndex: number) => ({
				order: arc.order || arcIndex + 1,
				title: arc.title || `Arc ${arcIndex + 1}`,
				description: arc.description || '',
				theme: arc.theme || '',
				arcThemeNarrative: arc.arcThemeNarrative || '',
				arcProgressionNarrative: arc.arcProgressionNarrative || '',
				suggestedDurationWeeks: arc.suggestedDurationWeeks || 1,
				modules: Array.isArray(arc.modules)
					? arc.modules.map((m: any, moduleIndex: number) => ({
						order: m.order || moduleIndex + 1,
						title: m.title || `Module ${moduleIndex + 1}`,
						description: m.description || '',
						suggestedDurationWeeks: m.suggestedDurationWeeks || 1,
						learningObjectives: Array.isArray(m.learningObjectives) ? m.learningObjectives : [],
						keyTopics: Array.isArray(m.keyTopics) ? m.keyTopics : []
					}))
  				: []
			})),
			progressionNarrative: parsed.progressionNarrative || ''
		};
	} catch (err) {
		console.error('Failed to parse course structure response:', err);
		return {
			success: false,
			errors: ['Failed to parse AI response. Please try again.'],
			arcs: []
		};
	}
}
