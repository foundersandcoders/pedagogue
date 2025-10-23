/**
 * Markdown Formatter for Theia
 *
 * Converts MappedContent to well-structured CommonMark-compatible Markdown.
 * Supports frontmatter, headings, lists, and proper typographic hierarchy.
 */

import type { MappedContent, MappedSection } from '$lib/types/theia';

/**
 * Formats mapped content as Markdown
 */
export function formatAsMarkdown(content: MappedContent): string {
	const lines: string[] = [];

	// Frontmatter (if metadata exists)
	if (content.metadata) {
		lines.push('---');
		Object.entries(content.metadata).forEach(([key, value]) => {
			lines.push(`${key}: ${value}`);
		});
		lines.push('---');
		lines.push('');
	}

	// Title
	lines.push(`# ${content.title}`);
	lines.push('');

	// Subtitle
	if (content.subtitle) {
		lines.push(`*${content.subtitle}*`);
		lines.push('');
	}

	// Table of Contents (optional enhancement)
	// Could be added here if config.includeTableOfContents is true

	// Sections
	content.sections.forEach((section) => {
		lines.push(...formatSection(section));
		lines.push(''); // Blank line between sections
	});

	return lines.join('\n').trim() + '\n';
}

/**
 * Formats a single section as Markdown
 */
function formatSection(section: MappedSection): string[] {
	const lines: string[] = [];

	// Section heading
	const headingPrefix = '#'.repeat(section.level);
	lines.push(`${headingPrefix} ${section.heading}`);
	lines.push('');

	// Section content
	if (typeof section.content === 'string') {
		// Plain text content
		if (section.content.trim()) {
			lines.push(section.content.trim());
			lines.push('');
		}
	} else if (Array.isArray(section.content)) {
		// Nested subsections
		section.content.forEach((subsection) => {
			lines.push(...formatSection(subsection));
			lines.push('');
		});
	}

	// Section items (list)
	if (section.items && section.items.length > 0) {
		section.items.forEach((item) => {
			if (item.title) {
				// Item with title (definition list style)
				lines.push(`**${item.title}**`);
				if (item.content.trim()) {
					lines.push('');
					// Indent content under the title
					const contentLines = item.content.trim().split('\n');
					contentLines.forEach((line) => {
						lines.push(line);
					});
					lines.push('');
				}
			} else {
				// Simple list item
				lines.push(`- ${item.content.trim()}`);
			}
		});
		lines.push('');
	}

	return lines;
}

/**
 * Escapes Markdown special characters in plain text
 */
export function escapeMarkdown(text: string): string {
	return text
		.replace(/\\/g, '\\\\')
		.replace(/\*/g, '\\*')
		.replace(/_/g, '\\_')
		.replace(/\[/g, '\\[')
		.replace(/\]/g, '\\]')
		.replace(/\(/g, '\\(')
		.replace(/\)/g, '\\)')
		.replace(/#/g, '\\#')
		.replace(/\+/g, '\\+')
		.replace(/-/g, '\\-')
		.replace(/\./g, '\\.')
		.replace(/!/g, '\\!')
		.replace(/`/g, '\\`');
}

/**
 * Generates a table of contents from sections
 */
export function generateTableOfContents(sections: MappedSection[], maxLevel: number = 3): string {
	const lines: string[] = ['## Table of Contents', ''];

	function addToTOC(section: MappedSection, depth: number = 0) {
		if (section.level > maxLevel) return;

		const indent = '  '.repeat(depth);
		const anchor = section.id || section.heading.toLowerCase().replace(/\s+/g, '-');
		lines.push(`${indent}- [${section.heading}](#${anchor})`);

		// Recurse into nested sections
		if (Array.isArray(section.content)) {
			section.content.forEach((subsection) => {
				addToTOC(subsection, depth + 1);
			});
		}
	}

	sections.forEach((section) => addToTOC(section));
	lines.push('');

	return lines.join('\n');
}
