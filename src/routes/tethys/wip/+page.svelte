<script>
</script>

<svelte:head>
  <title>Tethys • Arc Designer</title>
  <link rel="icon" href="favicon.ico" />
</svelte:head>

<div id="tethys-container" class="container">
  <header id="tethys-header">
    <div class="header-title">
      <img src="icon.png" alt="Tethys icon" class="header-icon" />
      <h1>Tethys</h1>
    </div>
    <p>AI-powered Arc design for peer-led courses</p>
  </header>
  
  <div class="tethys-workflow">
    <nav class="tethys-steps">
    </nav>

    <main class="tethys-content">
    </main>
  </div>
</div>

<style>
  .container {
    max-width: 1000px;
    margin: 0 auto;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .header-icon {
    width: 60px;
    height: 60px;
    object-fit: contain;
  }

  header h1 {
    font-size: 3rem;
    color: #333;
    margin: 0;
  }

  header p {
    color: #666;
    font-size: 1.1rem;
  }

  .tethys-workflow {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .tethys-steps {
    display: flex;
    background: var(--palette-bg-subtle);
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .tethys-content {
    padding: 2rem;
  }
</style>
