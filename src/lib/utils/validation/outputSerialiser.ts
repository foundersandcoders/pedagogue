/**
 * Course XML Serializer
 * Converts CourseData structure to XML format matching courseSchema.xml
 * Embeds complete module specifications from generated content
 */
import type { CourseData, ModuleSlot } from '$lib/types/themis';

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/**
 * Format current date and time for XML attributes
 */
function getDocDate(): string {
	const now = new Date();
	return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDocTime(): string {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	return hours + minutes; // HHMM
}

function getISOTimestamp(): string {
	return new Date().toISOString();
}

/**
 * Calculate end date from start date and duration
 */
function calculateEndDate(startDate: string, weeks: number, daysPerWeek: number): string {
	if (!startDate) return '';
	try {
		const start = new Date(startDate);
		const totalDays = weeks * daysPerWeek;
		const end = new Date(start);
		end.setDate(end.getDate() + totalDays);
		return end.toISOString().split('T')[0];
	} catch {
		return '';
	}
}

/**
 * Extract module specification content from module XML
 * Returns the inner content without the root <Module> tags
 */
function extractModuleSpecificationContent(xmlContent: string): string {
	if (!xmlContent || xmlContent.trim() === '') {
		return '';
	}

	try {
		// Parse the XML to extract content inside <Module> tags
		const parser = new DOMParser();
		const doc = parser.parseFromString(xmlContent, 'text/xml');

		// Check for parser errors
		const parserError = doc.querySelector('parsererror');
		if (parserError) {
			console.error('XML parsing error in module content:', parserError.textContent);
			return '';
		}

		const moduleElement = doc.documentElement;
		if (moduleElement.tagName !== 'Module') {
			console.error('Expected <Module> root element, found:', moduleElement.tagName);
			return '';
		}

		// Get the inner HTML/XML content
		const serializer = new XMLSerializer();
		const children = Array.from(moduleElement.childNodes);
		const innerContent = children
			.map((node) => serializer.serializeToString(node))
			.join('\n')
			.trim();

		return innerContent;
	} catch (error) {
		console.error('Failed to extract module specification:', error);
		return '';
	}
}

/**
 * Indent XML content by a specified number of levels (2 spaces per level)
 */
function indentXml(content: string, levels: number): string {
	const indent = '  '.repeat(levels);
	return content
		.split('\n')
		.map((line) => {
			const trimmed = line.trim();
			return trimmed ? indent + trimmed : '';
		})
		.join('\n');
}

/**
 * Convert CourseData to complete XML string matching courseSchema.xml
 * Embeds full module specifications from moduleData.xmlContent
 */
export function serialiseCourseToXml(course: CourseData): string {
	const lines: string[] = [];

	// Calculate course-level statistics
	const totalArcs = course.arcs.length;
	const totalModules = course.arcs.reduce((sum, arc) => sum + arc.modules.length, 0);
	const totalWeeks = course.logistics.totalWeeks;
	const daysPerWeek = course.logistics.daysPerWeek;
	const totalDays = totalWeeks * daysPerWeek;
	const startDate = course.logistics.startDate || '';
	const endDate = calculateEndDate(startDate, totalWeeks, daysPerWeek);

	// XML declaration and root element
	lines.push('<?xml version="1.0" encoding="UTF-8"?>');
	lines.push(
		`<Course name="${escapeXml(course.title)}" doc_date="${getDocDate()}" doc_time="${getDocTime()}" version="1.0">`
	);

	// =====================================================
	// COURSE PROPERTIES
	// =====================================================
	lines.push('');
	lines.push(
		`  <CourseProps arcs="${totalArcs}" modules="${totalModules}" weeks="${totalWeeks}" days="${totalDays}">`
	);

	// CourseMetadata
	lines.push('');
	lines.push('    <CourseMetadata>');
	lines.push('      <GenerationInfo>');
	lines.push(`        <Timestamp>${getISOTimestamp()}</Timestamp>`);
	lines.push('        <Source>AI-Generated</Source>');
	lines.push('        <Model>claude-sonnet-4-20250514</Model>');
	lines.push('        <Generator>Themis v1.0</Generator>');
	lines.push('      </GenerationInfo>');
	lines.push(`      <LastModified>${getISOTimestamp()}</LastModified>`);
	lines.push('      <Version>1.0</Version>');
	lines.push('      <SchemaVersion>1.0</SchemaVersion>');
	lines.push('    </CourseMetadata>');

	// CourseLogistics
	lines.push('');
	lines.push(`    <CourseLogistics arcs="${totalArcs}" modules="${totalModules}">`);
	lines.push(`      <TotalArcs>${totalArcs}</TotalArcs>`);
	lines.push(`      <TotalModules>${totalModules}</TotalModules>`);
	lines.push(`      <Structure>${course.structure}</Structure>`);
	lines.push('    </CourseLogistics>');

	// CourseTemporal
	lines.push('');
	lines.push(
		`    <CourseTemporal weeks="${totalWeeks}" days="${totalDays}" start_date="${startDate}" end_date="${endDate}">`
	);
	lines.push(`      <StartDate date="${startDate}" />`);
	lines.push(`      <TotalWeeks number="${totalWeeks}" />`);
	lines.push(`      <DaysPerWeek number="${daysPerWeek}" />`);
	lines.push(`      <TotalDays number="${totalDays}" />`);
	lines.push(`      <EndDate date="${endDate}" />`);
	lines.push('    </CourseTemporal>');

	lines.push('');
	lines.push('  </CourseProps>');

	// =====================================================
	// COHORT PROPERTIES
	// =====================================================
	lines.push('');
	const cohortSize = course.learners.cohortSize;
	const teamBased = course.learners.teamBased;
	const teamSize = course.learners.teamSize || 4;
	lines.push(`  <CohortProps learners="${cohortSize}" team_based="${teamBased}">`);

	lines.push('');
	lines.push(`    <CohortAssumptions learners="${cohortSize}">`);
	lines.push(`      <AssumedCohortSize>${cohortSize}</AssumedCohortSize>`);
	lines.push(`      <TeamBased>${teamBased}</TeamBased>`);
	lines.push(`      <AssumedTeamSize>${teamSize}</AssumedTeamSize>`);
	lines.push('    </CohortAssumptions>');

	lines.push('');
	lines.push('    <LearnerPrerequisites>');
	lines.push(`      ${escapeXml(course.learners.prerequisites || 'No specific prerequisites')}`);
	lines.push('    </LearnerPrerequisites>');

	lines.push('');
	lines.push('    <LearnerExperience>');
	lines.push(`      <PrereqLevel>${escapeXml(course.learners.experience.prereq)}</PrereqLevel>`);
	lines.push(`      <FocusArea>${escapeXml(course.learners.experience.focus)}</FocusArea>`);
	lines.push('    </LearnerExperience>');

	lines.push('');
	lines.push('  </CohortProps>');

	// =====================================================
	// COURSE DESCRIPTION
	// =====================================================
	lines.push('');
	if (course.courseNarrative) {
		const paragraphs = course.courseNarrative.split('\n\n').filter((p) => p.trim());
		lines.push(`  <CourseDescription paragraphs="${paragraphs.length}">`);
		paragraphs.forEach((para, idx) => {
			lines.push(`    <DescriptionParagraph order="${idx + 1}">`);
			lines.push(`      ${escapeXml(para.trim())}`);
			lines.push('    </DescriptionParagraph>');
		});
		lines.push('  </CourseDescription>');
	} else {
		lines.push('  <CourseDescription paragraphs="1">');
		lines.push('    <DescriptionParagraph order="1">');
		lines.push(`      ${escapeXml(course.description)}`);
		lines.push('    </DescriptionParagraph>');
		lines.push('  </CourseDescription>');
	}

	// =====================================================
	// COURSE CONTENT
	// =====================================================
	lines.push('');
	lines.push(`  <CourseContent arcs="${totalArcs}" modules="${totalModules}">`);

	// CourseProgression
	lines.push('');
	if (course.progressionNarrative) {
		const progressionParas = course.progressionNarrative.split('\n\n').filter((p) => p.trim());
		lines.push(`    <CourseProgression paragraphs="${progressionParas.length}">`);
		progressionParas.forEach((para, idx) => {
			lines.push(`      <ProgressionParagraph order="${idx + 1}">`);
			lines.push(`        ${escapeXml(para.trim())}`);
			lines.push('      </ProgressionParagraph>');
		});
		lines.push('    </CourseProgression>');
	} else {
		lines.push('    <CourseProgression paragraphs="1">');
		lines.push('      <ProgressionParagraph order="1">');
		lines.push(
			'        This course progresses through thematically organized arcs, each building on the previous.'
		);
		lines.push('      </ProgressionParagraph>');
		lines.push('    </CourseProgression>');
	}

	// =====================================================
	// ARCS
	// =====================================================
	lines.push('');
	lines.push(`    <Arcs count="${totalArcs}">`);

	course.arcs.forEach((arc) => {
		const arcModuleCount = arc.modules.length;
		const arcWeeks = arc.durationWeeks;
		const arcDays = arcWeeks * daysPerWeek;

		lines.push('');
		lines.push(
			`      <Arc order="${arc.order}" name="${escapeXml(arc.title)}" modules="${arcModuleCount}" weeks="${arcWeeks}">`
		);

		// ArcDescription
		lines.push('');
		if (arc.description) {
			const arcDescParas = arc.description.split('\n\n').filter((p) => p.trim());
			lines.push(`        <ArcDescription paragraphs="${arcDescParas.length}">`);
			arcDescParas.forEach((para, idx) => {
				lines.push(`          <DescriptionParagraph order="${idx + 1}">`);
				lines.push(`            ${escapeXml(para.trim())}`);
				lines.push('          </DescriptionParagraph>');
			});
			lines.push('        </ArcDescription>');
		} else {
			lines.push('        <ArcDescription paragraphs="1">');
			lines.push('          <DescriptionParagraph order="1">');
			lines.push(`            ${escapeXml(arc.theme || arc.title)}`);
			lines.push('          </DescriptionParagraph>');
			lines.push('        </ArcDescription>');
		}

		// ArcProps
		lines.push('');
		lines.push('        <ArcProps>');
		lines.push('          <ArcMetadata>');
		lines.push(`            <ArcID>${arc.id}</ArcID>`);
		lines.push(`            <Created>${getISOTimestamp()}</Created>`);
		lines.push('          </ArcMetadata>');
		lines.push('');
		lines.push(`          <ArcLogistics modules="${arcModuleCount}" />`);
		lines.push('');
		lines.push(
			`          <ArcTemporal weeks="${arcWeeks}" days="${arcDays}" start_date="" end_date="">`
		);
		lines.push('            <StartDate date="" />');
		lines.push(`            <TotalWeeks number="${arcWeeks}" />`);
		lines.push(`            <TotalDays number="${arcDays}" />`);
		lines.push('            <EndDate date="" />');
		lines.push('          </ArcTemporal>');
		lines.push('        </ArcProps>');

		// ArcContent
		lines.push('');
		lines.push(`        <ArcContent modules="${arcModuleCount}" themes="1">`);

		// Themes
		lines.push('');
		lines.push('          <Themes count="1">');
		const themeName = arc.theme || arc.title;
		const themeContent = arc.arcThemeNarrative || arc.description || arc.theme || '';
		lines.push(`            <ArcTheme name="${escapeXml(themeName)}" order="1">`);
		lines.push(`              ${escapeXml(themeContent)}`);
		lines.push('            </ArcTheme>');
		lines.push('          </Themes>');

		// ArcProgression
		lines.push('');
		lines.push('          <ArcProgression>');
		lines.push('            <ArcProgressionNarrative>');
		const arcProgression =
			arc.arcProgressionNarrative ||
			'Modules within this arc build progressively on each other, developing the theme.';
		lines.push(`              ${escapeXml(arcProgression)}`);
		lines.push('            </ArcProgressionNarrative>');
		lines.push('          </ArcProgression>');

		// Modules
		lines.push('');
		lines.push(`          <Modules count="${arcModuleCount}">`);

		arc.modules.forEach((module) => {
			serializeModule(lines, module, arc.order, daysPerWeek);
		});

		lines.push('          </Modules>');
		lines.push('');
		lines.push('        </ArcContent>');
		lines.push('');
		lines.push('      </Arc>');
	});

	lines.push('');
	lines.push('    </Arcs>');
	lines.push('');
	lines.push('  </CourseContent>');
	lines.push('');
	lines.push('</Course>');

	return lines.join('\n');
}

/**
 * Serialize a single module including its full specification if available
 */
function serializeModule(
	lines: string[],
	module: ModuleSlot,
	arcOrder: number,
	daysPerWeek: number
): void {
	const moduleWeeks = module.durationWeeks;
	const moduleDays = moduleWeeks * daysPerWeek;
	const moduleName = escapeXml(module.title || '');

	lines.push('');
	lines.push(
		`            <Module order="${module.order}" in_arc="${arcOrder}" name="${moduleName}" weeks="${moduleWeeks}" days="${moduleDays}" start_date="" end_date="">`
	);

	// ModuleDescription
	lines.push('');
	if (module.description) {
		lines.push('              <ModuleDescription>');
		lines.push(`                ${escapeXml(module.description)}`);
		lines.push('              </ModuleDescription>');
	}

	// ModuleProps
	lines.push('');
	lines.push('              <ModuleProps>');
	lines.push('                <ModuleMetadata>');
	lines.push(`                  <ModuleID>${module.id}</ModuleID>`);
	lines.push(`                  <Status>${module.status}</Status>`);
	if (module.moduleData?.generatedAt) {
		lines.push(`                  <GeneratedAt>${module.moduleData.generatedAt.toISOString()}</GeneratedAt>`);
	}
	lines.push('                </ModuleMetadata>');
	lines.push('');
	lines.push(
		`                <ModuleTemporal weeks="${moduleWeeks}" days="${moduleDays}" start_date="" end_date="">`
	);
	lines.push('                  <StartDate date="" />');
	lines.push(`                  <TotalWeeks number="${moduleWeeks}" />`);
	lines.push(`                  <TotalDays number="${moduleDays}" />`);
	lines.push('                  <EndDate date="" />');
	lines.push('                </ModuleTemporal>');
	lines.push('              </ModuleProps>');

	// ModuleSpecification - embed full module content if available
	lines.push('');
	if (module.moduleData?.xmlContent && module.status === 'complete') {
		lines.push('              <ModuleSpecification>');
		lines.push('');

		// Extract the inner content from the module XML (without root <Module> tags)
		const moduleSpecContent = extractModuleSpecificationContent(module.moduleData.xmlContent);

		if (moduleSpecContent) {
			// Indent the content to match our current level (8 levels deep)
			const indentedContent = indentXml(moduleSpecContent, 8);
			lines.push(indentedContent);
		} else {
			// Fallback if extraction failed
			lines.push('                <!-- Module specification content not available -->');
		}

		lines.push('');
		lines.push('              </ModuleSpecification>');
	} else {
		// Module not yet generated or in error state
		lines.push('              <ModuleSpecification>');
		lines.push(`                <!-- Module ${module.status}: specification not yet generated -->`);
		lines.push('              </ModuleSpecification>');
	}

	lines.push('');
	lines.push('            </Module>');
}

/**
 * Generate a filename for the downloaded XML
 */
export function generateXmlFilename(course: CourseData): string {
	const date = getDocDate();
	// Sanitize course title for filename
	const sanitized = course.title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.substring(0, 50);

	return `${date}-${sanitized}-course.xml`;
}

/**
 * Trigger browser download of XML file
 */
export function downloadCourseXml(course: CourseData): void {
	const xmlContent = serialiseCourseToXml(course);
	const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = generateXmlFilename(course);
	document.body.appendChild(a);
	a.click();

	// Cleanup
	setTimeout(() => {
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, 100);
}
