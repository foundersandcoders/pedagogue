# Theia: Content Preview & Export
> [!NOTE]
> Initial MVP implementation complete (2025-10-23). Feature is production-ready and integrated into Metis and Themis workflows.

## 1. Tasks
> [!NOTE]
> This tasklist does not include upcoming [MVP Milestones](docs/dev/roadmaps/Theia-MVP.md#2-mvp-milestones)

### 1.1. Open Tasks
#### 1.1.1. Due Tasks

#### 1.1.2. Other Tasks
- [ ] Add PDF export format (currently marked "coming soon" in UI)
- [ ] Add export analytics/usage tracking
- [ ] Create dedicated Theia route for standalone export tool

### 1.2. Blocked Tasks

---

## 2. MVP Milestones
_All initial MVP milestones completed. See section 4.1 for details._

---

## 3. Beyond MVP: Future Features

### 3.1. Export Formats
[ ] PDF generation with custom styling
[ ] JSON export for programmatic consumption
[ ] LaTeX export for academic publications

### 3.2. Advanced Configuration
[ ] Custom CSS themes for HTML export
[ ] Export presets (save/load configurations)
[ ] Batch export (multiple modules/courses)

### 3.3. Standalone Tool
[ ] Dedicated Theia route (`/theia`)
[ ] Upload and export arbitrary module XML
[ ] Export history and management

### 3.4. Collaboration Features
[ ] Share export links
[ ] Collaborative annotations
[ ] Version comparison exports

---

## 4. Work Record
### 4.1. Completed Milestones
#### 4.1.1. Core Export Functionality ✅ COMPLETED (2025-10-23)
**Branch:** `feat/theia`
**PR:** #14
**Commits:** `8874397`, `2e9c2ee`, `e9f39fd`

Implemented comprehensive content preview and export system:

##### Components
- `ExportButton.svelte` - Main export trigger with multiple variants and sizes
- `ExportConfigModal.svelte` - Full-featured configuration modal with:
  - Custom title input
  - Detail level selection (minimal, summary, detailed, complete)
  - Format selection (Markdown, HTML, PDF planned)
  - Section selection grid (9 module sections, 10 course sections)
  - Live preview functionality
  - Select All/Deselect All controls
  - Error handling and validation

##### Services & Utilities
- `theiaService.ts` (254 lines) - Core orchestrator with export, download, and preview functions
- `contentMapper.ts` (962 lines) - XML-to-typography mapping for modules and courses
- `formatters/markdownFormatter.ts` - CommonMark-compatible Markdown with frontmatter
- `formatters/htmlFormatter.ts` - Semantic HTML with comprehensive inline CSS

##### Type Definitions
- `theia.ts` (197 lines) - Complete type system including:
  - `DetailLevel`, `ExportFormat`, `ModuleSection`, `CourseSection`
  - `ExportConfig`, `ExportableContent`, `ModuleXMLContent`
  - `MappedContent`, `ExportResult`

##### Integration
- **Metis Integration** (`ModulePreview.svelte`) - Export generated modules
- **Themis Integration** (`CourseStructureReview.svelte`) - Export course structures

##### Key Features
- ✅ Multiple detail levels (minimal, summary, detailed, complete)
- ✅ Selective section exports
- ✅ Format flexibility (Markdown, HTML)
- ✅ Optional metadata inclusion
- ✅ Table of contents generation
- ✅ Custom title override
- ✅ Client-side export (no server storage)
- ✅ Live preview before export
- ✅ XML parsing and validation
- ✅ Print-ready HTML with responsive design

**Files Added:** 10 files, 2,813 insertions

### 4.2. Completed Tasks
#### 4.2.1. Record of Past Deadlines

#### 4.2.2. Record of Other Completed Tasks
[x] Create reusable content preview exporter (2025-10-23)
    - Maps XML schema to typography layout
    - Supports Themis and Metis content
    - Configurable detail levels
    - Selective export (arcs, modules, sections)
    - Multiple format support (Markdown, HTML)
