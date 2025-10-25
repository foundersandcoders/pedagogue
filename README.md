# Rhea

An AI-powered curriculum generation tool for peer-led learning cohorts. Rhea uses Claude AI with optional web research to generate comprehensive, up-to-date module specifications and complete multi-week courses.

---

## 1. What Rhea Does

Rhea contains multiple workflows & utilities for curriculum generation and management:

**Rhea**                 | **Themis**                        | **Tethys**                        | **Metis**                       | **Theia**
:-----------------------:|:---------------------------------:|:---------------------------------:|:-------------------------------:|:------------------------------:
![Rhea](static/icon.png) | ![Themis](static/themis/icon.png) | ![Tethys](static/tethys/icon.png) | ![Metis](static/metis/icon.png) | ![Theia](static/theia/icon.png)
*Application Hub*        | *Curriculum Creation*             | *Arc Creation*                    | *Module Creation*               | *Import, Export & Preview*

### 1.1. Key value

Rhea can use web search to ensure your curriculum reflects current industry practices and technologies, not just what Claude knew at training time.

### 1.2. Workflows

<details><summary><strong>Themis:</strong> complete multi-week courses</summary>
  <ul>
    - Thematic arcs organizing related modules
    - Learning progression across modules
    - Course-level narratives and structure
    - Individual module generation (coming soon)
  </ul>
</details>

<details><summary><strong>Tethys:</strong> Arc generation and management tools (planned)</summary>
  <ul>
    - Standalone arc creation between course and module levels
    - Arc-level learning progression design
    - Thematic coherence across related modules
  </ul>
</details>

<details><summary><strong>Metis:</strong> standalone module specifications</summary>
  <ul>
    - Learning objectives and module overview
    - Detailed project briefs with examples and success criteria
    - Research topics with guidance for learners
    - Additional skills categorized by importance
    - Project "twists" to add interesting challenges
  </ul>
</details>

### 1.3. Utilities

<details><summary><strong>Theia:</strong> content management and export</summary>
  <ul>
    - Upload previously generated course JSON files
    - Resume workflows from where you left off
    - Export to Markdown, HTML, or JSON formats
    - Configurable detail levels and section selection
    - Round-trip capability: export → upload → continue
  </ul>
</details>

### 1.4. Coming Soon

- **Mnemosyne:** long-term storage and versioning
- **Atlas:** **At**omic **L**earning **As**sembler

---

## 2. Quick Start

### 2.1. Prerequisites

- Node.js 20+
- Anthropic API key ([get one here](https://console.anthropic.com/))

### 2.2. Installation

```bash
# Clone repository
git clone https://github.com/foundersandcoders/Rhea.git
cd Rhea

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add: ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Run development server
npm run dev
```

Open **http://localhost:5173** to start using Rhea.

**See [Getting Started Guide](/docs/Getting-Started.md) for detailed installation and usage instructions.**

---

## 3. Cost Information

- Claude Sonnet 4.5 pricing: ~£2.20/million input tokens, ~£11/million output tokens
- Typical module generation: **£0.15-£0.30** (with research enabled)
- Course structure generation: **£0.10-£0.20**
- New Anthropic accounts often include free credits

---

## 4. Key Features

<details><summary>📝 Change Tracking & Provenance</summary>
  Every generated module includes comprehensive change tracking to support the **cascade pattern** - where AI-generated modules are updated iteratively whilst maintaining human oversight:

  - **Automatic Changelog**: Documents what changed, why, and with what confidence level
  - **Confidence Scoring**: High/medium/low confidence flags help reviewers prioritize
  - **Research Citations**: Web research sources automatically cited
  - **Provenance Tracking**: Shows when generated, by which model, flags sections needing review

  This enables curriculum councils to:
  - Quickly identify what's been updated since last version
  - Focus review time on low-confidence changes
  - Understand rationale behind AI-proposed updates
  - Track sections needing human review

  See [Changelog Schema Design](/docs/dev/work-records/changelog-schema-design.md) for technical details.
</details>

<details><summary>🔬 Deep Research Capability</summary>
  Enable web search during generation to:
  - Verify technologies/practices are current
  - Update recommendations based on industry trends
  - Search trusted domains: vendor docs, GitHub, Stack Overflow, academic sources
  - Cite sources for transparency

  **This is the core value** - without research, you're just reformatting existing content.
</details>

<details><summary>✅ Schema Validation</summary>
  All generated modules automatically validated against requirements:
  - Minimum 3 module objectives
  - Minimum 5 primary research topics
  - Minimum 2 project briefs with detailed criteria
  - Automatic retry (up to 3 attempts) if validation fails
</details>

<details><summary><strong>📤 Theia:</strong> Content Management & Export</summary>
  Manage previously generated content and export in human-readable formats:
  - **Upload & Resume**: Upload JSON course files to continue workflows in Themis
  - **Round-trip capability**: Export → upload → continue working seamlessly
  - **Multiple formats**: Markdown, HTML, JSON (PDF planned)
  - **Flexible detail levels**: Minimal, summary, detailed, or complete
  - **Selective exports**: Choose specific sections to export
  - **Course or module exports**: Works with both Metis and Themis outputs
  - **Table of contents**: Optional navigation for longer exports
  - **Drag-and-drop interface**: Easy file upload with validation

  Export at any stage, then re-upload to continue work later. Upload existing course structures to review, refine, or generate additional modules.
</details>

### 4.1. Workflows

<details><summary><strong>Theia:</strong> Manage and export content</summary>
  1. Upload previously generated course JSON files
  2. View uploaded course structure
  3. Choose action:
     - Continue in Themis to refine or generate modules
     - Export to human-readable formats (Markdown, HTML)
  4. Configure export settings (detail level, sections, format)
  5. Download formatted content
</details>

<details><summary><strong>Themis:</strong> Complete multi-week courses</summary>
  1. Configure course identity and logistics
  2. Plan thematic arcs
  3. Organize modules within arcs
  4. AI generates detailed structure
  5. Review and refine
  6. Export course overview or structure (JSON for re-upload)
  7. Generate individual modules (coming soon)
</details>

<details><summary><strong>Metis:</strong> Quick standalone modules</summary>
  1. Upload XML inputs (projects, skills, research)
  2. Provide structured context
  3. Generate with optional research
  4. Export preview or download XML specification
</details>

---

## 5. Documentation

### 5.1. For Users

- **[Getting Started](/docs/Getting-Started.md)** - Installation, setup, first module
- **[About Rhea](/docs/About-Rhea.md)** - What it does and why it exists
- **[Executive Summary](/docs/Executive-Summary.md)** - Quick overview

### 5.2. For Developers

- **[Technical Overview](/docs/dev/Technical-Overview.md)** - Architecture, components, patterns
- **[Architecture Decisions](/docs/dev/Architecture-Decisions.md)** - Historical context and rationale
- **[Changelog Schema Design](/docs/dev/work-records/changelog-schema-design.md)** - Change tracking implementation

### 5.3. For Contributors

- **[Roadmaps](/docs/dev/roadmaps/)** - Feature status and priorities
  - [Rhea Roadmap](/docs/dev/roadmaps/Rhea-MVP.md)
    - [Metis Roadmap](/docs/dev/roadmaps/mvp-modules/Metis-MVP.md)
    - [Themis Roadmap](/docs/dev/roadmaps/mvp-modules/Themis-MVP.md)
- **[CLAUDE.md](/CLAUDE.md)** - AI assistant guidance

---

## 6. Metis: Input File Format

Metis accepts XML files for module inputs. Each file must have a specific root element:

<details><summary><code>projects.xml</code></summary>
  <pre>
    <Projects>
      <ProjectBriefs>
        <ProjectBrief>
          <Overview>
            <Name>Project Name</Name>
            <Task>What learners will build</Task>
            <Focus>Key technologies and techniques</Focus>
          </Overview>
          <Criteria>Success criteria as bullet points</Criteria>
          <Skills>
            <Skill>
              <Name>Skill Name</Name>
              <Details>What learners will learn</Details>
            </Skill>
          </Skills>
          <Examples>
            <Example>
              <Name>Example Name</Name>
              <Description>Brief description</Description>
            </Example>
          </Examples>
        </ProjectBrief>
      </ProjectBriefs>
    </Projects>
  </pre>
  <p>
    <strong>Minimal valid:</strong>
    <pre><Projects></Projects></pre>
  </p>
</details>

<details><summary><code>skills.xml</code></summary>
  <pre language="xml">
    <AdditionalSkills>
      <SkillsCategory>
        <Name>Category Name</Name>
        <Skill>
          <SkillName>Specific Skill</SkillName>
          <Importance>Recommended / Stretch / Essential</Importance>
          <SkillDescription>Brief description</SkillDescription>
        </Skill>
      </SkillsCategory>
    </AdditionalSkills>
  </pre>
  <p>
    <strong>Minimal valid:</strong>
    <pre><Skills></Skills></pre>
    or
    <pre><AdditionalSkills></AdditionalSkills></pre>
  </p>
</details>

<details><summary><code>research.xml</code></summary>
  <pre language="xml">
    <ResearchTopics>
      <PrimaryTopics>
        <PrimaryTopic>
          <TopicName>Topic Name</TopicName>
          <TopicDescription>What to research and how to approach it</TopicDescription>
        </PrimaryTopic>
      </PrimaryTopics>
    </ResearchTopics>
  </pre>
  <p>
    <strong>Minimal valid:</strong>
    <pre><ResearchTopics></ResearchTopics></pre>
  </p>
</details>details>

**See [Getting Started Guide](/docs/Getting-Started.md) for common XML gotchas and detailed format specifications.**

---

## 7. Technical Stack

- **SvelteKit** - Application framework with SSR and API routes
- **Node.js 20+** - Runtime environment
- **LangChain + Claude** - AI orchestration (Claude Sonnet 4.5)
- **Zod** - Runtime validation and type safety
- **XML** - Curriculum data format

**See [Technical Overview](/docs/dev/Technical-Overview.md) for architecture details.**

---

## 8. Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 9. Deployment

Rhea can deploy to:
- Vercel
- Netlify
- Node.js servers
- Other platforms (see [SvelteKit adapters](https://kit.svelte.dev/docs/adapters))

**Important:** Set `ANTHROPIC_API_KEY` in your hosting platform's environment variables.

---

## 10. Contributing

Issues and pull requests welcome! Check the [roadmaps](/.claude/docs/roadmaps/) for current priorities.

---

## 11. License

Built for peer-led learning communities.

---

**Need help?** See the [Getting Started Guide](/docs/Getting-Started.md) or create an issue.
