/**
 * XML Escaping Utility
 *
 * Prevents XML injection by escaping special characters in user-provided data
 * before embedding it in XML documents.
 */

/**
 * Escape special XML characters to prevent injection attacks
 *
 * Converts the following characters to their XML entity equivalents:
 * - & → &amp;
 * - < → &lt;
 * - > → &gt;
 * - " → &quot;
 * - ' → &apos;
 *
 * @param text - The text to escape
 * @returns XML-safe escaped text
 *
 * @example
 * escapeXml('Hello & <world>') // Returns: 'Hello &amp; &lt;world&gt;'
 */
export function escapeXml(text: string | null | undefined): string {
	if (text == null) {
		return '';
	}

	return String(text)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Escape an array of strings for XML
 *
 * @param items - Array of strings to escape
 * @returns Array of XML-safe escaped strings
 */
export function escapeXmlArray(items: (string | null | undefined)[] | null | undefined): string[] {
	if (!items) {
		return [];
	}

	return items.map(escapeXml);
}
