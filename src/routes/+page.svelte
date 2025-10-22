<script lang="ts">
  import { onMount } from "svelte";
  import type { Arc } from "$lib/types/cobu"
  import { savedCourses } from "$lib/stores/cobuStores";
  
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
  <title>Gaia: AI-Powered Curriculum Generator</title>
</svelte:head>

<div id="hub-container" class="container">
  <header id="hub-header">
    <h1>Gaia</h1>
    <p>AI-powered curriculum generation for peer-led courses</p>
  </header>

  <!-- TODO: possibly create hub component? In case I need sub-hubs when functionality expands -->
  <main class="hub">
    <!-- TODO: create separate WorkflowCard component -->
    <!-- TODO: address a11y issues from workflow cards -->
    <div class="workflow-cards">
      <a href="/cobu/generate" class="workflow-card course-card">
        <div class="card-icon">📚</div>
        <h2>Themis</h2>
        <p>
          Create a complete multi-week course with interconnected modules and
          learning progressions.
        </p>
        <div class="card-features">
          <span>✓ Multiple modules</span>
          <span>✓ Course structure</span>
          <span>✓ Learning progression</span>
        </div>
        <div class="card-action">Start Course Builder →</div>
      </a>
      
      <a href="/tethys" class="workflow-card arc-card">
        <div class="card-icon">📄</div>
        <h2>Tethys</h2>
        <p>
          Create a linked set of modules.
        </p>
        <div class="card-features">
          <span>• </span>
          <span>• </span>
          <span>• </span>
        </div>
        <div class="card-action">Start Arc Designer →</div>
      </a>
      
      <a href="/mogen/update" class="workflow-card module-card">
        <div class="card-icon">📄</div>
        <h2>Metis</h2>
        <p>
          Create a standalone module specification with projects, skills, and
          research topics.
        </p>
        <div class="card-features">
          <span>✓ Project briefs</span>
          <span>✓ Learning objectives</span>
          <span>✓ Research topics</span>
        </div>
        <div class="card-action">Start Module Generator →</div>
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

  header h1 {
    font-size: 3.5rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  header p {
    color: #666;
    font-size: 1.2rem;
  }

  .hub {
    max-width: 900px;
    margin: 0 auto;
  }

  .workflow-cards {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    margin-bottom: 4rem;
  }

  .workflow-card {
    background: white;
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

  .workflow-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .module-card:hover {
    border-color: #007bff;
  }
  
  .arc-card:hover {
    border-color: #888888;
  }

  .course-card:hover {
    border-color: #28a745;
  }

  .card-icon {
    font-size: 3rem;
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
    color: #007bff;
    font-weight: 600;
    font-size: 1.1rem;
    text-align: center;
    padding: 1rem;
    background: #e7f3ff;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .course-card .card-action {
    color: #28a745;
    background: #d4edda;
  }
  
  .arc-card .card-action {
    color: #888888;
    background: #cccccc;
  }

  .module-card:hover .card-action {
    background: #007bff;
    color: white;
  }
  
  .arc-card:hover .card-action {
    background: #888888;
    color: white;
  }

  .course-card:hover .card-action {
    background: #28a745;
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
    border-color: #007bff;
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
