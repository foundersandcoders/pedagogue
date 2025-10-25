<script lang="ts">
  import "../app.css";
  import "$lib/styles/palettes.generated.css";
  import { page } from "$app/stores";
  import { activePalette, setPaletteFromRoute } from "$lib/stores/paletteStore";

  let { children } = $props();

  // TODO: implement $state() instead of stores where possible
  const isHomePage: boolean = $derived($page.url.pathname === "/");
  const showBreadcrumb: boolean = $derived(!isHomePage);

  // Update active palette when route changes
  $effect(() => {
    setPaletteFromRoute($page.url.pathname);

    // Apply palette attribute directly to body element
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-palette', $activePalette);
    }
  });
</script>

{#if showBreadcrumb}
  <nav class="breadcrumb">
    <a href="/" class="breadcrumb-home">← Home</a>
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
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 2rem;
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
