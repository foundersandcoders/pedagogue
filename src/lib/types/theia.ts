/** Type definitions for Theia: Content Preview Exporter
 * Theia generates human-readable exports from Themis (courses) and Metis (modules)
 * at various levels of detail and formats.
 */
import type { CourseData, Arc, ModuleSlot } from './themis';

/** Detail level for content export
 * - minimal: Titles and high-level structure only
 * - summary: Includes descriptions and key points
 * - detailed: Full content without metadata
 * - complete: Everything including AI metadata, changelogs, etc.
 */
export type DetailLevel = 'minimal' | 'summary' | 'detailed' | 'complete';

/** Supported export formats
 * - markdown: CommonMark-compatible Markdown
 * - html: Semantic HTML with inline CSS
 * - pdf: PDF document (stretch goal)
 */
export type ExportFormat = 'markdown' | 'html' | 'pdf';

/** Sections available for selective export from modules (Metis) */
export type ModuleSection =
	| 'overview'
	| 'objectives'
	| 'research'
	| 'projects'
	| 'project-briefs'
	| 'project-twists'
	| 'additional-skills'
	| 'metadata'
	| 'changelog'
	| 'notes';

/** Sections available for selective export from courses (Themis) */
export type CourseSection =
	| 'overview'
	| 'description'
	| 'logistics'
	| 'cohort-info'
	| 'course-narrative'
	| 'progression-narrative'
	| 'arcs'
	| 'arc-themes'
	| 'arc-progression'
	| 'modules';

/** Configuration for content export */
export interface ExportConfig {
	/** Detail level for export */
	detailLevel: DetailLevel;

	/** Whether to include AI generation metadata (changelog, provenance, etc.) */
	includeMetadata: boolean;

	/** Specific sections to include (if empty, includes all based on detailLevel) */
	sections: (ModuleSection | CourseSection)[];

	/** Output format */
	format: ExportFormat;

	/** Whether to include a table of contents */
	includeTableOfContents?: boolean;

	/** Custom title override for the export */
	customTitle?: string;
}

/** Content source types that can be exported */
export type ExportableContentType = 'module' | 'course' | 'arc' | 'module-slot';

/** Union type for content that can be exported */
export interface ExportableContent {
	type: ExportableContentType;
	data: ModuleXMLContent | CourseData | Arc | ModuleSlot;
}

/** Parsed module XML content (from Metis) */
export interface ModuleXMLContent {
	metadata?: {
		generationInfo?: {
			timestamp: string;
			source: string;
			model: string;
			inputSources?: Array<{ type: string; filename: string }>;
		};
		changelog?: Array<{
			section: string;
			type: string;
			confidence: 'high' | 'medium' | 'low';
			summary: string;
			rationale: string;
			sources?: Array<{ url: string; title: string }>;
		}>;
		provenance?: {
			lastHumanReview?: { date: string; reviewer: string };
			aiUpdateCount?: number;
			sectionsNeedingReview?: string[];
		};
	};
	overview: {
		description: string;
		objectives: Array<{
			name: string;
			details: string;
		}>;
	};
	research: {
		primaryTopics: Array<{
			name: string;
			description: string;
		}>;
		stretchTopics?: string[];
	};
	projects: {
		briefs: Array<{
			name: string;
			task: string;
			focus: string;
			criteria: string;
			skills: Array<{
				name: string;
				details: string;
			}>;
			examples: Array<{
				name: string;
				description: string;
			}>;
		}>;
		twists: Array<{
			name: string;
			task: string;
			examples: string[];
		}>;
	};
	additionalSkills?: Array<{
		category: string;
		skills: Array<{
			name: string;
			importance: string;
			description: string;
		}>;
	}>;
	notes?: string;
}

/** Mapped content ready for formatting
 * This is the intermediate representation between XML and output formats
 */
export interface MappedContent {
	title: string;
	subtitle?: string;
	sections: MappedSection[];
	metadata?: Record<string, string | number | boolean>;
}

/** A section of mapped content */
export interface MappedSection {
	id: string;
	heading: string;
	level: number; // 1-6 for heading hierarchy
	content: string | MappedSection[]; // Can be text or nested sections
	items?: Array<{ title?: string; content: string }>; // For lists
	metadata?: Record<string, unknown>;
}

/** Result of an export operation */
export interface ExportResult {
	success: boolean;
	filename: string;
	format: ExportFormat;
	content?: string;
	error?: string;
}

/** Default export configurations for common use cases */
export const DEFAULT_CONFIGS: Record<string, Partial<ExportConfig>> = {
	quick: {
		detailLevel: 'summary',
		includeMetadata: false,
		format: 'markdown',
		includeTableOfContents: false
	},
	standard: {
		detailLevel: 'detailed',
		includeMetadata: false,
		format: 'markdown',
		includeTableOfContents: true
	},
	complete: {
		detailLevel: 'complete',
		includeMetadata: true,
		format: 'html',
		includeTableOfContents: true
	}
};
