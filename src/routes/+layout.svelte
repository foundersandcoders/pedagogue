<script lang="ts">
  import "../app.css";
  import "$lib/styles/palettes.generated.css";
  import { page } from "$app/stores";
  import { activePalette, setPaletteFromRoute } from "$lib/stores/paletteStore";
  import {
    effectiveTheme,
    initSystemThemeDetection,
  } from "$lib/stores/themeStore";
  import ThemeSelector from "$lib/components/ui/ThemeSelector.svelte";

  let { children } = $props();

  // TODO: implement $state() instead of stores where possible
  const isHomePage: boolean = $derived($page.url.pathname === "/");
  const showBreadcrumb: boolean = $derived(!isHomePage);

  // Initialize system theme detection on mount
  $effect(() => {
    initSystemThemeDetection();
  });

  // Update active palette when route changes
  $effect(() => {
    setPaletteFromRoute($page.url.pathname);

    // Apply palette and theme attributes directly to body element
    if (typeof document !== "undefined") {
      document.body.setAttribute("data-palette", $activePalette);
      document.body.setAttribute("data-theme", $effectiveTheme);
    }
  });
</script>

{#if showBreadcrumb}
  <nav class="breadcrumb">
    <div class="breadcrumb-content">
      <a href="/" class="breadcrumb-home">← Home</a>
      <ThemeSelector />
    </div>
  </nav>
{/if}

<main>
  {@render children()}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
      sans-serif;
    background: var(--palette-bg-subtle, #fafafa);
  }

  .breadcrumb {
    background: var(--palette-bg-nav);
    border-bottom: 1px solid var(--palette-line);
    padding: 1rem 2rem;
  }

  .breadcrumb-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .breadcrumb-home {
    color: var(--palette-foreground);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
  }

  .breadcrumb-home:hover {
    filter: brightness(1.15);
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 4rem);
  }
</style>
