/** COURSE
 *
 */
interface Course {
  name: string,
  narrative: string,
  props: CourseProps,
  cohort: Cohort,
  content: CourseContent
}
interface CourseProps {
  metadata: Metadata,
  logistics: CourseLogistics,
  temporal: Temporal
}
interface CourseContent {
  progression: Progression,
  arcs: Arc[]
}
interface CourseLogistics {
  arcs: number,
  modules: number
}

/** ARCS
 *
 */
interface Arc {
  name: string,
  props: ArcProps,
  content: ArcContent
}
interface ArcContent {
  description: string,
  themes: Theme[],
  progression: Progression,
  modules: Module[]
}
interface ArcLogistics {
  modules: number
}
interface ArcProps {
  metadata: Metadata,
  logistics: ArcLogistics,
  temporal: Temporal
}

/** MODULES
 * {-todo} unify with MoGen module types
 */
interface Module {
  name: string,
  props: ModuleProps,
  content: ModuleContent
}
interface ModuleProps {
  metadata: Metadata,
  temporal: Temporal,
  week: number,
  days: number
}
interface ModuleContent {
  description: string,
  // TODO: unify w/ KSBs
  learningObjectives: LearningObjective[], // TODO: unify w/ MoGen research topics
  keyTopics: Topic[]
}

/** COHORT
 *
 */
interface Cohort {
  assumptions: CohortAssumptions
}
interface CohortAssumptions {
  cohortSize: number,
  teamSize: number
}

/** ATOMS
 *
 */
interface LearningObjective {
  name: string,
  description: string
}
interface Metadata {}
interface Progression {
  narrative: string
}
interface Temporal {
  startDate: Date,
  endDate: Date,
  totalWeeks: number,
  daysPerWeek: number,
  totalDays: number
}
interface Theme {
  name: string,
  narrative: string
}
interface Topic {
  name: string,
  description: string
}
