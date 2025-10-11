![Pedagogue](./static/github-header-banner.png)

An AI-powered curriculum generation tool for peer-led learning cohorts. Pedagogue uses Claude AI with optional web research to generate comprehensive, up-to-date module specifications based on your project briefs, skills requirements, and research topics.

## What Pedagogue Does

Pedagogue takes your existing curriculum materials (projects, skills, research topics) and generates a complete module specification that includes:

- Learning objectives and module overview
- Detailed project briefs with examples and success criteria
- Research topics with guidance for learners
- Additional skills categorized by importance
- Project "twists" to add interesting challenges

The key value: **Pedagogue can use web search to ensure your curriculum reflects current industry practices and technologies**, not just what Claude knew at training time.

---

## Quick Start

### 1. Prepare Your Input Files

You'll need three XML files:

- **projects.xml** - Project briefs your learners will work on
- **skills.xml** - Additional skills to incorporate (optional but recommended)
- **research.xml** - Research topics for learners to explore

See [Input File Format](#input-file-format) below for detailed requirements.

### 2. Upload Files

Upload all three XML files in Step 1 of the interface.

### 3. Provide Context

Fill in the structured input form with:
- Module duration (weeks)
- Expected cohort size
- Learners' experience levels
- Required technologies
- Any additional requirements

### 4. Generate Module

Review your inputs and click "Generate Module". With web research enabled (recommended), generation typically takes 2-4 minutes.

### 5. Download Result

Once generation completes, download your module specification as XML.

---

## Input File Format

### Required Structure

Each input file **must** have a specific root element. XML is case-sensitive and tag names matter.

#### projects.xml

```xml
<Projects>
  <!-- Your project briefs here -->
  <ProjectBriefs>
    <ProjectBrief>
      <Overview>
        <Name>Project Name</Name>
        <Task>What learners will build</Task>
        <Focus>Key technologies and techniques</Focus>
      </Overview>
      <Criteria>
        Success criteria as bullet points
      </Criteria>
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
```

**Minimal valid file:**
```xml
<Projects>
</Projects>
```

#### skills.xml

```xml
<AdditionalSkills>
  <!-- Your skills categories here -->
  <SkillsCategory>
    <Name>Category Name (e.g., "Python")</Name>
    <Skill>
      <SkillName>Specific Skill</SkillName>
      <Importance>Recommended / Stretch / Essential</Importance>
      <SkillDescription>Brief description</SkillDescription>
    </Skill>
  </SkillsCategory>
</AdditionalSkills>
```

**Minimal valid file:**
```xml
<Skills>
</Skills>
```

*Note: You can use either `<AdditionalSkills>` (for structured skills) or `<Skills>` (for flexible content).*

#### research.xml

```xml
<ResearchTopics>
  <!-- Your research topics here -->
  <PrimaryTopics>
    <PrimaryTopic>
      <TopicName>Topic Name</TopicName>
      <TopicDescription>
        What to research and how to approach it
      </TopicDescription>
    </PrimaryTopic>
  </PrimaryTopics>
</ResearchTopics>
```

**Minimal valid file:**
```xml
<Research>
</Research>
```

*Note: You can use either `<ResearchTopics>` (structured) or `<Research>` (flexible).*

---

## Common XML Gotchas

### 1. Unescaped Special Characters

**Problem:** XML has special characters that must be escaped.

**Common errors:**
```xml
<!-- WRONG - will cause parse error -->
<Task>Compare values with < and > operators</Task>

<!-- CORRECT -->
<Task>Compare values with &lt; and &gt; operators</Task>
```

**Characters to escape:**
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;` (in attributes)
- `'` → `&apos;` (in attributes)

### 2. Mismatched or Unclosed Tags

```xml
<!-- WRONG -->
<Name>Project Name</name>

<!-- CORRECT - tags are case-sensitive -->
<Name>Project Name</Name>
```

```xml
<!-- WRONG -->
<Overview>
  <Name>Project Name
</Overview>

<!-- CORRECT - all tags must close -->
<Overview>
  <Name>Project Name</Name>
</Overview>
```

### 3. Invalid XML Declaration

If you include an XML declaration, it must be the **first line** with no whitespace before it:

```xml
<!-- WRONG -->

<?xml version="1.0" encoding="UTF-8"?>

<!-- CORRECT -->
<?xml version="1.0" encoding="UTF-8"?>
<Projects>
```

*Note: The XML declaration is optional. If omitted, UTF-8 encoding is assumed.*

### 4. Comments Inside Tags

```xml
<!-- WRONG -->
<Name <!-- This is the project name --> >Project</Name>

<!-- CORRECT -->
<!-- This is the project name -->
<Name>Project</Name>
```

### 5. Empty Elements

Both formats are valid:

```xml
<ProjectBriefs></ProjectBriefs>
<!-- or -->
<ProjectBriefs />
```

---

## Using the Structured Input Form

The form provides context that helps Claude generate a more targeted module specification.

### Required Fields

**Module Duration (weeks)**
- How long learners will spend on this module
- Influences the depth and breadth of content
- Range: 1-52 weeks

**Expected Cohort Size**
- Number of learners
- Helps Claude recommend appropriate group activities and scale
- Range: 1-1000 learners

**Experience in Related Fields**
- Prior experience in broader field (e.g., software development)
- Options: <1 year, 1-3 years, 4+ years

**Experience in Course Focus**
- Prior experience in this specific domain (e.g., AI engineering)
- Options: None, Limited, Skilled Amateur, Current Professional

### Optional Fields

**Expected Delivery Date**
- When the module will run
- If provided, helps research focus on technologies/practices relevant at that time

**Required Technologies & Techniques**
- Select from common options or add custom technologies
- Claude will incorporate these into project briefs and skills
- Be specific: "FastAPI" not just "Python"

**Additional Information**
- Any special requirements, constraints, or goals
- Example: "Learners must deploy to cloud platforms" or "No paid services"
- Max 1000 characters

### Generation Options

**Enable Deep Research** (Recommended)
- Allows Claude to use web search during generation
- Searches trusted domains: vendor docs, established tech publications, academic sources
- Ensures curriculum reflects current best practices
- Adds 1-2 minutes to generation time
- **This is the core value of Pedagogue** - without research, you're just reformatting existing content

**Use Extended Thinking**
- Gives Claude more time to reason about complex requirements
- Useful for modules with many dependencies or advanced topics
- Adds minimal time but improves quality for complex modules

---

## How Generation Works

### What Gets Sent to Claude

1. **Your three input files** (projects, skills, research)
2. **Structured form data** (cohort size, duration, experience levels, etc.)
3. **Schema requirements** (the exact XML structure Claude must produce)
4. **Generation instructions** (how to synthesize inputs into a cohesive module)

### What Claude Does

1. **Analyzes your inputs** to understand learning outcomes
2. **If research enabled:** Uses web search to verify content is current
   - Checks if technologies/practices are outdated
   - Updates recommendations based on current industry trends
   - Limits: 5 searches per generation
   - Allowed domains: anthropic.com, openai.com, langchain.com, github.com, stackoverflow.com, arxiv.org, and other trusted tech sources
3. **Synthesizes everything** into a comprehensive module specification
4. **Validates output** against the schema (see [Output Schema](#output-schema))

### Validation & Retry

Pedagogue automatically validates Claude's output against the required schema. If validation fails (e.g., too few objectives, missing required sections), it will:

1. Show you the validation error
2. Automatically retry with feedback (up to 3 attempts)
3. Include validation errors in the retry prompt so Claude can fix them

You'll see progress updates during this process.

### Generation Time

- **Without research:** 30-60 seconds
- **With research:** 2-4 minutes (searches take time but are worth it)

---

## Output Schema

The generated module follows this structure:

```xml
<Module>
  <ModuleOverview>
    <ModuleDescription>...</ModuleDescription>
    <ModuleObjectives>
      <!-- Minimum 3 distinct objectives -->
      <ModuleObjective>
        <Name>...</Name>
        <Details>...</Details>
      </ModuleObjective>
    </ModuleObjectives>
  </ModuleOverview>

  <ResearchTopics>
    <PrimaryTopics>
      <!-- Minimum 5 distinct topics -->
      <PrimaryTopic>
        <TopicName>...</TopicName>
        <TopicDescription>...</TopicDescription>
      </PrimaryTopic>
    </PrimaryTopics>
    <StretchTopics>
      <!-- Optional extension topics -->
    </StretchTopics>
  </ResearchTopics>

  <Projects>
    <ProjectBriefs>
      <!-- Minimum 2 distinct briefs -->
      <ProjectBrief>
        <Overview>...</Overview>
        <Criteria>...</Criteria>
        <Skills>
          <!-- Minimum 3 distinct skills per brief -->
        </Skills>
        <Examples>
          <!-- Minimum 3 significantly different examples -->
        </Examples>
      </ProjectBrief>
    </ProjectBriefs>

    <ProjectTwists>
      <!-- Minimum 2 interesting twists -->
      <ProjectTwist>
        <Name>...</Name>
        <Task>...</Task>
        <ExampleUses>
          <!-- Minimum 2 examples -->
        </ExampleUses>
      </ProjectTwist>
    </ProjectTwists>
  </Projects>

  <AdditionalSkills>
    <!-- Supplementary skills organized by category -->
  </AdditionalSkills>

  <Notes>
    <!-- Any additional context that doesn't fit elsewhere -->
  </Notes>
</Module>
```

### Validation Requirements

The schema enforces:
- ✅ At least 3 module objectives
- ✅ At least 5 primary research topics
- ✅ At least 2 project briefs
- ✅ At least 3 skills per project brief
- ✅ At least 3 examples per project brief
- ✅ At least 2 project twists
- ✅ At least 2 example uses per twist
- ✅ Proper XML structure with matching tags
- ✅ All required sections present

If any requirement isn't met, Pedagogue will automatically retry with specific feedback.

---

## Information Sources

### When Research is Disabled

Claude uses only:
- Your input files (projects, skills, research)
- Your structured form data
- Claude's training data (knowledge cutoff: January 2025)

### When Research is Enabled

Claude additionally searches these trusted domains:

**AI Platforms & Vendors**
- anthropic.com, openai.com, huggingface.co

**Documentation Sites**
- js.langchain.com, python.langchain.com, modelcontextprotocol.io, docs.python.org

**Developer Resources**
- github.com, stackoverflow.com, dev.to, medium.com

**Tech News & Analysis**
- techcrunch.com, venturebeat.com

**Technical Blogs**
- simonwillison.net, newsletter.pragmaticengineer.com

**Academic Sources**
- arxiv.org, acm.org, ieee.org

This ensures recommendations come from authoritative sources while staying current.

---

## Troubleshooting

### "Failed to parse XML file"

**Cause:** Invalid XML syntax in your input files.

**Solutions:**
1. Check for unescaped special characters (`&`, `<`, `>`)
2. Verify all tags are properly closed and match case
3. Ensure root element is correct (`<Projects>`, `<Skills>`/`<AdditionalSkills>`, `<Research>`/`<ResearchTopics>`)
4. Validate your XML with an online validator

### "Validation failed after 3 attempts"

**Cause:** Claude couldn't produce valid output meeting schema requirements.

**Solutions:**
1. Check if your input files are very sparse (add more detail to help Claude)
2. Verify "Additional Information" field doesn't have contradictory requirements
3. Try disabling "Extended Thinking" (sometimes simpler is better)
4. Review the validation errors shown - they indicate what's missing

### "Generation timed out"

**Cause:** Request took longer than 2 minutes (usually with research enabled).

**Solutions:**
1. Try again (web searches can occasionally be slow)
2. Simplify your inputs (fewer technologies, shorter additional info)
3. Disable research temporarily to get a baseline module

### Output doesn't match your requirements

**Improvements:**
1. Add more detail to your input XML files (Claude follows your examples)
2. Use the "Additional Information" field to specify constraints
3. Be specific about technologies (not "databases" but "PostgreSQL")
4. Enable research if disabled (gets current best practices)

---

## Tips for Best Results

### 1. Provide Rich Input Files

The more detail in your projects, skills, and research files, the better Claude understands what you want:

- ✅ Include multiple project briefs with detailed criteria
- ✅ Specify 3-5 skills per project with explanations
- ✅ Provide 3-4 examples per project to show diversity
- ❌ Don't use empty/minimal input files

### 2. Be Specific About Technologies

Claude responds better to specific technologies than generic categories:

- ✅ "React with TypeScript", "FastAPI", "PostgreSQL"
- ❌ "Frontend framework", "Backend", "Database"

### 3. Use Additional Information Wisely

Great uses:
- "Learners must deploy projects to cloud platforms"
- "No paid services - use only free tiers"
- "Projects should emphasize testing and CI/CD"

Not helpful:
- Repeating what's already in structured fields
- Vague requests like "make it good"

### 4. Enable Research for Current Topics

Essential for:
- ✅ Fast-moving fields (AI/ML, web frameworks)
- ✅ Modules being delivered 3+ months from now
- ✅ Emerging technologies or practices

Less important for:
- Stable, foundational topics (SQL basics, algorithms)
- Historical or theoretical modules

### 5. Iterate

Pedagogue excels at refinement:
1. Generate a baseline module
2. Review what Claude produced
3. Adjust your inputs based on what you learned
4. Generate again

---

## Model Information

Pedagogue uses **Claude Sonnet 4.5** (claude-sonnet-4-5-20250929):
- 200K token context window (can handle large input files)
- Up to 64K output tokens (comprehensive modules)
- Web search capability (when enabled)
- Extended thinking capability (when enabled)

---

## License & Support

Pedagogue is built for peer-led learning communities.

For issues or questions: Create an issue in the repository or check the `/docs` folder for technical documentation.

**Note:** You'll need your own Anthropic API key. Set `ANTHROPIC_API_KEY` in your environment variables before running Pedagogue.

---

## Example Workflow

Let's walk through generating a module about "AI Agents and Tool Use":

1. **Create projects.xml** with two project briefs:
   - "Web Research Agent" - uses search APIs
   - "Personal Assistant Agent" - integrates calendar/email

2. **Create skills.xml** listing Python, API integration, prompt engineering

3. **Create research.xml** with topics like:
   - "ReAct framework and reasoning patterns"
   - "LangChain agent abstractions"
   - "Function calling with OpenAI/Anthropic"

4. **Fill the form:**
   - Duration: 3 weeks
   - Cohort: 12 learners
   - Experience: Limited experience in AI, 1-3 years in software dev
   - Technologies: Python, LangChain, FastAPI
   - Enable research: ✅

5. **Generate** - takes ~3 minutes with research

6. **Review & Download** - Claude produces:
   - 3-5 learning objectives
   - 5-8 research topics with guidance
   - 2 detailed project briefs with examples
   - Additional skills (testing agents, managing state, error handling)
   - Project twists (multi-agent systems, human-in-the-loop)

7. **Refine** (if needed):
   - Add more specific examples to projects.xml
   - Request different deployment targets in "Additional Information"
   - Re-generate

That's it! You now have a comprehensive, current module specification ready for your learners.
