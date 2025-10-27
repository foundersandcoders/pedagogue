# Palette System Documentation

## Overview

The Rhea palette system provides workflow-specific colour schemes that automatically apply based on the current route. Each workflow (Metis, Themis, Tethys, Theia, and Rhea) has its own distinct palette.

## Architecture

### Single Source of Truth

**Location:** `src/lib/config/palettes/`

All palette data is defined in TypeScript files in this directory:
- `rheaPalette.ts` - Main application palette
- `metisPalette.ts` - Module generator palette
- `themisPalette.ts` - Course builder palette
- `tethysPalette.ts` - Arc designer palette
- `theiaPalette.ts` - Content manager palette

### Data Flow

```
1. Palette Definitions (src/lib/config/palettes/*.ts)
   ↓
2. Palette Loader (src/lib/utils/palette/paletteLoader.ts)
   ↓
3. Palette Transformer (src/lib/utils/palette/paletteTransformer.ts)
   ↓
4. CSS Variables (applied to DOM via data-palette attribute)
   ↓
5. Component Styles (reference CSS variables like --palette-primary)
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

## How to Add or Modify a Palette

### Modifying an Existing Palette

1. **Edit the palette file** in `src/lib/config/palettes/`
   ```typescript
   // Example: Change Metis foreground colour
   // File: src/lib/config/palettes/metisPalette.ts

   export const metisPalette: MetisPalette = {
     // ... other properties
     colours: {
       // ... other colours
       foreground: {
         primary: {
           name: "teal",
           dark: "#096A78ff",  // Change this hex value
           midi: "#0E9191ff",
           lite: "#17B8C4ff"
         },
         // ...
       }
     }
   }
   ```

2. **Update the reference CSS** in `src/lib/styles/palettes.css` (optional, for documentation)

3. **Test the changes:**
   ```bash
   npm run dev
   ```
   Navigate to the relevant workflow route to see changes

### Adding a New Palette

1. **Create a new palette file:**
   ```typescript
   // File: src/lib/config/palettes/newWorkflowPalette.ts

   import type { PaletteStructure } from "$lib/utils/palette/paletteTypes";

   export const newWorkflowPalette: PaletteStructure = {
     metadata: {
       requiredImprovements: []
     },
     colours: {
       // Define all required colour properties
       // See existing palettes for structure
     }
   };
   ```

2. **Register in paletteLoader.ts:**
   ```typescript
   // Import the new palette
   import { newWorkflowPalette } from "$lib/config/palettes/newWorkflowPalette";

   // Add to PALETTES object
   const PALETTES: Record<WorkflowName, PaletteStructure> = {
     // ... existing palettes
     newWorkflow: newWorkflowPalette,
   };

   // Add route mapping in getWorkflowPaletteName()
   if (pathname.startsWith("/new-workflow")) return "newWorkflow";
   ```

3. **Update the WorkflowName type:**
   ```typescript
   // File: src/lib/utils/palette/paletteTypes.ts

   export type WorkflowName = "metis" | "rhea" | "tethys" | "theia" | "themis" | "newWorkflow";
   ```

## Using Palettes in Components

### Via CSS Variables

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

### Programmatically

```typescript
import { getWorkflowPalette, generateCSSVariables } from "$lib/utils/palette/paletteLoader";

// Get structured palette data
const metisPalette = getWorkflowPalette("metis");

// Generate CSS variables object
const cssVars = generateCSSVariables("metis");
// Returns: { '--palette-primary': '#00121Fff', ... }

// Generate CSS string for inline styles
const cssString = generateCSSVariableString("metis");
// Returns: "--palette-primary: #00121Fff; --palette-foreground: #096A78ff; ..."
```

## Reference Files

The `.ts` files in `docs/dev/ref/palettes/` are **historical references only** and are no longer used by the application. The source of truth is now `src/lib/config/palettes/`.

## Design Principles

1. **Semantic Naming:** Colour names describe their purpose (e.g., "bronze", "teal") rather than just being numbers
2. **Flexible Structure:** Primary and alternate colour variants allow for themed sections
3. **Consistent Mapping:** All palettes follow the same structure for predictable CSS variable generation
4. **Type Safety:** TypeScript interfaces ensure palette definitions are complete and correct
5. **Separation of Concerns:** Data (config) is separate from transformation logic (utils)

## Benefits of This Approach

- ✅ **No duplication:** Single source of truth eliminates sync issues
- ✅ **Type-safe:** TypeScript catches palette errors at compile time
- ✅ **Human-readable:** Semantic structure makes palettes easy to understand
- ✅ **Easy to modify:** Change colours in one place, see results everywhere
- ✅ **Maintainable:** Clear separation between data and logic
- ✅ **Documented:** Rich structure includes colour names and metadata

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
