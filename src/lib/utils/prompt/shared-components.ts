/**
 * Shared Prompt Components
 *
 * Reusable prompt building blocks used across module and course generation.
 * Promotes consistency and reduces duplication in prompt construction.
 */

/**
 * Build research instructions section
 *
 * Explains web search capabilities and how to use them for up-to-date information.
 *
 * @param enabled - Whether research is enabled for this generation
 * @returns Formatted research instructions or empty string
 */
export function buildResearchInstructions(enabled: boolean): string {
	if (!enabled) {
	  return ''
	} else {
  	return `You have access to web search to find current, relevant information about:
      - Latest best practices and trends for the technologies mentioned
      - Current industry standards and tooling
      - Recent developments in AI and software development
      - Real-world examples and case studies

      Use web search to ensure the curriculum is up-to-date and reflects current industry practice.
      Focus on reputable sources: vendor documentation, established tech publications, and academic sources.`;
	}
}

/**
 * Build retry/validation error section
 *
 * Informs the AI about validation errors from a previous attempt and how to fix them.
 *
 * @param validationErrors - Array of validation error messages from previous attempt
 * @returns Formatted retry section or empty string if no errors
 */
export function buildRetrySection(validationErrors?: string[]): string {
	if (!validationErrors || validationErrors.length === 0) {
	  return ''
	} else {
	return `⚠️ PREVIOUS ATTEMPT FAILED VALIDATION ⚠️
    Your previous response had these validation errors:
    ${validationErrors.map(err => `- ${err}`).join('\n')}

    Please correct ALL of these issues in your next response. Pay special attention to:
    - Meeting minimum cardinality requirements (e.g., "at least 3 objectives")
    - Including all required sections and subsections
    - Using exact tag names (case-sensitive)
    - Ensuring proper XML structure with matching opening/closing tags`;
	}
}

/**
 * Build a conditional text block
 *
 * Returns content if condition is true, otherwise returns empty string.
 * Useful for optional prompt sections.
 *
 * @param condition - Whether to include the content
 * @param content - The content to conditionally include
 * @returns Content if condition is true, empty string otherwise
 */
export function buildConditionalSection(condition: boolean, content: string): string {
	return condition ? content : '';
}

/**
 * Build a numbered list item with conditional research prefix
 *
 * Handles the pattern where research adds an extra step before the main content.
 *
 * @param enableResearch - Whether research is enabled
 * @param researchStep - The research instruction to add (if research enabled)
 * @param baseStepNumber - The step number to use for non-research path
 * @returns Formatted step text
 *
 * @example
 * // With research enabled:
 * buildConditionalStep(true, "Use web search to validate topics", 1)
 * // Returns: "1. Use web search to validate topics\n2. Keep topics in mind..."
 *
 * // Without research:
 * buildConditionalStep(false, "Use web search to validate topics", 1)
 * // Returns: "1. Keep topics in mind..."
 */
export function buildResearchStep(
	enableResearch: boolean,
	researchInstruction: string,
	followUpInstructions?: string[]
): string {
	if (!enableResearch) {
		if (!followUpInstructions || followUpInstructions.length === 0) {
			return '';
		} else {
		  return followUpInstructions.map((instruction, idx) => `${idx + 1}. ${instruction}`).join('\n')
		}
	}

	const steps = [`1. ${researchInstruction}`];
	if (followUpInstructions && followUpInstructions.length > 0) {
		followUpInstructions.forEach((instruction, idx) => {
			steps.push(`${idx + 2}. ${instruction}`);
		});
	}
	return steps.join('\n');
}

/**
 * Format supporting documents section
 *
 * Wraps supporting documents in XML tags if any are provided.
 *
 * @param documents - Array of document strings
 * @returns Formatted XML section or empty string if no documents
 */
export function buildSupportingDocuments(documents?: string[]): string {
	if (!documents || documents.length === 0) return '';

	return `<SupportingDocuments>
    ${documents.join('\n\n')}
    </SupportingDocuments>`;
}

/**
 * Format JSON input as indented string
 *
 * Standardizes JSON formatting across prompts.
 *
 * @param data - Object to format
 * @param defaultValue - Value to return if data is null/undefined
 * @returns Formatted JSON string
 */
export function formatInputData(data: unknown, defaultValue: string = 'None provided'): string {
	return data ? JSON.stringify(data, null, 2) : defaultValue;
}

/**
 * Build a section with title and content
 *
 * Creates consistently formatted XML-style sections.
 *
 * @param tagName - The XML tag name for this section
 * @param content - The content to wrap
 * @param indent - Whether to indent the content (default: true)
 * @returns Formatted section
 */
export function buildSection(tagName: string, content: string, indent: boolean = true): string {
	if (!content) return '';

	const indentedContent = indent
		? content.split('\n').map(line => `  ${line}`).join('\n')
		: content;

	return `<${tagName}>
    ${indentedContent}
    </${tagName}>`;
}
