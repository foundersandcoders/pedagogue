# Build-Time Palette CSS Generation

## Core Principle

**SINGLE SOURCE OF TRUTH**: All colour data flows from TypeScript palette files through build-time generation to CSS.

```
TypeScript Palettes → Build Script → Generated CSS → Components
   (source of truth)   (automation)   (consumed)    (use variables)
```

## Architecture

### 1. Source of Truth
**Location:** `src/lib/config/palettes/*.ts`

All palette colours are defined here in semantic TypeScript structures:
```typescript
export const rheaPalette: RheaPalette = {
  colours: {
    dark: { name: "depths", colour: "#00221Aff" },
    background: {
      primary: { main: "#0E6B68ff", subtle: "#F0F8F7ff", nav: "#D5E8E6ff" },
      // ...
    }
  }
};
```

### 2. Build-Time Generation
**Script:** `scripts/generatePaletteCss.js`

This script:
- Parses TypeScript palette files at build time
- Extracts colour values using regex
- Generates CSS custom properties
- Writes to `src/lib/styles/palettes.generated.css`

**Auto-run:**
- Before every build (`prebuild` script)
- Before every dev server start
- Manually via `npm run generate:palettes`

### 3. Generated CSS Variables

The script generates two types of CSS variables:

**Workflow-specific (always available):**
```css
:root {
  --metis-bg-subtle: #E8F1F8ff;
  --metis-fg-alt-dark: #096A78ff;
  --themis-bg-subtle: #F0ECF8ff;
  --themis-fg-alt-dark: #7551BA ff;
  /* etc. */
}
```

**Dynamic palette variables (route-specific):**
```css
[data-palette="metis"] {
  --palette-primary: #00121Fff;
  --palette-foreground: #096A78ff;
  /* etc. */
}
```

### 4. Usage in Components

**Hub screen (uses multiple workflow colours):**
```css
.metis-card {
  background: var(--metis-bg-subtle);
}

.metis-card:hover {
  border-color: var(--metis-fg-alt-dark);
}
```

**Workflow pages (use dynamic palette):**
```css
.header {
  background: var(--palette-bg-nav);
  color: var(--palette-foreground);
}
```

## Workflow

### Modifying Colours

1. Edit the TypeScript palette file in `src/lib/config/palettes/`
2. The CSS regenerates automatically on next `npm run dev` or `npm run build`
3. All components using those variables update instantly

### Adding a New Workflow Palette

1. Create `src/lib/config/palettes/newWorkflowPalette.ts` following the `PaletteStructure` interface
2. Update `scripts/generatePaletteCss.js` to import and include the new palette
3. Run `npm run generate:palettes`
4. Use the new variables: `var(--newworkflow-bg-subtle)`

## Benefits

✅ **True single source** - Change TypeScript, CSS updates everywhere
✅ **No duplication** - Colours defined once, used everywhere
✅ **Build-time** - Zero runtime overhead, no FOUC
✅ **Type-safe** - TypeScript validates palette structure
✅ **Automated** - Runs before every build/dev
✅ **Maintainable** - Clear data flow, easy to understand

## Files

| File | Role | Edit? |
|------|------|-------|
| `src/lib/config/palettes/*.ts` | Palette data (source of truth) | ✅ Yes |
| `scripts/generatePaletteCss.js` | Build script | Only to add workflows |
| `src/lib/styles/palettes.generated.css` | Generated CSS | ❌ Never (auto-generated) |
| `src/routes/+layout.svelte` | Imports generated CSS | No changes needed |
| Components `*.svelte` | Use CSS variables | ✅ Yes |

## Migration from Old System

### Before (duplicated, manual)
```css
/* palettes.css - manually maintained */
:root {
  --palette-primary: #00221A;  /* Must match TypeScript */
}
```

### After (generated, automatic)
```typescript
// rheaPalette.ts - single source
export const rheaPalette = {
  colours: { dark: { colour: "#00221Aff" } }
};
```

```css
/* palettes.generated.css - AUTO-GENERATED */
:root {
  --rhea-dark: #00221Aff;  /* ← Generated from TypeScript */
}
```

## Troubleshooting

**CSS not updating?**
- Run `npm run generate:palettes` manually
- Check `src/lib/styles/palettes.generated.css` timestamp

**Variable not found?**
- Check the generated CSS file for available variables
- Ensure `+layout.svelte` imports `palettes.generated.css`

**Build script fails?**
- Check TypeScript palette files match `PaletteStructure` interface
- Verify regex patterns in `generatePaletteCss.js`

## CRITICAL

**DO NOT:**
- ❌ Edit `palettes.generated.css` manually (will be overwritten)
- ❌ Define colours in component files (defeats single source)
- ❌ Skip the build script (causes desync)

**DO:**
- ✅ Edit TypeScript palette files only
- ✅ Use generated CSS variables in components
- ✅ Run `npm run generate:palettes` after palette changes
- ✅ Commit generated CSS to version control

This ensures the entire team works from the same palette data.
