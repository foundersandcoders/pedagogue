/**
 * XML Utility Functions
 * Helper functions for XML processing and cleaning
 */

/**
 * Removes all XML comments from a string
 * Strips <!-- ... --> patterns including multiline comments
 */
export function stripXMLComments(xmlString: string): string {
	// Remove all XML comments (including multiline)
	return xmlString.replace(/<!--[\s\S]*?-->/g, '');
}

/**
 * Cleans up XML by removing comments and normalizing whitespace
 */
export function cleanXML(xmlString: string): string {
	let cleaned = stripXMLComments(xmlString);

	// Remove excessive blank lines (more than 2 consecutive newlines)
	cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

	// Trim leading/trailing whitespace
	cleaned = cleaned.trim();

	return cleaned;
}

/**
 * Sanitizes XML by escaping unescaped entities
 * Handles ampersands and other special characters that should be escaped in XML text content
 *
 * IMPORTANT: Only escapes entities in TEXT CONTENT, not within tags or existing entities
 */
export function sanitizeXMLEntities(xmlString: string): string {
	let sanitized = xmlString;

	// Escape unescaped ampersands (& that aren't already part of &amp;, &lt;, &gt;, &quot;, &apos;, or numeric entities)
	// This regex matches & that is NOT followed by (amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);
	sanitized = sanitized.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');

	return sanitized;
}

/**
 * Extracts XML content between specific tags (case-sensitive)
 */
export function extractXMLBetweenTags(content: string, tagName: string): string | null {
	const openTag = `<${tagName}>`;
	const closeTag = `</${tagName}>`;

	// Find opening tag
	const startIndex = content.indexOf(openTag);
	if (startIndex === -1) return null;

	// Find closing tag after the opening tag
	const closeIndex = content.indexOf(closeTag, startIndex);
	if (closeIndex === -1) return null;

	// Extract content including tags
	return content.substring(startIndex, closeIndex + closeTag.length);
}
