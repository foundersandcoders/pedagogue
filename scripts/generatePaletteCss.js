/**
 * Generate Palette CSS
 *
 * Build-time script that reads palette definitions from src/lib/config/palettes/
 * and generates CSS custom properties for use throughout the application.
 *
 * CRITICAL: This maintains single source of truth for all palette data.
 * All colour values flow from TypeScript palette files -> Generated CSS -> Components
 *
 * Run: node scripts/generatePaletteCss.js
 * Auto-run: Before each build via package.json prebuild script
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse a TypeScript palette file and extract colour values
 */
function parsePaletteFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  // Extract hex colour values with their context
  const palette = {
    dark: extractColour(content, /dark:[\s\S]*?colour:\s*"(#[0-9a-fA-F]+ff)"/),
    background: {
      primary: {
        main: extractColour(content, /background:[\s\S]*?primary:[\s\S]*?main:\s*"(#[0-9a-fA-F]+ff)"/),
        subtle: extractColour(content, /background:[\s\S]*?primary:[\s\S]*?subtle:\s*"(#[0-9a-fA-F]+ff)"/),
        nav: extractColour(content, /background:[\s\S]*?primary:[\s\S]*?nav:\s*"(#[0-9a-fA-F]+ff)"/),
      },
      alternate: {
        main: extractColour(content, /alternate:[\s\S]*?name:\s*"gold"[\s\S]*?main:\s*"(#[0-9a-fA-F]+ff)"/) ||
              extractColour(content, /alternate:[\s\S]*?name:\s*"coral"[\s\S]*?main:\s*"(#[0-9a-fA-F]+ff)"/) ||
              extractColour(content, /alternate:[\s\S]*?name:\s*"sage"[\s\S]*?main:\s*"(#[0-9a-fA-F]+ff)"/) ||
              extractColour(content, /alternate:[\s\S]*?name:\s*"turquoise"[\s\S]*?main:\s*"(#[0-9a-fA-F]+ff)"/),
        subtle: content.match(/alternate:[\s\S]*?subtle:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
        nav: content.match(/alternate:[\s\S]*?nav:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
      }
    },
    foreground: {
      primary: {
        dark: content.match(/foreground:[\s\S]*?primary:[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
        midi: content.match(/foreground:[\s\S]*?primary:[\s\S]*?midi:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
        lite: content.match(/foreground:[\s\S]*?primary:[\s\S]*?lite:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
      },
      alternate: {
        dark: (content.match(/alternate:[\s\S]*?name:\s*"jade"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/) || content.match(/alternate:[\s\S]*?name:\s*"teal"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/) || content.match(/alternate:[\s\S]*?name:\s*"violet"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/) || content.match(/alternate:[\s\S]*?name:\s*"emerald"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/) || content.match(/alternate:[\s\S]*?name:\s*"amber"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/) || content.match(/alternate:[\s\S]*?name:\s*"magenta"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/) || content.match(/alternate:[\s\S]*?name:\s*"cyan"[\s\S]*?dark:\s*"(#[0-9a-fA-F]+ff)"/))?.[ 1],
        midi: content.match(/foreground:[\s\S]*?alternate:[\s\S]*?midi:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
        lite: content.match(/foreground:[\s\S]*?alternate:[\s\S]*?lite:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
      }
    },
    line: {
      primary: content.match(/line:[\s\S]*?primary:[\s\S]*?colour:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
      alternate: content.match(/line:[\s\S]*?alternate:[\s\S]*?colour:\s*"(#[0-9a-fA-F]+ff)"/)?.[1],
    }
  };

  return palette;
}

function extractColour(content, regex) {
  const match = content.match(regex);
  return match ? match[1] : null;
}

/**
 * Generate CSS custom properties for a workflow palette
 */
function generateWorkflowVars(name, palette) {
  const prefix = `--${name}`;

  return `
  /* ${name.charAt(0).toUpperCase() + name.slice(1)} workflow colours */
  ${prefix}-dark: ${palette.dark};
  ${prefix}-bg-main: ${palette.background.primary.main};
  ${prefix}-bg-subtle: ${palette.background.primary.subtle};
  ${prefix}-bg-nav: ${palette.background.primary.nav};
  ${prefix}-bg-alt-main: ${palette.background.alternate.main};
  ${prefix}-bg-alt-subtle: ${palette.background.alternate.subtle};
  ${prefix}-bg-alt-nav: ${palette.background.alternate.nav};
  ${prefix}-fg-dark: ${palette.foreground.primary.dark};
  ${prefix}-fg-midi: ${palette.foreground.primary.midi};
  ${prefix}-fg-lite: ${palette.foreground.primary.lite};
  ${prefix}-fg-alt-dark: ${palette.foreground.alternate.dark};
  ${prefix}-fg-alt-midi: ${palette.foreground.alternate.midi};
  ${prefix}-fg-alt-lite: ${palette.foreground.alternate.lite};
  ${prefix}-line: ${palette.line.primary};
  ${prefix}-line-alt: ${palette.line.alternate};`;
}

// Load palettes (light and dark variants)
const palettesDir = join(__dirname, '../src/lib/config/palettes');

// Light palettes
const rheaPalette = parsePaletteFile(join(palettesDir, 'rheaPalette.ts'));
const metisPalette = parsePaletteFile(join(palettesDir, 'metisPalette.ts'));
const themisPalette = parsePaletteFile(join(palettesDir, 'themisPalette.ts'));
const tethysPalette = parsePaletteFile(join(palettesDir, 'tethysPalette.ts'));
const theiaPalette = parsePaletteFile(join(palettesDir, 'theiaPalette.ts'));

// Dark palettes
const rheaPaletteDark = parsePaletteFile(join(palettesDir, 'rheaPalette.dark.ts'));
const metisPaletteDark = parsePaletteFile(join(palettesDir, 'metisPalette.dark.ts'));
const themisPaletteDark = parsePaletteFile(join(palettesDir, 'themisPalette.dark.ts'));
const tethysPaletteDark = parsePaletteFile(join(palettesDir, 'tethysPalette.dark.ts'));
const theiaPaletteDark = parsePaletteFile(join(palettesDir, 'theiaPalette.dark.ts'));

/**
 * Generate complete CSS file
 */
function generateCss() {
  const timestamp = new Date().toISOString();

  return `/**
 * Generated Palette CSS Variables
 *
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 * Generated: ${timestamp}
 * Source: scripts/generatePaletteCss.js
 *
 * This file is automatically generated from TypeScript palette definitions
 * in src/lib/config/palettes/. Any manual edits will be overwritten.
 *
 * To modify colours:
 * 1. Edit the palette files in src/lib/config/palettes/
 * 2. Run: npm run generate:palettes
 * 3. Rebuild the application
 *
 * CORE PRINCIPLE: Single source of truth for all palette data.
 */

:root {${generateWorkflowVars('rhea', rheaPalette)}
${generateWorkflowVars('metis', metisPalette)}
${generateWorkflowVars('themis', themisPalette)}
${generateWorkflowVars('tethys', tethysPalette)}
${generateWorkflowVars('theia', theiaPalette)}
}

/* Dynamic palette variables - Light theme (default) */
[data-palette="rhea"],
[data-palette="rhea"][data-theme="light"] {
  --palette-primary: ${rheaPalette.dark};
  --palette-secondary: ${rheaPalette.background.primary.main};
  --palette-bg-subtle: ${rheaPalette.background.primary.subtle};
  --palette-bg-subtle-alt: ${rheaPalette.background.alternate.subtle};
  --palette-bg-nav: ${rheaPalette.background.primary.nav};
  --palette-bg-nav-alt: ${rheaPalette.background.alternate.nav};
  --palette-foreground: ${rheaPalette.foreground.primary.dark};
  --palette-foreground-alt: ${rheaPalette.foreground.primary.lite};
  --palette-accent: ${rheaPalette.foreground.primary.midi};
  --palette-line: ${rheaPalette.line.primary};
}

[data-palette="metis"],
[data-palette="metis"][data-theme="light"] {
  --palette-primary: ${metisPalette.dark};
  --palette-secondary: ${metisPalette.background.primary.main};
  --palette-bg-subtle: ${metisPalette.background.primary.subtle};
  --palette-bg-subtle-alt: ${metisPalette.background.alternate.subtle};
  --palette-bg-nav: ${metisPalette.background.primary.nav};
  --palette-bg-nav-alt: ${metisPalette.background.alternate.nav};
  --palette-foreground: ${metisPalette.foreground.alternate.dark};
  --palette-foreground-alt: ${metisPalette.foreground.alternate.lite};
  --palette-accent: ${metisPalette.foreground.alternate.midi};
  --palette-line: ${metisPalette.line.primary};
}

[data-palette="themis"],
[data-palette="themis"][data-theme="light"] {
  --palette-primary: ${themisPalette.dark};
  --palette-secondary: ${themisPalette.background.primary.main};
  --palette-bg-subtle: ${themisPalette.background.primary.subtle};
  --palette-bg-subtle-alt: ${themisPalette.background.alternate.subtle};
  --palette-bg-nav: ${themisPalette.background.primary.nav};
  --palette-bg-nav-alt: ${themisPalette.background.alternate.nav};
  --palette-foreground: ${themisPalette.foreground.alternate.dark};
  --palette-foreground-alt: ${themisPalette.foreground.alternate.lite};
  --palette-accent: ${themisPalette.foreground.alternate.midi};
  --palette-line: ${themisPalette.line.primary};
}

[data-palette="tethys"],
[data-palette="tethys"][data-theme="light"] {
  --palette-primary: ${tethysPalette.dark};
  --palette-secondary: ${tethysPalette.background.primary.main};
  --palette-bg-subtle: ${tethysPalette.background.primary.subtle};
  --palette-bg-subtle-alt: ${tethysPalette.background.alternate.subtle};
  --palette-bg-nav: ${tethysPalette.background.primary.nav};
  --palette-bg-nav-alt: ${tethysPalette.background.alternate.nav};
  --palette-foreground: ${tethysPalette.foreground.alternate.dark};
  --palette-foreground-alt: ${tethysPalette.foreground.alternate.lite};
  --palette-accent: ${tethysPalette.foreground.alternate.midi};
  --palette-line: ${tethysPalette.line.primary};
}

[data-palette="theia"],
[data-palette="theia"][data-theme="light"] {
  --palette-primary: ${theiaPalette.dark};
  --palette-secondary: ${theiaPalette.background.primary.main};
  --palette-bg-subtle: ${theiaPalette.background.primary.subtle};
  --palette-bg-subtle-alt: ${theiaPalette.background.alternate.subtle};
  --palette-bg-nav: ${theiaPalette.background.primary.nav};
  --palette-bg-nav-alt: ${theiaPalette.background.alternate.nav};
  --palette-foreground: ${theiaPalette.foreground.alternate.dark};
  --palette-foreground-alt: ${theiaPalette.foreground.alternate.lite};
  --palette-accent: ${theiaPalette.foreground.alternate.midi};
  --palette-line: ${theiaPalette.line.primary};
}

/* Dynamic palette variables - Dark theme */
[data-palette="rhea"][data-theme="dark"] {
  --palette-primary: ${rheaPaletteDark.dark};
  --palette-secondary: ${rheaPaletteDark.background.primary.main};
  --palette-bg-subtle: ${rheaPaletteDark.background.primary.subtle};
  --palette-bg-subtle-alt: ${rheaPaletteDark.background.alternate.subtle};
  --palette-bg-nav: ${rheaPaletteDark.background.primary.nav};
  --palette-bg-nav-alt: ${rheaPaletteDark.background.alternate.nav};
  --palette-foreground: ${rheaPaletteDark.foreground.primary.dark};
  --palette-foreground-alt: ${rheaPaletteDark.foreground.primary.lite};
  --palette-accent: ${rheaPaletteDark.foreground.primary.midi};
  --palette-line: ${rheaPaletteDark.line.primary};
}

[data-palette="metis"][data-theme="dark"] {
  --palette-primary: ${metisPaletteDark.dark};
  --palette-secondary: ${metisPaletteDark.background.primary.main};
  --palette-bg-subtle: ${metisPaletteDark.background.primary.subtle};
  --palette-bg-subtle-alt: ${metisPaletteDark.background.alternate.subtle};
  --palette-bg-nav: ${metisPaletteDark.background.primary.nav};
  --palette-bg-nav-alt: ${metisPaletteDark.background.alternate.nav};
  --palette-foreground: ${metisPaletteDark.foreground.alternate.dark};
  --palette-foreground-alt: ${metisPaletteDark.foreground.alternate.lite};
  --palette-accent: ${metisPaletteDark.foreground.alternate.midi};
  --palette-line: ${metisPaletteDark.line.primary};
}

[data-palette="themis"][data-theme="dark"] {
  --palette-primary: ${themisPaletteDark.dark};
  --palette-secondary: ${themisPaletteDark.background.primary.main};
  --palette-bg-subtle: ${themisPaletteDark.background.primary.subtle};
  --palette-bg-subtle-alt: ${themisPaletteDark.background.alternate.subtle};
  --palette-bg-nav: ${themisPaletteDark.background.primary.nav};
  --palette-bg-nav-alt: ${themisPaletteDark.background.alternate.nav};
  --palette-foreground: ${themisPaletteDark.foreground.alternate.dark};
  --palette-foreground-alt: ${themisPaletteDark.foreground.alternate.lite};
  --palette-accent: ${themisPaletteDark.foreground.alternate.midi};
  --palette-line: ${themisPaletteDark.line.primary};
}

[data-palette="tethys"][data-theme="dark"] {
  --palette-primary: ${tethysPaletteDark.dark};
  --palette-secondary: ${tethysPaletteDark.background.primary.main};
  --palette-bg-subtle: ${tethysPaletteDark.background.primary.subtle};
  --palette-bg-subtle-alt: ${tethysPaletteDark.background.alternate.subtle};
  --palette-bg-nav: ${tethysPaletteDark.background.primary.nav};
  --palette-bg-nav-alt: ${tethysPaletteDark.background.alternate.nav};
  --palette-foreground: ${tethysPaletteDark.foreground.alternate.dark};
  --palette-foreground-alt: ${tethysPaletteDark.foreground.alternate.lite};
  --palette-accent: ${tethysPaletteDark.foreground.alternate.midi};
  --palette-line: ${tethysPaletteDark.line.primary};
}

[data-palette="theia"][data-theme="dark"] {
  --palette-primary: ${theiaPaletteDark.dark};
  --palette-secondary: ${theiaPaletteDark.background.primary.main};
  --palette-bg-subtle: ${theiaPaletteDark.background.primary.subtle};
  --palette-bg-subtle-alt: ${theiaPaletteDark.background.alternate.subtle};
  --palette-bg-nav: ${theiaPaletteDark.background.primary.nav};
  --palette-bg-nav-alt: ${theiaPaletteDark.background.alternate.nav};
  --palette-foreground: ${theiaPaletteDark.foreground.alternate.dark};
  --palette-foreground-alt: ${theiaPaletteDark.foreground.alternate.lite};
  --palette-accent: ${theiaPaletteDark.foreground.alternate.midi};
  --palette-line: ${theiaPaletteDark.line.primary};
}
`;
}

// Generate and write CSS
const css = generateCss();
const outputPath = join(__dirname, '../src/lib/styles/palettes.generated.css');

try {
  writeFileSync(outputPath, css, 'utf-8');
  console.log('[SUCCESS] Generated palette CSS:', outputPath);
} catch (error) {
  console.error('[ERROR] Failed to generate palette CSS:', error);
  process.exit(1);
}
