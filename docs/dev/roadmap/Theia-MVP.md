# Theia: Content Preview & Export
> [!NOTE]
> Initial MVP implementation complete (2025-10-23). Feature is production-ready and integrated into Metis and Themis workflows.

## 1. Tasks
> [!NOTE]
> This tasklist does not include upcoming [MVP Milestones](docs/dev/roadmaps/Theia-MVP.md#2-mvp-milestones)

### 1.1. Open Tasks
#### 1.1.1. Due Tasks

#### 1.1.2. Other Tasks
[ ] 1.1.2.1. When file is uploaded, UI should navigate to correct step automatically
[ ] 1.1.2.2. Add PDF export format (currently marked "coming soon" in UI)
[ ] 1.1.2.3. Add export analytics/usage tracking
[ ] 1.1.2.4. Implement Module XML upload & workflow resume functionality (see section 2.1.1)

### 1.2. Blocked Tasks

---

## 2. MVP Milestones

### 2.1. JSON/XML Upload & Workflow Resume — IN PROGRESS
**Target:** Q1 2026
**Priority:** Medium
**Dependencies:** None for JSON upload (✅ complete), Themis course XML schema for XML upload
**Objective:** Enable users to upload previously generated files and either continue work in the original workflow or preview/export them standalone.

#### 2.1.1. Module Upload (Deferred to XML Phase)
**Components:**
- `/theia` route with upload interface
  - File upload component (drag-drop + file picker)
  - XML validation and type detection
  - File metadata display
- XML-to-store transformation utilities
  - Parse module XML into Metis store structure
  - Validate against `moduleValidator.ts`
  - Populate `localStorage` state correctly

**User Actions:**
- Upload module XML file
- Choose action:
  - **"Continue in Metis"** → populate `metisStores`, redirect to `/metis/update` at preview step
  - **"Preview/Export"** → use existing Theia export functionality
- Handle validation errors gracefully

**Technical Implementation:**
- Reuse `contentMapper.ts` for XML parsing
- Create `xmlToStoreTransformer.ts` utility
- Add route guards to ensure valid state before workflow continuation
- Error handling for corrupt/invalid XML

#### 2.1.2. Course Upload (After Themis Course XML)
**Prerequisites:**
- Themis course XML schema implementation
- Course XML export functionality

**Additional Features:**
- Parse course XML into Themis store structure
- **"Continue in Themis"** → redirect to `/themis/generate` at structure review step
- Course-specific validation

#### Out of Scope for MVP
- Batch upload (multiple files)
- Version comparison between uploads
- Upload history/management UI
- In-app XML editing before continuation
- Cloud storage integration

**Success Criteria:**
- ✅ Users can upload valid module XML
- ✅ Successful workflow continuation with pre-populated data
- ✅ Validation errors are clear and actionable
- ✅ Export functionality works on uploaded content
- ✅ `localStorage` state persists correctly after upload

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

### 3.3. Upload & Management Enhancements
[ ] Batch upload (multiple XML files)
[ ] Upload history and management UI
[ ] Version comparison between uploads
[ ] In-app XML editing before workflow continuation
[ ] Cloud storage integration

### 3.4. Collaboration Features
[ ] Share export links
[ ] Collaborative annotations
[ ] Version comparison exports

---

## 4. Work Record
### 4.1. Completed Milestones

#### 4.1.2. Course Structure Upload (JSON) ✅ COMPLETED (2025-10-24)
**Branch:** `theia/feat/continue-session-from-xml`
**PR:** #21
**Commits:** `8e75209` through `0363410`

Implemented complete JSON course upload and validation system:

##### Components
- `/theia` route - Main Theia page with course upload interface
- `CourseStructureUpload.svelte` - Comprehensive upload component with:
  - Drag-and-drop file upload
  - Manual file selection
  - Real-time JSON validation
  - Clear error messaging
  - Auto-redirect to Themis on successful upload

##### Services & Utilities
- `courseValidator.ts` (225 lines) - Zod-based validation for:
  - Complete course structure validation
  - Arc and module hierarchy validation
  - Logistics and learner data validation
  - Partial course support (for incomplete workflows)

##### Test Data
- `partial-course.json` - Incomplete course for testing partial uploads
- `valid-complete-course.json` - Full course structure for testing complete uploads

##### Integration
- **JSON Export** - Added JSON format to `ExportConfigModal.svelte`
- **Round-trip workflow** - Export from Themis → upload to Theia → continue in Themis
- **Home page** - Theia workflow card added and promoted to primary position
- **Theming** - Theia palette (magenta/cyan) integrated across platform

##### Key Features
- ✅ JSON course file upload with validation
- ✅ Drag-and-drop interface
- ✅ Comprehensive error handling
- ✅ Support for partial/incomplete courses
- ✅ Auto-population of Themis store on success
- ✅ Seamless workflow continuation
- ✅ JSON export format for round-trip capability
- ✅ Theia branding and palette integration

**Files Added:** 3 files (CourseStructureUpload.svelte, courseValidator.ts, test data)
**Files Modified:** 18 files
**Total Changes:** 2,417 insertions

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
