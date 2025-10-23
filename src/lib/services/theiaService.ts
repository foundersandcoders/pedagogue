/** Theia: Content Preview Exporter
 * Main orchestrator for exporting content from Themis (courses) and Metis (modules).
 * Coordinates content mapping, formatting, and browser downloads.
 */

import type {
	ExportConfig,
	ExportResult,
	ExportableContent,
	DetailLevel,
	ExportFormat
} from '$lib/types/theia';
import type { CourseData, Arc, ModuleSlot } from '$lib/types/themis';
import {
	mapModuleXMLToTypography,
	mapCourseToTypography,
	mapArcToTypography,
	mapModuleSlotToTypography
} from '$lib/utils/theia/contentMapper';
import { formatAsMarkdown } from '$lib/utils/theia/formatters/markdownFormatter';
import { formatAsHTML } from '$lib/utils/theia/formatters/htmlFormatter';
import { DEFAULT_CONFIGS } from '$lib/types/theia';

/**
 * Main entry point for exporting content
 */
export async function exportContent(
	content: ExportableContent,
	config: Partial<ExportConfig>
): Promise<ExportResult> {
	try {
		// Validate and fill in config defaults
		const fullConfig = validateAndMergeConfig(config);

		// Map content to typography structure
		let mapped;
		switch (content.type) {
			case 'module':
				if (typeof content.data === 'string') {
					// XML string
					mapped = mapModuleXMLToTypography(content.data as string, fullConfig);
				} else {
					throw new Error('Module content must be an XML string');
				}
				break;

			case 'course':
				mapped = mapCourseToTypography(content.data as CourseData, fullConfig);
				break;

			case 'arc':
				mapped = mapArcToTypography(content.data as Arc, fullConfig);
				break;

			case 'module-slot':
				mapped = mapModuleSlotToTypography(content.data as ModuleSlot, fullConfig);
				break;

			default:
				throw new Error(`Unknown content type: ${content.type}`);
		}

		// Format according to requested format
		let formatted: string;
		switch (fullConfig.format) {
			case 'markdown':
				formatted = formatAsMarkdown(mapped);
				break;

			case 'html':
				formatted = formatAsHTML(mapped);
				break;

			case 'pdf':
				throw new Error('PDF export not yet implemented');

			default:
				throw new Error(`Unknown format: ${fullConfig.format}`);
		}

		// Generate filename
		const filename = generateFilename(content, fullConfig.format, mapped.title);

		return {
			success: true,
			filename,
			format: fullConfig.format,
			content: formatted
		};
	} catch (error) {
		return {
			success: false,
			filename: '',
			format: config.format || 'markdown',
			error: error instanceof Error ? error.message : String(error)
		};
	}
}

/**
 * Exports content and triggers browser download
 */
export async function exportAndDownload(
	content: ExportableContent,
	config: Partial<ExportConfig>
): Promise<ExportResult> {
	const result = await exportContent(content, config);

	if (result.success && result.content) {
		triggerDownload(result.content, result.filename, result.format);
	}

	return result;
}

/**
 * Triggers a browser download of the content
 */
export function triggerDownload(content: string, filename: string, format: ExportFormat): void {
	const mimeTypes: Record<ExportFormat, string> = {
		markdown: 'text/markdown;charset=utf-8',
		html: 'text/html;charset=utf-8',
		pdf: 'application/pdf'
	};

	const blob = new Blob([content], { type: mimeTypes[format] });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();

	// Cleanup
	setTimeout(() => {
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, 100);
}

/**
 * Generates an appropriate filename for the export
 */
export function generateFilename(
	content: ExportableContent,
	format: ExportFormat,
	title?: string
): string {
	const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	const extension = format === 'markdown' ? 'md' : format;

	// Sanitize title for filename
	let baseName = title || 'export';
	baseName = baseName
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.substring(0, 50);

	// Add content type prefix
	let prefix = '';
	switch (content.type) {
		case 'module':
			prefix = 'module';
			break;
		case 'course':
			prefix = 'course';
			break;
		case 'arc':
			prefix = 'arc';
			break;
		case 'module-slot':
			prefix = 'module-slot';
			break;
	}

	return `${timestamp}-${prefix}-${baseName}.${extension}`;
}

/**
 * Validates and merges config with defaults
 */
export function validateAndMergeConfig(config: Partial<ExportConfig>): ExportConfig {
	// Start with sensible defaults
	const defaults: ExportConfig = {
		detailLevel: 'detailed',
		includeMetadata: false,
		sections: [],
		format: 'markdown',
		includeTableOfContents: false
	};

	// Merge with provided config
	const merged = { ...defaults, ...config };

	// Validate detail level
	const validDetailLevels: DetailLevel[] = ['minimal', 'summary', 'detailed', 'complete'];
	if (!validDetailLevels.includes(merged.detailLevel)) {
		throw new Error(`Invalid detail level: ${merged.detailLevel}`);
	}

	// Validate format
	const validFormats: ExportFormat[] = ['markdown', 'html', 'pdf'];
	if (!validFormats.includes(merged.format)) {
		throw new Error(`Invalid format: ${merged.format}`);
	}

	// Validate sections (must be an array)
	if (!Array.isArray(merged.sections)) {
		throw new Error('Sections must be an array');
	}

	return merged;
}

/**
 * Get a preset config by name
 */
export function getPresetConfig(presetName: keyof typeof DEFAULT_CONFIGS): Partial<ExportConfig> {
	const preset = DEFAULT_CONFIGS[presetName];
	if (!preset) {
		throw new Error(`Unknown preset: ${presetName}`);
	}
	return preset;
}

/**
 * Preview export (returns formatted content without downloading)
 * Useful for showing a preview in the UI
 */
export async function previewExport(
	content: ExportableContent,
	config: Partial<ExportConfig>,
	maxLines: number = 20
): Promise<{ preview: string; totalLines: number }> {
	const result = await exportContent(content, config);

	if (!result.success || !result.content) {
		return {
			preview: `Error: ${result.error || 'Unknown error'}`,
			totalLines: 0
		};
	}

	const lines = result.content.split('\n');
	const preview = lines.slice(0, maxLines).join('\n');

	return {
		preview: preview + (lines.length > maxLines ? '\n\n... (truncated)' : ''),
		totalLines: lines.length
	};
}
