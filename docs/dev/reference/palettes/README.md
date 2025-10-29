# Palette System Documentation

## Overview

The Rhea palette system provides workflow-specific colour schemes that automatically apply based on the current route. Each workflow (Metis, Themis, Tethys, Theia, and Rhea) has its own distinct palette with both **light and dark theme variants**.

**Features:**
- ✅ Workflow-based colour schemes
- ✅ Light and dark theme support
- ✅ System preference detection
- ✅ Persisted user preference
- ✅ Smooth theme transitions

## Architecture

### Single Source of Truth

**Location:** `src/lib/config/palettes/`

All palette data is defined in TypeScript files in this directory:
- `rheaPalette.ts` / `rheaPalette.dark.ts` - Main application palette (light/dark)
- `metisPalette.ts` / `metisPalette.dark.ts` - Module generator palette (light/dark)
- `themisPalette.ts` / `themisPalette.dark.ts` - Course builder palette (light/dark)
- `tethysPalette.ts` / `tethysPalette.dark.ts` - Arc designer palette (light/dark)
- `theiaPalette.ts` / `theiaPalette.dark.ts` - Content manager palette (light/dark)

### Data Flow

```
1. Palette Definitions (src/lib/config/palettes/*.ts + *.dark.ts)
   ↓
2. Theme Store (src/lib/stores/themeStore.ts) - User preference & system detection
   ↓
3. Palette Loader (src/lib/utils/palette/paletteLoader.ts) - Select light/dark variant
   ↓
4. Palette Transformer (src/lib/utils/palette/paletteTransformer.ts)
   ↓
5. CSS Variables (applied via data-palette + data-theme attributes)
   ↓
6. Component Styles (reference CSS variables like --palette-primary)
```

## Palette Structure

Each palette follows a consistent semantic structure:

```typescript
{
  metadata: {
    requiredImprovements: string[]
  },
  colours: {
    dark: {
      name: string,
      colour: string  // Darkest colour for primary backgrounds
    },
    background: {
      primary: {
        name: string,
        main: string,    // Main background colour
        subtle: string,  // Light background for cards
        nav: string      // Navigation background
      },
      alternate: {
        name: string,
        main: string,
        subtle: string,
        nav: string
      }
    },
    foreground: {
      primary: {
        name: string,
        dark: string,   // Dark foreground (main text/accents)
        midi: string,   // Mid-tone foreground
        lite: string    // Light foreground
      },
      alternate: {
        name: string,
        dark: string,
        midi: string,
        lite: string
      }
    },
    line: {
      primary: {
        name: string,
        colour: string  // Border/line colour
      },
      alternate: {
        name: string,
        colour: string
      }
    }
  }
}
```

## CSS Variable Mapping

The transformer converts the structured palette into flat CSS variables:

| Palette Property | CSS Variable | Usage |
|------------------|--------------|-------|
| `colours.dark.colour` | `--palette-primary` | Primary dark background |
| `colours.background.primary.main` | `--palette-secondary` | Secondary background |
| `colours.background.primary.subtle` | `--palette-bg-subtle` | Subtle background (cards) |
| `colours.background.alternate.subtle` | `--palette-bg-subtle-alt` | Alternate subtle background |
| `colours.background.primary.nav` | `--palette-bg-nav` | Navigation background |
| `colours.background.alternate.nav` | `--palette-bg-nav-alt` | Alternate nav background |
| `colours.foreground.primary.dark` | `--palette-foreground` | Main foreground/accent |
| `colours.foreground.primary.lite` | `--palette-foreground-alt` | Alternate foreground |
| `colours.foreground.primary.midi` | `--palette-accent` | Mid-tone accent |
| `colours.line.primary.colour` | `--palette-line` | Border/divider colour |

**Note:** These mappings apply to both light and dark theme variants. The system automatically selects the appropriate palette based on the user's theme preference.

## How to Add or Modify a Palette

### Modifying an Existing Palette

1. **Edit the palette file(s)** in `src/lib/config/palettes/`
   ```typescript
   // Example: Change Metis foreground colour in BOTH light and dark variants
   
   // File: src/lib/config/palettes/metisPalette.ts (LIGHT)
   export const metisPalette: MetisPalette = {
     colours: {
       foreground: {
         primary: {
           name: "teal",
           dark: "#096A78ff",  // Light theme: darker shade
           midi: "#0E9191ff",
           lite: "#17B8C4ff"
         }
       }
     }
   }
   
   // File: src/lib/config/palettes/metisPalette.dark.ts (DARK)
   export const metisPaletteDark: MetisPalette = {
     colours: {
       foreground: {
         primary: {
           name: "teal",
           dark: "#3FC4D8ff",  // Dark theme: lighter shade for contrast
           midi: "#5FD4E6ff",
           lite: "#7FE0F0ff"
         }
       }
     }
   }
   ```

2. **Regenerate CSS** to include your changes:
   ```bash
   npm run generate:palettes
   ```

3. **Test the changes:**
   ```bash
   npm run dev
   ```
   Navigate to the relevant workflow route and toggle between light/dark themes

### Adding a New Palette

1. **Create palette files (light and dark variants):**
   ```typescript
   // File: src/lib/config/palettes/newWorkflowPalette.ts (LIGHT)
   import type { PaletteStructure } from "$lib/utils/palette/paletteTypes";

   export const newWorkflowPalette: PaletteStructure = {
     metadata: { requiredImprovements: [] },
     colours: {
       // Define all required colour properties for LIGHT theme
       // See existing light palettes for structure
     }
   };
   
   // File: src/lib/config/palettes/newWorkflowPalette.dark.ts (DARK)
   export const newWorkflowPaletteDark: PaletteStructure = {
     metadata: { requiredImprovements: [] },
     colours: {
       // Define all required colour properties for DARK theme
       // Use lighter foregrounds, darker backgrounds
     }
   };
   ```

2. **Register in paletteLoader.ts:**
   ```typescript
   // Import both variants
   import { newWorkflowPalette } from "$lib/config/palettes/newWorkflowPalette";
   import { newWorkflowPaletteDark } from "$lib/config/palettes/newWorkflowPalette.dark";

   // Add to PALETTES object with theme variants
   const PALETTES: Record<WorkflowName, Record<ThemeMode, PaletteStructure>> = {
     // ... existing palettes
     newWorkflow: {
       light: newWorkflowPalette,
       dark: newWorkflowPaletteDark,
     },
   };

   // Add route mapping in getWorkflowPaletteName()
   if (pathname.startsWith("/new-workflow")) return "newWorkflow";
   ```

3. **Update the WorkflowName type:**
   ```typescript
   // File: src/lib/utils/palette/paletteTypes.ts

   export type WorkflowName = "metis" | "rhea" | "tethys" | "theia" | "themis" | "newWorkflow";
   ```

4. **Update CSS generation script:**
   - Add palette parsing in `scripts/generatePaletteCss.js`
   - Include both light and dark selectors in generated CSS

## Using Palettes in Components

### Via CSS Variables (Automatic Theme Support)

CSS variables automatically update when theme changes:

```svelte
<style>
  .my-component {
    background: var(--palette-bg-subtle);
    color: var(--palette-foreground);
    border: 1px solid var(--palette-line);
  }

  .my-button {
    background: var(--palette-foreground);
    color: white;
  }

  .my-button:hover {
    background: var(--palette-foreground-alt);
  }
</style>
```

### Programmatically (Theme-Aware)

```typescript
import { getWorkflowPalette, generateCSSVariables } from "$lib/utils/palette/paletteLoader";
import { effectiveTheme } from "$lib/stores/themeStore";
import { get } from "svelte/store";

// Get structured palette data for current theme
const theme = get(effectiveTheme); // 'light' or 'dark'
const metisPalette = getWorkflowPalette("metis", theme);

// Generate CSS variables object for specific theme
const cssVars = generateCSSVariables("metis", theme);
// Returns: { '--palette-primary': '#00121Fff', ... }

// Generate CSS string for inline styles
const cssString = generateCSSVariableString("metis", theme);
// Returns: "--palette-primary: #00121Fff; --palette-foreground: #096A78ff; ..."
```

## Dark Mode System

### Theme Store

The theme system provides three preference options:
- **Light**: Always use light theme
- **Dark**: Always use dark theme
- **System**: Follow OS/browser preference (default)

```typescript
import { themePreference, effectiveTheme } from "$lib/stores/themeStore";

// Set user preference
themePreference.set("dark");

// Get effective theme (resolves "system" to actual light/dark)
const theme = get(effectiveTheme); // 'light' or 'dark'
```

### Theme Selector Component

The `ThemeSelector` component provides UI for theme switching:

```svelte
<script>
  import ThemeSelector from "$lib/components/ui/ThemeSelector.svelte";
</script>

<ThemeSelector />
```

Located in navigation breadcrumb on all non-home pages.

### How Dark Mode Works

1. **User selects theme** via ThemeSelector (light/dark/system)
2. **Preference persisted** to localStorage
3. **System preference detected** via `matchMedia('prefers-color-scheme: dark')`
4. **Effective theme computed** (resolves "system" to light/dark)
5. **Layout applies attributes**: `data-palette="metis" data-theme="dark"`
6. **CSS selectors match**: `[data-palette="metis"][data-theme="dark"]`
7. **Variables update**: All `--palette-*` variables switch to dark variants
8. **Components re-render** with new colours automatically

### Dark Palette Design Guidelines

When creating dark palette variants:
- **Backgrounds**: Use darker tones (15-25% lightness)
- **Foregrounds**: Use lighter, brighter colours (70-90% lightness)
- **Contrast**: Maintain 4.5:1 minimum contrast ratio (WCAG AA)
- **Subtle backgrounds**: 5-10% lighter than main background
- **Lines/borders**: Use mid-tones visible on dark backgrounds
- **Identity**: Preserve workflow colour identity (hue consistency)

## Reference Files

The `.ts` files in `docs/dev/ref/palettes/` are **historical references only** and are no longer used by the application. The source of truth is now `src/lib/config/palettes/`.

## Design Principles

1. **Semantic Naming:** Colour names describe their purpose (e.g., "bronze", "teal") rather than just being numbers
2. **Flexible Structure:** Primary and alternate colour variants allow for themed sections
3. **Consistent Mapping:** All palettes follow the same structure for predictable CSS variable generation
4. **Type Safety:** TypeScript interfaces ensure palette definitions are complete and correct
5. **Separation of Concerns:** Data (config) is separate from transformation logic (utils)
6. **Theme Consistency:** Light and dark variants maintain workflow identity while optimizing for readability
7. **Accessibility First:** All colour combinations meet WCAG contrast requirements

## Benefits of This Approach

- ✅ **No duplication:** Single source of truth eliminates sync issues
- ✅ **Type-safe:** TypeScript catches palette errors at compile time
- ✅ **Human-readable:** Semantic structure makes palettes easy to understand
- ✅ **Easy to modify:** Change colours in one place, see results everywhere
- ✅ **Maintainable:** Clear separation between data and logic
- ✅ **Documented:** Rich structure includes colour names and metadata
- ✅ **Dark mode ready:** Full light/dark theme support with system preference detection
- ✅ **User control:** Persisted theme preference with smooth transitions

## Common Tasks

### Finding Current Palette Values
Check `src/lib/config/palettes/{workflow}Palette.ts`

### Changing a Workflow's Colour Scheme
Edit the relevant file in `src/lib/config/palettes/`

### Adding a New CSS Variable
1. Update `paletteTransformer.ts` to map the new variable
2. Update the `CSSVariableMap` interface
3. Use the new variable in component styles

### Debugging Palette Issues
1. Check browser DevTools → Elements → Styles
2. Look for `data-palette` attribute on `<body>`
3. Verify CSS variables are defined (should see `--palette-*`)
4. Check console for any import/type errors
