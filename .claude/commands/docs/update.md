---
description: Check all project documentation and update accordingly
argument-hint: [reason for update]
# allowed-tools:
# model: claude-sonnet-4-5-20250929
# disable-model-invocation: true
---
<UpdateDocsCommand>
  <Task>
    Check files reference in Documents and make sure they are up to date with the current state of the codebase
  </Task>
  <Documents>
    <UserRequested>
      $ARGUMENTS
    </UserRequested>
    <User>
      - docs/About-Rhea
      - docs/Executive-Summary.md
      - docs/Getting-Started.md
    </User>
    <ProgressDocs>
      <Roadmaps>
        - docs/roadmaps/Rhea-MVP.md
        - docs/roadmaps/mvp-modules/Themis-MVP.md
        - docs/roadmaps/mvp-modules/Tethys-MVP.md
        - docs/roadmaps/mvp-modules/Metis-MVP.md
        - docs/roadmaps/mvp-modules/Atlas-MVP.md
      </Roadmaps>
      <StatusReports>
        - docs/dev/reports/Rhea-Status.md
        - docs/dev/reports/Themis-Status.md
        - docs/dev/reports/Tethys-Status.md
        - docs/dev/reports/Metis-Status.md
      </StatusReports>
    </ProgressDocs>
    <Dev>
      <Info>
        - docs/dev/Technical-Overview.md
        - docs/dev/architecture-decisions.md
      </Info>
      <ImplementationGuides>
        - docs/dev/implementation/schema-validation-implementation.md
      </ImplementationGuides>
      <ReferenceFiles>
        - docs/dev/ref/palettes.jsonc
      </ReferenceFiles>
    </Dev>
  </Documents>
</UpdateDocsCommand>
