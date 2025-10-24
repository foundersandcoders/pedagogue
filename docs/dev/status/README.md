# Project Status
> [!NOTE]
> Since Rhea is the aggregate of all submodules, this section summarises roadmaps for all submodules actively in development.

---

## 1. Submodule Roadmaps

### 1.1. Core Modules
- 1.1.1. [**Rhea:**](docs/dev/roadmaps/Rhea-MVP.md) _Platform_

### 1.2. Workflow Modules
- 1.2.1. [**Themis:**](docs/dev/roadmaps/Themis-MVP.md) _Course Builder_
- 1.2.2. [**Tethys:**](docs/dev/roadmaps/Tethys-MVP.md) _Arc Designer_
- 1.2.3. [**Metis:**](docs/dev/roadmaps/Metis-MVP.md) _Module Generator_

### 1.3. Utility Modules
- 1.3.1. [**Theia:**](docs/dev/roadmaps/Theia-MVP.md) _Content Preview & Export_
- 1.3.2. [**Atlas:**](docs/dev/roadmaps/Atlas-MVP.md) _Atomic Learning Assembler_
- 1.3.3. [**Mnemosyne:**](docs/dev/roadmaps/Mnemosyne-MVP.md) _Storage & Retrieval_

---

## 2. Current State
> [!NOTE]
> Following major architectural refactoring in October 2025-10, the codebase now features factories, utilities, and centralized configurations that enable rapid feature development.

### 2.1. Rhea: Core Platform
<details><summary>Status: ~90% MVP</summary>
    <ul>
        <li>Foundation complete</li>
        <li>UI polish ongoing</li>
    </ul>
</details>
<details><summary>Implemented</summary>
    <p>The platform provides a hub-based navigation structure with module-specific colour palettes and centralized error handling.</p>
    <p>Recent work focused on establishing reusable patterns for state management (<code>persistedStore()</code>), AI client configuration (agent factories), and prompt construction (composable prompt components).</p>
</details>
<details><summary>Next Up</summary>
    <ul>
        <li>British English output</li>
    </ul>
</details>

### 2.2. Workflow Modules

#### 2.2.1. Themis: Course Builder
<details><summary>Status: ~60% MVP</summary>
    <p>Structure complete, module generation pending</p>
</details>
<details><summary>Implemented</summary>
    <ul>
        <li>✅ Foundation (hub, types, stores, config form)</li>
        <li>✅ Arc-based structure planning with thematic organization</li>
        <li>✅ AI structure generation with web research integration</li>
        <li>✅ Structure review interface with editable narratives</li>
        <li>✅ <code>localStorage</code> persistence for auto-save/restore</li>
        <li>📋 Module generation orchestration (6 remaining milestones - critical path)</li>
        <li>📋 Course XML schema and export functionality</li>
    </ul>
</details>
<details><summary>Next Up</summary>
    <p>Module generation workflow</p>
    <ul>
        <li><code>ModuleGenerationList</code> component</li>
        <li>course-aware API endpoint</li>
        <li><code>CourseOverview</code> export interface</li>
    </ul>
</details>

#### 2.2.2. Tethys: Arc Designer
<details><summary>Status: 0% MVP</summary>
    <p>Not yet started</p>
</details>
<details><summary>Implemented</summary>
    <p><strong>Tethys</strong> will provide standalone arc design capabilities outside of full course generation.</p>
    <p>Currently, arc features are embedded within <strong>Themis</strong> workflow.</p>
</details>
<details><summary>Next Up</summary>
    <ul>
        <li>On hold until after <strong>Themis</strong> & <strong>Metis</strong> fully implemented</li>
    </ul>
</details>

#### 2.2.3. Metis: Module Generator
<details><summary>Status: ~95% MVP</summary>
    <p>Feature complete, polish pending</p>
</details>
<details><summary>Implemented</summary>
    <ul>
        <li>✅ Complete module generation workflow with file upload and structured input</li>
        <li>✅ AI-powered generation with Claude Sonnet 4.5</li>
        <li>✅ Deep research capability with web search integration</li>
        <li>✅ XML schema validation with automatic retry logic (max 3 attempts)</li>
        <li>✅ Changelog and provenance tracking with confidence scoring</li>
        <li>✅ SSE streaming for progress feedback</li>
        <li>✅ Intelligent step navigation with automatic advancement</li>
        <li>📋 UI improvements (aesthetic refinement, dark mode)</li>
        <li>📋 Boilerplate module text insertion</li>
    </ul>
</details>
<details><summary>Next Up</summary>
    <ul>
        <li>UI polish</li>
        <li>Integration with <strong>Themis</strong> course-aware generation</li>
    </ul>
</details>

### 2.3. Utility Modules

#### 2.3.1. Theia: Content Preview & Export
<details><summary>Status: ~100% MVP ✅</summary>
    <p>Initial implementation complete and production-ready</p>
</details>
<details><summary>Implemented</summary>
    <ul>
        <li>✅ Reusable content exporter for human-readable previews</li>
        <li>✅ Supports both Themis and Metis output</li>
        <li>✅ Configurable detail levels (minimal, summary, detailed, complete)</li>
        <li>✅ Selective export (specific arcs, modules, or sections)</li>
        <li>✅ Multiple formats (Markdown, HTML; PDF planned)</li>
        <li>✅ Live preview before export</li>
        <li>✅ Client-side processing (no server storage)</li>
        <li>✅ Integrated into Metis and Themis workflows</li>
    </ul>
    <p>Implemented October 2025-10-23 via PR #14 (2,813 lines across 10 files)</p>
</details>
<details><summary>Next Up</summary>
    <ul>
        <li>PDF export format</li>
        <li>Export analytics/usage tracking</li>
        <li>Standalone Theia route for independent use</li>
    </ul>
</details>

#### 2.3.2. Atlas: Atomic Learning Assembler
<details><summary>Status: ~0% MVP</summary>
    <p>Not yet started</p>
</details>
<details><summary>Implemented</summary>
    <p>Will provide atomic learning unit assembly capabilities for granular curriculum construction.</p>
</details>
<details><summary>Next Up</summary>
    <ul>
        <li>On hold until MVP reached</li>
    </ul>
</details>

#### 2.3.3. Mnemosyne: Storage & Retrieval
<details><summary>Status: ~0% MVP ✅</summary>
    <p>To Do</p>
</details>
<details><summary>Implemented</summary>
    <ul>
        <li>Nothing implemented</li>
    </ul>
</details>
<details><summary>Next Up</summary>
    <ul>
        <li>Plan feature</li>
    </ul>
</details>

---

## 3. Next Milestones
> [!NOTE]
> The 5 most significant or important tasks to tackle next.

1. **[Build `ModuleGenerationList` Component](Themis-MVP.md#17-build-modulegenerationlist-component-step-4--pending)** (Themis 1.7) - Module-by-module generation orchestration UI
2. **[Create `/api/themis/module/generate` Endpoint](Themis-MVP.md#18-create-apithemismodulegenerate-endpoint--pending)** (Themis 1.8) - API layer for course-aware module generation
3. **[Extend Module Generation with Course Context](Themis-MVP.md#19-extend-module-generation-with-course-context--pending)** (Themis 1.9) - Modify prompt factories for course-aware generation (may require Metis updates)
4. **[Build `CourseOverview` Component](Themis-MVP.md#110-build-courseoverview-component-step-5--pending)** (Themis 1.10) - Final review interface and export functionality trigger
5. **[Steer Claude towards British English](Rhea-MVP.md#112-other-tasks)** (Rhea) - Ensure all AI-generated content uses British spellings and phrasing

---

## 4. Recent Wins
> [!NOTE]
> 6 most recent achievements in this codebase

1. **[Theia: Content Preview & Export complete](Theia-MVP.md#21-core-export-functionality--completed-2025-10-23)** (2025-10-23) - Production-ready export system with Markdown/HTML formats, configurable detail levels, and selective section export (2,813 lines)
2. **[Workflow colour palettes](Rhea-MVP.md#422-record-of-other-completed-tasks)** (2025-10-23) - Dynamic palette system with CSS custom properties for Rhea, Themis, Tethys, and Metis
3. **[Themis arc-based structure complete](Themis-MVP.md#47-reimplement-the-module-overview-generation-based-on-thematic-arcs--completed)** - Six-step workflow with thematic organizational layer between courses and modules
4. **[Architectural refactoring complete](Rhea-MVP.md#411-architectural-refactoring-2025-10-20--completed)** (2025-10-20) - 670+ lines eliminated via factories, utilities, and centralized configurations
5. **[Themis `localStorage` persistence](Themis-MVP.md#48-add-localstorage-persistence--completed)** - Auto-save course progress via `persistedStore()` utility
6. **[Centralized error handling infrastructure](Rhea-MVP.md#4114-quality-improvements)** - `ErrorBoundary` component, typed error classes, and error stores
