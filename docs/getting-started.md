# Getting Started with Pedagogue

## Prerequisites

- **Node.js** 20+ and npm
- **Anthropic API key** ([Get one here](https://console.anthropic.com/))

## Installation

### 1. Get an Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key** and copy your key

**Cost Information:**
- Pay-as-you-go pricing
- Claude Sonnet 4.5: ~£2.20 per million input tokens, ~£11 per million output tokens
- Typical module generation: £0.15-£0.30 (with research enabled)
- New accounts often include free credits

See [Anthropic's pricing](https://www.anthropic.com/pricing) for current rates.

### 2. Clone and Install

```bash
git clone https://github.com/your-org/pedagogue.git
cd pedagogue
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**Security:**
- Never commit `.env` (already in `.gitignore`)
- Keep your API key secure
- Don't share in screenshots or public forums

### 4. Run the Application

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Verify Setup

1. Open http://localhost:5173
2. Click either "Start Module Generator" or "Start Course Builder"
3. Follow the workflow steps
4. You should see successful generation

**Troubleshooting:**
If you see "ANTHROPIC_API_KEY not configured":
- Check `.env` file exists in project root
- Verify API key is correctly set
- Restart dev server after adding key

## Quick Start: Generate Your First Module

### Prepare Input Files

You need three XML files:

**projects.xml** - Project briefs
```xml
<Projects>
  <ProjectBriefs>
    <ProjectBrief>
      <Overview>
        <Name>Example Project</Name>
        <Task>What learners will build</Task>
        <Focus>Key technologies</Focus>
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
```

**skills.xml** - Additional skills
```xml
<AdditionalSkills>
  <SkillsCategory>
    <Name>Category Name</Name>
    <Skill>
      <SkillName>Specific Skill</SkillName>
      <Importance>Recommended</Importance>
      <SkillDescription>Brief description</SkillDescription>
    </Skill>
  </SkillsCategory>
</AdditionalSkills>
```

**research.xml** - Research topics
```xml
<ResearchTopics>
  <PrimaryTopics>
    <PrimaryTopic>
      <TopicName>Topic Name</TopicName>
      <TopicDescription>What to research</TopicDescription>
    </PrimaryTopic>
  </PrimaryTopics>
</ResearchTopics>
```

**Minimal valid files:**
- `<Projects></Projects>`
- `<Skills></Skills>` or `<AdditionalSkills></AdditionalSkills>`
- `<Research></Research>` or `<ResearchTopics></ResearchTopics>`

### Common XML Gotchas

**Special characters must be escaped:**
```xml
<!-- WRONG -->
<Task>Compare with < and > operators</Task>

<!-- CORRECT -->
<Task>Compare with &lt; and &gt; operators</Task>
```

Escape these characters:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;` (in attributes)
- `'` → `&apos;` (in attributes)

**Tags are case-sensitive:**
```xml
<!-- WRONG -->
<Name>Project</name>

<!-- CORRECT -->
<Name>Project</Name>
```

**XML declaration (optional) must be first line:**
```xml
<!-- CORRECT -->
<?xml version="1.0" encoding="UTF-8"?>
<Projects>
```

### Generation Workflow

1. **Upload Files** - Drag & drop your three XML files
2. **Provide Context** - Fill in the structured form:
   - Module duration (weeks)
   - Expected cohort size
   - Learners' experience levels
   - Required technologies
   - Optional: Expected delivery date, additional info
3. **Enable Research** (Recommended) - Allows web search for current best practices
4. **Generate** - Takes 2-4 minutes with research, 30-60 seconds without
5. **Download** - Get your module specification as XML

### Understanding the Output

Generated modules include:

- **Module Overview** - Description and learning objectives (minimum 3)
- **Research Topics** - Primary topics (minimum 5) and optional stretch topics
- **Project Briefs** - Detailed project specifications (minimum 2)
  - Overview, criteria, skills (minimum 3), examples (minimum 3)
- **Project Twists** - Interesting variations (minimum 2)
- **Additional Skills** - Supplementary skills by category
- **Metadata** - Generation info, changelog, provenance tracking

## Tips for Best Results

### 1. Rich Input Files

More detail = better output:
- ✅ Multiple project briefs with detailed criteria
- ✅ 3-5 skills per project with explanations
- ✅ 3-4 examples per project
- ❌ Empty or minimal files

### 2. Be Specific About Technologies

- ✅ "React with TypeScript", "FastAPI", "PostgreSQL"
- ❌ "Frontend framework", "Backend", "Database"

### 3. Use Additional Information Wisely

Good:
- "Learners must deploy to cloud platforms"
- "No paid services - free tiers only"
- "Emphasize testing and CI/CD"

Not helpful:
- Repeating structured fields
- Vague requests like "make it good"

### 4. Enable Research for Current Topics

Essential for:
- ✅ Fast-moving fields (AI/ML, web frameworks)
- ✅ Modules delivered 3+ months away
- ✅ Emerging technologies

Less important for:
- Stable foundational topics (SQL basics, algorithms)
- Historical or theoretical content

### 5. Iterate

1. Generate baseline module
2. Review output
3. Adjust inputs based on what you learned
4. Regenerate

## Troubleshooting

### "ANTHROPIC_API_KEY not configured"

**Solutions:**
1. Check `.env` exists in project root
2. Verify format: `ANTHROPIC_API_KEY=sk-ant-api03-xxxxx`
3. Restart dev server
4. No spaces around `=` sign
5. For production: set in hosting platform's env vars

### "Failed to parse XML file"

**Solutions:**
1. Check for unescaped special characters (`&`, `<`, `>`)
2. Verify all tags properly closed and case-matched
3. Ensure correct root element (`<Projects>`, `<Skills>`, `<Research>`)
4. Use [XML validator](https://www.xmlvalidation.com/)

### "Validation failed after 3 attempts"

**Solutions:**
1. Add more detail to input files
2. Check "Additional Information" for contradictory requirements
3. Try disabling "Extended Thinking"
4. Review validation errors shown

### "Generation timed out"

**Solutions:**
1. Try again (web searches can be slow)
2. Simplify inputs (fewer technologies, shorter additional info)
3. Disable research temporarily

### API Rate Limits

**Symptoms:**
- 429 errors ("rate limit exceeded")
- 402 errors ("insufficient credits")

**Solutions:**
1. Wait a minute and retry (per-minute limits)
2. Check [Anthropic console](https://console.anthropic.com/) billing
3. Disable research for testing to reduce costs

## Next Steps

- **Generate a course:** Try the Course Builder for multi-module courses
- **Explore the codebase:** See `/docs/technical-overview.md`
- **Read about the project:** See `/docs/about-rhea.md`
- **Report issues:** [GitHub Issues](https://github.com/your-org/pedagogue/issues)

## Production Deployment

```bash
# Build
npm run build

# Preview
npm run preview
```

Deploy to:
- Vercel
- Netlify
- Node.js servers
- Other platforms (see [SvelteKit adapters](https://kit.svelte.dev/docs/adapters))

**Important:** Set `ANTHROPIC_API_KEY` in your hosting platform's environment variables.
