# Rhea MVP

## 1. Current State of Rhea
Since Rhea is the aggregate of all submodules, this section should summarise both this document's own content and the content of the following:
- [Themis MVP](.claude/docs/roadmaps/mvp-modules/Themis-MVP.md)
- ~~[Tethys MVP](.claude/docs/roadmaps/mvp-modules/Tethys-MVP.md)~~ *not yet started*
- [Metis MVP](.claude/docs/roadmaps/mvp-modules/Metis-MVP.md)
- ~~[Atlas MVP](.claude/docs/roadmaps/mvp-modules/Atlas-MVP.md)~~ *not yet started*

### 1a. Next Up
The 5 most significant or important tasks to tackle next.

1. **[Content preview exporter](#2a-tasks-with-a-deadline)** `2025-10-22` - Reusable exporter for human-readable content from Themis and Metis
2. **[Build ModuleGenerationList Component](mvp-modules/Themis-MVP.md#17-build-modulegenerationlist-component-step-4--pending)** (Themis 1.7) - Module-by-module generation orchestration UI
3. **[Create /api/themis/module/generate Endpoint](mvp-modules/Themis-MVP.md#18-create-apithemismodulegenerate-endpoint--pending)** (Themis 1.8) - API layer for course-aware module generation
4. **[Extend Module Generation with Course Context](mvp-modules/Themis-MVP.md#19-extend-module-generation-with-course-context--pending)** (Themis 1.9) - Modify prompt factories for course-aware generation (may require Metis updates)
5. **[Build CourseOverview Component](mvp-modules/Themis-MVP.md#110-build-courseoverview-component-step-5--pending)** (Themis 1.10) - Final review interface and export functionality trigger

### 1b. Recent Wins
The 5 most recent achievements.

1. **[Themis arc-based structure complete](mvp-modules/Themis-MVP.md#37-reimplement-the-module-overview-generation-based-on-thematic-arcs--completed)** - Six-step workflow with thematic organizational layer between courses and modules
2. **[Architectural refactoring complete](mvp-modules/Metis-MVP.md#32-architectural-refactoring-2025-10-20--completed)** - 670+ lines eliminated via factories, utilities, and centralized configurations
3. **[Themis localStorage persistence](mvp-modules/Themis-MVP.md#113-add-localstorage-persistence--completed)** - Auto-save course progress via `persistedStore()` utility
4. **[Centralized error handling infrastructure](mvp-modules/Metis-MVP.md#334-quality-improvements)** - ErrorBoundary component, typed error classes, and error stores
5. **[Metis changelog and provenance tracking](mvp-modules/Metis-MVP.md#48-implement-changelog-in-returned-modules--completed)** - Change tracking with confidence scoring for AI updates

---

## 2. Rhea Tasklist
Tasks that do not belong to a specific submodule, or that belong to all of them

### 2a. Tasks with a Deadline
- [ ] `2025-10-22` create a reusable "content preview exporter"
  - **Criteria**
    1. Exports a human-readable version of generated content by mapping xml schema to typographic layout
    2. Can read and export content from both *Themis* and *Metis*, as well as future modules.
    3. Allows user to modify the level of detail exported
    4. Allows user to export content at any stage of the generation process
  - **Examples**
    1. User used *Themis* to generate a course overview and 4 arcs, then exported a preview of only the first and last arc; this contained no content from...
        - course overview
        - the child modules of arc 1
        - arc 2
        - arc 3
        - the child modules of arc 4
    2. User used *Themis* to generate a course overview and 4 arcs. Exported a preview of only the third module of the final arc
    3. User used *Themis* to generate a course overview and exported that content before arc or module generation occurred
    4. User used *Metis* to generate a module, then exported only the Twists from that module

### 2b. Tasks with no Deadline
- [ ] Create colour palettes for Rhea, Themis, Tethys and Metis based on their icons
