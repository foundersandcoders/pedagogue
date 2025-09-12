/**
 * XML parsing and validation utilities for Pedagogue
 */

export interface ArcFile {
	options: ArcOption[];
}

export interface ArcOption {
	overview: string;
	brief: string;
	objectives: string[];
	exampleProjects: string[];
	notes?: string;
}

export interface NextStepFile {
	overview: string;
	devOpsDetail: string;
}

export class XMLParseError extends Error {
	constructor(message: string, public readonly details?: string) {
		super(message);
		this.name = 'XMLParseError';
	}
}

/**
 * Parse and validate an Arc XML file
 */
export function parseArcXML(xmlContent: string): ArcFile {
	try {
		// Basic XML validation - check for required structure
		if (!xmlContent.includes('<arc>') || !xmlContent.includes('</arc>')) {
			throw new XMLParseError('Invalid Arc XML: Missing <arc> root element');
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');
		
		// Check for parser errors
		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			throw new XMLParseError('XML parsing failed', parserError.textContent || undefined);
		}

		const options: ArcOption[] = [];
		const optionElements = doc.querySelectorAll('arc > option-1, arc > option-2');

		if (optionElements.length === 0) {
			throw new XMLParseError('Invalid Arc XML: No option elements found');
		}

		optionElements.forEach((option, index) => {
			const overview = option.querySelector('overview')?.textContent?.trim() || '';
			const brief = option.querySelector('brief')?.textContent?.trim() || '';
			const notes = option.querySelector('notes')?.textContent?.trim() || '';

			// Parse objectives
			const objectivesElement = option.querySelector('objectives');
			const objectives = objectivesElement ? 
				extractBulletPoints(objectivesElement.textContent || '') : [];

			// Parse example projects  
			const exampleProjectsElement = option.querySelector('example-projects');
			const exampleProjects = exampleProjectsElement ?
				extractBulletPoints(exampleProjectsElement.textContent || '') : [];

			if (!overview || !brief) {
				throw new XMLParseError(`Invalid Arc XML: Option ${index + 1} missing required overview or brief`);
			}

			options.push({
				overview,
				brief,
				objectives,
				exampleProjects,
				notes: notes || undefined
			});
		});

		return { options };

	} catch (error) {
		if (error instanceof XMLParseError) {
			throw error;
		}
		throw new XMLParseError('Failed to parse Arc XML', error instanceof Error ? error.message : String(error));
	}
}

/**
 * Parse and validate a Next Step XML file
 */
export function parseNextStepXML(xmlContent: string): NextStepFile {
	try {
		if (!xmlContent.includes('<next-step>') || !xmlContent.includes('</next-step>')) {
			throw new XMLParseError('Invalid Next Step XML: Missing <next-step> root element');
		}

		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');
		
		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			throw new XMLParseError('XML parsing failed', parserError.textContent || undefined);
		}

		const overview = doc.querySelector('next-step > overview')?.textContent?.trim() || '';
		const devOpsDetail = doc.querySelector('next-step > dev-ops-detail')?.textContent?.trim() || '';

		if (!overview || !devOpsDetail) {
			throw new XMLParseError('Invalid Next Step XML: Missing required overview or dev-ops-detail');
		}

		return {
			overview,
			devOpsDetail
		};

	} catch (error) {
		if (error instanceof XMLParseError) {
			throw error;
		}
		throw new XMLParseError('Failed to parse Next Step XML', error instanceof Error ? error.message : String(error));
	}
}

/**
 * Extract bullet points from text content
 */
function extractBulletPoints(text: string): string[] {
	return text
		.split(/\n/)
		.map(line => line.trim())
		.filter(line => line.startsWith('-') || line.startsWith('|'))
		.map(line => line.replace(/^[-|]\s*/, '').trim())
		.filter(line => line.length > 0);
}

/**
 * Validate file type and size
 */
export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
	// Check file extension
	if (!file.name.toLowerCase().endsWith('.xml')) {
		return { valid: false, error: 'File must have .xml extension' };
	}

	// Check file size (max 1MB)
	const maxSize = 1024 * 1024; // 1MB
	if (file.size > maxSize) {
		return { valid: false, error: 'File size must be less than 1MB' };
	}

	// Check MIME type
	if (file.type && !['text/xml', 'application/xml', 'text/plain'].includes(file.type)) {
		return { valid: false, error: 'Invalid file type. Expected XML file.' };
	}

	return { valid: true };
}