<script lang="ts">
  import { onMount } from "svelte";
  import type { Arc } from "$lib/types/themis"
  import { savedCourses } from "$lib/stores/themisStores";
  
  function countModules(arcs: Arc[]) :number {
    let total = 0;
    arcs.forEach((arc) => { total += arc.modules.length })
    return total;
  }

  onMount(() => {
    console.log("Welcome to Pedagogue");
  });
</script>

<svelte:head>
  <title>Rhea • Curriculum Designer</title>
  <link rel="icon" href="favicons/favicon.ico" />
</svelte:head>

<div id="hub-container" class="container">
  <header id="hub-header">
    <div class="header-title">
      <img src="icon.png" alt="Rhea icon" class="header-icon" />
      <h1>Rhea</h1>
    </div>
    <p>AI-powered curriculum design for peer-led courses</p>
  </header>

  <!-- TODO: possibly create hub component? In case I need sub-hubs when functionality expands -->
  <main class="rhea-hub">
    <!-- TODO: create separate WorkflowCard component -->
    <!-- TODO: address a11y issues from workflow cards -->
    <div class="workflow-cards">
      <a href="/themis/generate" class="workflow-card themis-card">
        <img src="/themis/icon.png" alt="Themis" class="card-icon" />
        <h2>Themis</h2>
        <p>Create a complete multi-week course with interconnected modules and
          learning progressions.</p>
        <div class="card-features">
          <span>✓ Multiple modules</span>
          <span>✓ Course structure</span>
          <span>✓ Learning progression</span>
        </div>
        <div class="card-action">Build Course →</div>
      </a>

      <a href="/tethys/wip" class="workflow-card tethys-card">
        <img src="/tethys/icon.png" alt="Tethys" class="card-icon" />
        <h2>Tethys</h2>
        <p>Create a linked set of modules.</p>
        <div class="card-features">
          <pre>Coming Soon</pre>
        </div>
        <div class="card-action">Design Arc →</div>
      </a>

      <a href="/metis/update" class="workflow-card metis-card">
        <img src="/metis/icon.png" alt="Metis" class="card-icon" />
        <h2>Metis</h2>
        <p>Create a standalone module specification with projects, skills, and
          research topics.</p>
        <div class="card-features">
          <span>✓ Project briefs</span>
          <span>✓ Learning objectives</span>
          <span>✓ Research topics</span>
        </div>
        <div class="card-action">Generate Module →</div>
      </a>

      <a href="/theia" class="workflow-card theia-card">
        <img src="/theia/icon.png" alt="Theia" class="card-icon" />
        <h2>Theia</h2>
        <p>Upload and manage previously generated course structures and modules.</p>
        <div class="card-features">
          <span>✓ Upload course JSON</span>
          <span>✓ Resume workflows</span>
          <span>✓ Export formats</span>
        </div>
        <div class="card-action">Manage Content →</div>
      </a>
    </div>

    {#if $savedCourses.length > 0}
      <section class="recent-courses">
        <h2>Recent Courses</h2>
        <!-- TODO: create CourseList component -->
        <div class="course-list">
          {#each $savedCourses.slice(0, 3) as course}
            <a href="/course/{course.id}" class="course-item">
              <div class="course-info">
                <h3>{course.title}</h3>
                <ul>
                  <li>{course.logistics.totalWeeks} weeks</li>
                  <li>{course.arcs.length} arcs</li>
                  <li>{countModules(course.arcs)} modules</li>
                </ul>
              </div>
              <div class="course-meta">
                {new Date(course.updatedAt).toLocaleDateString()}
              </div>
            </a>
          {/each}
        </div>
      </section>
    {/if}
  </main>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    margin-bottom: 4rem;
  }

  .header-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }

  .header-icon {
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  header h1 {
    font-size: 3.5rem;
    color: #333;
    margin: 0;
  }

  header p {
    color: #666;
    font-size: 1.2rem;
  }

  .rhea-hub {
    max-width: 1400px;
    margin: 0 auto;
  }

  .workflow-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .workflow-card {
    border-radius: 12px;
    padding: 2.5rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }

  /* Each card uses its own workflow palette background */
  .metis-card {
    background: #E8F1F8;
  }

  .themis-card {
    background: #F0ECF8;
  }

  .tethys-card {
    background: #FFF4ED;
  }

  .theia-card {
    background: #F7ECF3;
  }

  .workflow-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .metis-card:hover {
    border-color: #096A78;
  }

  .tethys-card:hover {
    border-color: #A45818;
  }

  .themis-card:hover {
    border-color: #7551BA;
  }

  .theia-card:hover {
    border-color: #B0127A;
  }

  .card-icon {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: 1rem;
  }

  .workflow-card h2 {
    font-size: 1.75rem;
    color: #333;
    margin: 0 0 1rem 0;
  }

  .workflow-card p {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    flex-grow: 1;
  }

  .card-features {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .card-features span {
    color: #495057;
    font-size: 0.9rem;
  }

  .card-action {
    color: #096A78;
    font-weight: 600;
    font-size: 1.1rem;
    text-align: center;
    padding: 1rem;
    background: rgba(9, 106, 120, 0.1);
    border-radius: 8px;
    transition: all 0.3s;
  }

  .themis-card .card-action {
    color: #7551BA;
    background: rgba(117, 81, 186, 0.1);
  }

  .tethys-card .card-action {
    color: #A45818;
    background: rgba(164, 88, 24, 0.1);
  }

  .theia-card .card-action {
    color: #B0127A;
    background: rgba(176, 18, 122, 0.1);
  }

  .themis-card:hover .card-action {
    background: #7551BA;
    color: white;
  }

  .tethys-card:hover .card-action {
    background: #A45818;
    color: white;
  }

  .metis-card:hover .card-action {
    background: #096A78;
    color: white;
  }

  .theia-card:hover .card-action {
    background: #B0127A;
    color: white;
  }

  .recent-courses {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid #e9ecef;
  }

  .recent-courses h3 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }

  .course-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .course-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
  }

  .course-item:hover {
    border-color: #D7B130;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /*.course-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }*/

  .course-meta {
    color: #999;
    font-size: 0.85rem;
  }

  @media (max-width: 1200px) {
    .workflow-cards {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 768px) {
    .workflow-cards {
      grid-template-columns: 1fr;
    }

    header h1 {
      font-size: 2.5rem;
    }

    .container {
      padding: 1rem;
    }
  }
</style>
