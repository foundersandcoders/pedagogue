<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";

  let { children } = $props();

  // TODO: implement $state() instead of stores where possible
  const isHomePage: boolean = $derived($page.url.pathname === "/");
  const showBreadcrumb: boolean = $derived(!isHomePage);
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
    background: #fafafa;
  }

  .breadcrumb {
    background: white;
    border-bottom: 1px solid #e9ecef;
    padding: 1rem 2rem;
  }

  .breadcrumb-home {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .breadcrumb-home:hover {
    color: #0056b3;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
