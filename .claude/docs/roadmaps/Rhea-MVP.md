# Rhea MVP

## 1. Current State of Rhea
Since Rhea is the aggregate of all submodules, this section should summarise both this document's own content and the content of the following:
- [Themis MVP](.claude/docs/roadmaps/mvp-modules/Themis-MVP.md)
- ~~[Tethys MVP](.claude/docs/roadmaps/mvp-modules/Tethys-MVP.md)~~ *not yet started*
- [Metis MVP](.claude/docs/roadmaps/mvp-modules/Metis-MVP.md)
- ~~[Atlas MVP](.claude/docs/roadmaps/mvp-modules/Atlas-MVP.md)~~ *not yet started*

### 1a. Next Up
The 5 most significant or important tasks to tackle next.

### 1b. Recent Wins
The 5 most recent achievements.

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
