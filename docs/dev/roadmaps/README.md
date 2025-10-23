# Project Status

## 1. Contents
> [!NOTE]
> Since Rhea is the aggregate of all submodules, this section summarises roadmaps for all submodules actively in development.

### 1.1. Active Development
- [Rhea (Platform)](docs/dev/roadmaps/Rhea-MVP.md)

#### 1.1.1. Workflow Modules
- [Themis (Course Builder)](docs/dev/roadmaps/Themis-MVP.md)
- [Metis (Module Generator)](docs/dev/roadmaps/Metis-MVP.md)

#### 1.1.2. Utility Modules
- [Theia (Content Preview & Export)](docs/dev/roadmaps/Theia-MVP.md)

### 1.2. Planned
#### 1.2.1. Planned Workflow Modules
- [Tethys (Arc Designer)](docs/dev/roadmaps/Tethys-MVP.md)

#### 1.2.2. Planned Utility Modules
- [Atlas (Atomic Learning Assembler)](docs/dev/roadmaps/Atlas-MVP.md)

---

## 2. Current State
Rhea is an AI-powered curriculum generation platform with two primary workflows: **Metis** (standalone module generation) and **Themis** (multi-module course generation). Following major architectural refactoring in October 2025-10, the codebase now features factories, utilities, and centralized configurations that enable rapid feature development.

### 2.1. Rhea Platform
**Status:** Foundation complete, UI polish ongoing

The platform provides a hub-based navigation structure with module-specific colour palettes and centralized error handling. Recent work focused on establishing reusable patterns for state management (`persistedStore()`), AI client configuration (agent factories), and prompt construction (composable prompt components). Cross-module concerns like British English output and the Theia content exporter remain pending.

### 2.2. Workflow Modules
#### 2.2.1. Themis (Course Builder)
**Completion:** ~60% - Structure complete, generation pending
- ✅ Foundation (hub, types, stores, config form)
- ✅ Arc-based structure planning with thematic organization
- ✅ AI structure generation with web research integration
- ✅ Structure review interface with editable narratives
- ✅ localStorage persistence for auto-save/restore
- 📋 Module generation orchestration (6 remaining milestones - critical path)
- 📋 Course XML schema and export functionality

**Next:** Module generation workflow (ModuleGenerationList component, course-aware API endpoint, CourseOverview export interface)

#### 2.2.2. Tethys (Arc Designer)
**Status:** Planned - Not yet started

Tethys will provide standalone arc design capabilities outside of full course generation. Currently, arc features are embedded within Themis workflow.

#### 2.2.3. Metis (Module Generator)
**Completion:** ~95% - Feature complete, polish pending
- ✅ Complete module generation workflow with file upload and structured input
- ✅ AI-powered generation with Claude Sonnet 4.5
- ✅ Deep research capability with web search integration
- ✅ XML schema validation with automatic retry logic (max 3 attempts)
- ✅ Changelog and provenance tracking with confidence scoring
- ✅ SSE streaming for progress feedback
- ✅ Intelligent step navigation with automatic advancement
- 📋 UI improvements (aesthetic refinement, dark mode)
- 📋 Boilerplate module text insertion

**Next:** UI polish and potential integration with Themis course-aware generation

### 2.3. Utility Modules
#### 2.3.1. Theia (Content Preview & Export)
**Status:** Planned - Due 2025-10-22

Reusable content exporter for human-readable previews of generated content. Will support both Themis and Metis output with configurable detail levels and selective export (e.g., export only specific arcs or modules).

#### 2.3.2. Atlas (Atomic Learning Assembler)
**Status:** Planned - Not yet started

Will provide atomic learning unit assembly capabilities for granular curriculum construction.

---

## 3. Next Milestones
> [!NOTE]
> The 5 most significant or important tasks to tackle next.

1. **[Theia: Content Preview Exporter](#2a-tasks-with-a-deadline)** `2025-10-22` - Reusable exporter for human-readable content from Themis and Metis
2. **[Build ModuleGenerationList Component](Themis-MVP.md#17-build-modulegenerationlist-component-step-4--pending)** (Themis 1.7) - Module-by-module generation orchestration UI
3. **[Create /api/themis/module/generate Endpoint](Themis-MVP.md#18-create-apithemismodulegenerate-endpoint--pending)** (Themis 1.8) - API layer for course-aware module generation
4. **[Extend Module Generation with Course Context](Themis-MVP.md#19-extend-module-generation-with-course-context--pending)** (Themis 1.9) - Modify prompt factories for course-aware generation (may require Metis updates)
5. **[Build CourseOverview Component](Themis-MVP.md#110-build-courseoverview-component-step-5--pending)** (Themis 1.10) - Final review interface and export functionality trigger

## 4. Recent Wins
> [!NOTE]
> 6 most recent achievements in this codebase

1. **[Module colour palettes](Rhea-MVP.md#422-record-of-other-completed-tasks)** (2025-10-23) - Dynamic palette system with CSS custom properties for Rhea, Themis, Tethys, and Metis
2. **[Themis arc-based structure complete](Themis-MVP.md#47-reimplement-the-module-overview-generation-based-on-thematic-arcs--completed)** - Six-step workflow with thematic organizational layer between courses and modules
3. **[Architectural refactoring complete](Rhea-MVP.md#411-architectural-refactoring-2025-10-20--completed)** (2025-10-20) - 670+ lines eliminated via factories, utilities, and centralized configurations
4. **[Themis localStorage persistence](Themis-MVP.md#48-add-localstorage-persistence--completed)** - Auto-save course progress via `persistedStore()` utility
5. **[Centralized error handling infrastructure](Rhea-MVP.md#4114-quality-improvements)** - ErrorBoundary component, typed error classes, and error stores
6. **[Metis changelog and provenance tracking](Metis-MVP.md#418-implement-changelog-in-returned-modules--completed)** - Change tracking with confidence scoring for AI updates
