/**
 * Course XML Serializer
 * Converts CourseData structure to XML format matching the course overview schema
 */
import type { CourseData } from '$lib/types/courseTypes';

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

/**
 * Convert CourseData to XML string
 */
export function serialiseCourseToXml(course: CourseData): string {
	const lines: string[] = [];

	const totalArcs = course.arcs.length;
	const totalModules = course.arcs.reduce((sum, arc) => sum + arc.modules.length, 0);
	const totalWeeks = course.arcs.reduce((sum, arc) => sum + arc.durationWeeks, 0);
	const daysPerWeek = course.logistics?.daysPerWeek || 1;
	const totalDays = totalWeeks * daysPerWeek;

	// Root element with attributes
	lines.push(`<Course name="${escapeXml(course.title)}" doc_date="${getDocDate()}" doc_time="${getDocTime()}">`);

	// CourseProps
	lines.push(`  <CourseProps arcs="${totalArcs}" modules="${totalModules}" weeks="${totalWeeks}" days="${totalDays}">`);
	lines.push('    <CourseMetadata /><!-- placeholder for later implementation of versioning -->');

	// CourseLogistics
	lines.push(` \t\t<CourseLogistics arcs="${totalArcs}" modules="${totalModules}">`);
	lines.push(` \t\t\t<TotalArcs>${totalArcs}</TotalArcs>`);
	lines.push(` \t\t\t<TotalModules>${totalModules}</TotalModules>`);
	lines.push(' \t\t</CourseLogistics>');

	// CourseTemporal
	const startDate = course.logistics?.startDate || '';
	lines.push(` \t\t<CourseTemporal weeks="${totalWeeks}" days="${totalDays}" start_date="${startDate}" end_date="">`);
	lines.push(` \t\t\t<StartDate date="${startDate}"/> <!-- optional -->`);
	lines.push(` \t\t\t<TotalWeeks number="${totalWeeks}"/>`);
	lines.push(` \t\t\t<DaysPerWeek number="${daysPerWeek}"/>`);
	lines.push(` \t\t\t<TotalDays number="${totalDays}"/>`);
	lines.push(' \t\t\t<EndDate date =""/> <!-- optional -->');
	lines.push(' \t\t</CourseTemporal>');
	lines.push(' \t</CourseProps>');

	// CohortProps
	const cohortSize = course.learners?.cohortSize || 20;
	const teamSize = course.learners?.teamSize || 4;
	lines.push(` \t<CohortProps learners="${cohortSize}" learners_type="assumed">`);
	lines.push(`\t\t<CohortAssumptions learners="${cohortSize}">`);
	lines.push(` \t\t\t<AssumedCohortSize>${cohortSize}</AssumedCohortSize>`);
	lines.push(` \t\t\t<AssumedTeamSize>${teamSize}</AssumedTeamSize>`);
	lines.push('\t\t</CohortAssumptions>');
	lines.push(' \t</CohortProps>');

	// CourseDescription
	if (course.courseNarrative) {
		const paragraphs = course.courseNarrative.split('\n\n').filter(p => p.trim());
		lines.push(`  <CourseDescription paragraphs="${paragraphs.length}">`);
		paragraphs.forEach((para, idx) => {
			lines.push(`    <DescriptionParagraph order="${idx + 1}">${escapeXml(para.trim())}</DescriptionParagraph>`);
		});
		lines.push(' \t</CourseDescription>');
	}

	// CourseContent
	lines.push(`\t<CourseContent arcs="${totalArcs}" modules="${totalModules}">`);

	// CourseProgression
	if (course.progressionNarrative) {
		const progressionParas = course.progressionNarrative.split('\n\n').filter(p => p.trim());
		lines.push(`\t\t<CourseProgression paragraphs="${progressionParas.length}">`);
		progressionParas.forEach((para, idx) => {
			lines.push(`\t\t\t<ProgressionParagraph order="${idx + 1}">${escapeXml(para.trim())}</ProgressionParagraph>`);
		});
		lines.push('\t\t</CourseProgression>');
	}

	// Arcs
	lines.push(`\t\t<Arcs count="${totalArcs}">`);

	course.arcs.forEach((arc) => {
		const arcModuleCount = arc.modules.length;
		const arcWeeks = arc.durationWeeks;
		const arcDays = arcWeeks * daysPerWeek;

		lines.push(`\t\t\t<Arc order="${arc.order}" name="${escapeXml(arc.title)}" modules="${arcModuleCount}" weeks="${arcWeeks}">`);

		// ArcDescription
		if (arc.description) {
			const arcDescParas = arc.description.split('\n\n').filter(p => p.trim());
			lines.push(`\t\t\t\t<ArcDescription paragraphs="${arcDescParas.length}">`);
			arcDescParas.forEach((para, idx) => {
				lines.push(`\t\t\t\t  <DescriptionParagraph order="${idx + 1}">${escapeXml(para.trim())}</DescriptionParagraph>`);
			});
			lines.push('\t\t\t\t</ArcDescription>');
		}

		// ArcProps
		lines.push('\t\t\t\t<ArcProps>');
		lines.push('\t\t      <ArcMetadata /><!-- placeholder for later implementation of versioning -->');
		lines.push(`\t\t\t\t\t<ArcLogistics modules="${arcModuleCount}" />`);
		lines.push(`\t\t\t\t\t<ArcTemporal weeks="${arcWeeks}" days="${arcDays}" start_date="" end_date="">`);
		lines.push('\t\t\t\t\t  <StartDate date=""/><!-- optional -->');
		lines.push('\t\t\t\t\t\t<EndDate date =""/><!-- optional -->');
		lines.push('\t\t\t\t\t</ArcTemporal>');
		lines.push('\t\t\t\t</ArcProps>');

		// ArcContent
		lines.push(`\t\t\t\t<ArcContent modules="${arcModuleCount}" themes="1">`);

		// Themes
		if (arc.theme || arc.arcThemeNarrative) {
			lines.push('\t\t\t\t\t<Themes count="1">');
			const themeName = arc.theme || '';
			const themeContent = arc.arcThemeNarrative || '';
			lines.push(`  \t\t\t\t\t<ArcTheme name="${escapeXml(themeName)}" order="1">${escapeXml(themeContent)}</ArcTheme>`);
			lines.push('\t\t\t\t\t</Themes>');
		}

		// ArcProgression
		if (arc.arcProgressionNarrative) {
			lines.push('\t\t\t\t\t<ArcProgression>');
			lines.push('\t\t\t\t\t\t<ArcProgressionNarrative>');
			lines.push(`\t\t\t\t\t\t  ${escapeXml(arc.arcProgressionNarrative.trim())}`);
			lines.push('\t\t\t\t\t\t</ArcProgressionNarrative>');
			lines.push('\t\t\t\t\t</ArcProgression>');
		}

		// Modules
		lines.push(`\t\t\t\t\t<Modules count="${arcModuleCount}">`);

		arc.modules.forEach((module) => {
			const moduleWeeks = module.durationWeeks;
			const moduleDays = moduleWeeks * daysPerWeek;
			const hasContent = module.title && module.description;

			if (!hasContent) {
				// Self-closing tag for empty modules
				lines.push(`\t\t\t\t\t\t<Module in_arc="${arc.order}" order="${module.order}" name="" weeks="${moduleWeeks}" days="${moduleDays}" start_date="" end_date="" />`);
			} else {
				// Full module with content
				lines.push(`\t\t\t\t\t\t<Module in_arc="${arc.order}" order="${module.order}" name="${escapeXml(module.title)}" weeks="${moduleWeeks}" days="${moduleDays}" start_date="" end_date="">`);

				// ModuleDescription
				if (module.description) {
					lines.push(`  \t\t\t\t\t\t<ModuleDescription>${escapeXml(module.description)}</ModuleDescription>`);
				}

				// ModuleProps
				lines.push('  \t\t\t\t\t\t<ModuleProps>');
				lines.push('\t\t\t\t\t\t\t  <ModuleMetadata /><!-- placeholder for later implementation of versioning -->');
				lines.push(`                 <ModuleTemporal weeks="${moduleWeeks}" days="${moduleDays}" start_date="" end_date="">`);
				lines.push('                   <StartDate date=""/><!-- optional -->');
				lines.push(`                   <TotalWeeks number="${moduleWeeks}"/>`);
				lines.push('                   <EndDate date =""/><!-- optional -->');
				lines.push('                 </ModuleTemporal>');
				lines.push('\t\t\t\t\t\t\t</ModuleProps>');

				// ModuleContent
				const objectivesCount = module.learningObjectives?.length || 0;
				const topicsCount = module.keyTopics?.length || 0;
				lines.push(`  \t\t\t\t\t\t<ModuleContent learning_objectives="${objectivesCount}" key_topics="${topicsCount}" projects="0">`);

				// Learning Objectives
				if (module.learningObjectives && module.learningObjectives.length > 0) {
					lines.push(`  \t\t\t\t\t\t\t<ModuleLearningObjectives count="${objectivesCount}">`);
					module.learningObjectives.forEach((objective, idx) => {
						lines.push(`  \t\t\t\t\t\t\t\t<LearningObjective order="${idx + 1}">${escapeXml(objective)}</LearningObjective>`);
					});
					lines.push('  \t\t\t\t\t\t\t</ModuleLearningObjectives>');
				}

				// Key Topics
				if (module.keyTopics && module.keyTopics.length > 0) {
					lines.push(`  \t\t\t\t\t\t\t<ModuleKeyTopics count="${topicsCount}">`);
					module.keyTopics.forEach((topic, idx) => {
						lines.push(`  \t\t\t\t\t\t\t\t<KeyTopic order="${idx + 1}">${escapeXml(topic)}</KeyTopic>`);
					});
					lines.push('  \t\t\t\t\t\t\t</ModuleKeyTopics>');
				}

				// ModuleProjects
				lines.push('                <ModuleProjects count="0" /> <!-- not populated during phase 4 -->');

				lines.push('  \t\t\t\t\t\t</ModuleContent>');
				lines.push('\t\t\t\t\t\t</Module>');
			}
		});

		lines.push('\t\t\t\t\t</Modules>');
		lines.push('\t\t\t\t</ArcContent>');
		lines.push('\t\t\t</Arc>');
	});

	lines.push('\t\t</Arcs>');
	lines.push('\t</CourseContent>');
	lines.push('</Course>');
	lines.push(''); // Final newline

	return lines.join('\n');
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

	return `${date}-${sanitized}.xml`;
}

/**
 * Trigger browser download of XML file
 */
export function downloadCourseXml(course: CourseData): void {
	const xmlContent = serializeCourseToXml(course);
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
