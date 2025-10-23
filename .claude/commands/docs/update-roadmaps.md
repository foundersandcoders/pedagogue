---
description: Update project roadmaps
# argument-hint: []
# allowed-tools:
# model: claude-sonnet-4-5-20250929
# disable-model-invocation: true
---

<Steps>
  <Step num="1" name="shuffle content">
    <Task>Check whether content needs to be moved to a different Roadmap</Task>
  </Step>
  <Step num="2" name="loop through roadmaps">
    <Task>For each Roadmap, go through Loop and perform Task within target_section</Task>
    <Roadmaps>
      <Roadmap num="1" name="Rhea" status="active" path="docs/dev/roadmaps/Rhea-MVP.md" />
      <Workflows>
        <Roadmap num="1" name="Themis" status="active" path="docs/dev/roadmaps/Themis-MVP.md" />
        <Roadmap num="2" name="Tethys" active="planned" path="docs/dev/roadmaps/Tethys-MVP.md" />
        <Roadmap num="3" name="Metis" status="active" path="docs/dev/roadmaps/Metis-MVP.md" />
      </Workflows>
      <Utilities>
        <Roadmap num="1" name="Theia" status="active" path="docs/dev/roadmaps/Theia-MVP.md" />
        <Roadmap num="2" name="Atlas" status="planned" path="docs/dev/roadmaps/Atlas-MVP.md" />
      </Utilities>
    </Roadmaps>
    <Loop>
      <Task num="1" target_section="1.1.1" name="tasks open due">
        1. Check for completed tasks based on codebase state
        2. Move them to 4.2.1
      </Task>
      <Task num="2" target_section="1.1.2" name="tasks open other">
        1. Check for completed tasks based on codebase state
        2. Move them to 4.2.2
      </Task>
      <Task num="3" target_section="1.2" name="tasks blocked">
        1. Check for unblocked or completed tasks based on codebase state
        2. Move them to:
          - (unblocked) 1.1.2
          - (completed) 4.2.2
      </Task>
      <Task num="4" target_section="2" name="current">
        1. Check for completed milestones based on codebase state
        2. Move them to 4.1
      </Task>
    </Loop>
  </Step>
  <Step num="3" name="update README">
    Using all content from within docs/dev/roadmaps, update docs/dev/roadmaps/README.md
  </Step>
  <Step num="4" name="report to user">
    <Task>Tell the user what you changed</Task>
  </Step>
</Steps>
