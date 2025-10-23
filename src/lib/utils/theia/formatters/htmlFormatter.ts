/** HTML Formatter for Theia
 * Converts MappedContent to semantic HTML with inline CSS for typography.
 * Optimised for printing and readability.
 */

import type { MappedContent, MappedSection } from '$lib/types/theia';

/** Formats mapped content as HTML */
export function formatAsHTML(content: MappedContent): string {
	const parts: string[] = [];

	// HTML document structure
	parts.push('<!DOCTYPE html>');
	parts.push('<html lang="en">');
	parts.push('<head>');
	parts.push('  <meta charset="UTF-8">');
	parts.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
	parts.push(`  <title>${escapeHTML(content.title)}</title>`);
	parts.push('  <style>');
	parts.push(getCSS());
	parts.push('  </style>');
	parts.push('</head>');
	parts.push('<body>');
	parts.push('  <article class="content">');

	// Header
	parts.push('    <header>');
	parts.push(`      <h1>${escapeHTML(content.title)}</h1>`);
	if (content.subtitle) {
		parts.push(`      <p class="subtitle">${escapeHTML(content.subtitle)}</p>`);
	}
	if (content.metadata) {
		parts.push('      <aside class="metadata">');
		Object.entries(content.metadata).forEach(([key, value]) => {
			parts.push(
				`        <span class="metadata-item"><strong>${escapeHTML(key)}:</strong> ${escapeHTML(String(value))}</span>`
			);
		});
		parts.push('      </aside>');
	}
	parts.push('    </header>');

	// Main content sections
	parts.push('    <main>');
	content.sections.forEach((section) => {
		parts.push(formatSectionAsHTML(section, 2)); // 2 levels of indentation
	});
	parts.push('    </main>');

	// Footer
	parts.push('    <footer>');
	parts.push(
		`      <p class="generated-notice">Generated with Theia on ${new Date().toLocaleDateString()}</p>`
	);
	parts.push('    </footer>');

	parts.push('  </article>');
	parts.push('</body>');
	parts.push('</html>');

	return parts.join('\n');
}

/** Formats a single section as HTML */
function formatSectionAsHTML(section: MappedSection, indent: number = 0): string {
	const parts: string[] = [];
	const indentation = '  '.repeat(indent);

	// Section container
	parts.push(`${indentation}<section id="${section.id}" class="section level-${section.level}">`);

	// Heading
	const headingTag = `h${Math.min(section.level, 6)}`;
	parts.push(`${indentation}  <${headingTag}>${escapeHTML(section.heading)}</${headingTag}>`);

	// Content
	if (typeof section.content === 'string' && section.content.trim()) {
		// Plain text content - convert paragraphs
		const paragraphs = section.content.split('\n\n').filter((p) => p.trim());
		paragraphs.forEach((para) => {
			parts.push(`${indentation}  <p>${escapeHTML(para.trim())}</p>`);
		});
	} else if (Array.isArray(section.content)) {
		// Nested subsections
		section.content.forEach((subsection) => {
			parts.push(formatSectionAsHTML(subsection, indent + 1));
		});
	}

	// Items (lists)
	if (section.items && section.items.length > 0) {
		// Determine if this is a definition list or regular list
		const hasDefinitions = section.items.some((item) => item.title);

		if (hasDefinitions) {
			// Definition list
			parts.push(`${indentation}  <dl class="definition-list">`);
			section.items.forEach((item) => {
				if (item.title) {
					parts.push(`${indentation}    <dt>${escapeHTML(item.title)}</dt>`);
					if (item.content.trim()) {
						// Handle multi-line content
						const contentParts = item.content.trim().split('\n\n');
						contentParts.forEach((part) => {
							parts.push(`${indentation}    <dd>${escapeHTML(part.trim())}</dd>`);
						});
					}
				} else {
					parts.push(`${indentation}    <dd>${escapeHTML(item.content.trim())}</dd>`);
				}
			});
			parts.push(`${indentation}  </dl>`);
		} else {
			// Regular unordered list
			parts.push(`${indentation}  <ul>`);
			section.items.forEach((item) => {
				parts.push(`${indentation}    <li>${escapeHTML(item.content.trim())}</li>`);
			});
			parts.push(`${indentation}  </ul>`);
		}
	}

	parts.push(`${indentation}</section>`);
	return parts.join('\n');
}

/** Escapes HTML special characters */
function escapeHTML(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Returns CSS styles for the HTML document */
function getCSS(): string {
	return `
    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 2rem;
    }
    
    /* Content Container */
    .content {
      max-width: 900px;
      margin: 0 auto;
    }
    
    /* Header */
    header {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #e9ecef;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #1a1a1a;
    }
    
    .subtitle {
      font-size: 1.2rem;
      color: #6c757d;
      font-style: italic;
      margin-bottom: 1rem;
    }
    
    .metadata {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }
    
    .metadata-item {
      font-size: 0.9rem;
      color: #495057;
    }
    
    .metadata-item strong {
      color: #212529;
    }
    
    /* Main Content */
    main {
      margin-bottom: 3rem;
    }
    
    /* Sections */
    section {
      margin-bottom: 2rem;
    }
    
    section.level-2 {
      margin-top: 2.5rem;
    }
    
    section.level-3 {
      margin-top: 2rem;
      margin-left: 1rem;
    }
    
    section.level-4 {
      margin-top: 1.5rem;
      margin-left: 2rem;
    }
    
    /* Headings */
    h2, h3, h4, h5, h6 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
      line-height: 1.3;
    }
    
    h2 {
      font-size: 2rem;
      color: #2c3e50;
      border-bottom: 1px solid #dee2e6;
      padding-bottom: 0.5rem;
    }
    
    h3 {
      font-size: 1.5rem;
      color: #34495e;
    }
    
    h4 {
      font-size: 1.25rem;
      color: #495057;
    }
    
    h5 {
      font-size: 1.1rem;
      color: #6c757d;
    }
    
    h6 {
      font-size: 1rem;
      color: #868e96;
    }
    
    /* Paragraphs */
    p {
      margin-bottom: 1rem;
      text-align: justify;
    }
    
    /* Lists */
    ul, ol {
      margin: 1rem 0 1rem 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
    
    /* Definition Lists */
    dl.definition-list {
      margin: 1rem 0;
    }
    
    dt {
      font-weight: 600;
      color: #495057;
      margin-top: 1rem;
      margin-bottom: 0.25rem;
    }
    
    dd {
      margin-left: 2rem;
      margin-bottom: 0.5rem;
      color: #6c757d;
    }
    
    /* Footer */
    footer {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid #e9ecef;
      text-align: center;
    }
    
    .generated-notice {
      font-size: 0.9rem;
      color: #adb5bd;
    }
    
    /* Print Styles */
    @media print {
      body {
        padding: 0;
        font-size: 12pt;
      }
    
      .content {
        max-width: 100%;
      }
    
      header {
        page-break-after: avoid;
      }
    
      section {
        page-break-inside: avoid;
      }
    
      h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }
    
      a {
        color: #000;
        text-decoration: none;
      }
    
      .metadata {
        background: #f5f5f5;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }
    
      h1 {
        font-size: 2rem;
      }
    
      h2 {
        font-size: 1.5rem;
      }
    
      section.level-3, section.level-4 {
        margin-left: 0;
      }
    }
  `.trim();
}
