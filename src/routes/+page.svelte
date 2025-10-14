<script>
  import { onMount } from "svelte";
  import { savedCourses } from "$lib/courseStores";

  onMount(() => {
    console.log("Pedagogue hub initialized");
  });
</script>

<svelte:head>
  <title>Pedagogue - AI-Powered Curriculum Generator</title>
</svelte:head>

<div class="container">
  <header>
    <h1>Pedagogue</h1>
    <p>AI-powered curriculum generation for peer-led courses</p>
  </header>

  <main class="hub">
    <div class="workflow-cards">
      <a href="/module/new" class="workflow-card module-card">
        <div class="card-icon">📄</div>
        <h2>Generate Module</h2>
        <p>Create a standalone module specification with projects, skills, and research topics.</p>
        <div class="card-features">
          <span>✓ Project briefs</span>
          <span>✓ Learning objectives</span>
          <span>✓ Research topics</span>
        </div>
        <div class="card-action">
          Start Module Generator →
        </div>
      </a>

      <a href="/course/new" class="workflow-card course-card">
        <div class="card-icon">📚</div>
        <h2>Generate Course</h2>
        <p>Create a complete multi-week course with interconnected modules and learning progressions.</p>
        <div class="card-features">
          <span>✓ Multiple modules</span>
          <span>✓ Course structure</span>
          <span>✓ Learning progression</span>
        </div>
        <div class="card-action">
          Start Course Builder →
        </div>
      </a>
    </div>

    {#if $savedCourses.length > 0}
      <section class="recent-courses">
        <h3>Recent Courses</h3>
        <div class="course-list">
          {#each $savedCourses.slice(0, 3) as course}
            <a href="/course/{course.id}" class="course-item">
              <div class="course-info">
                <h4>{course.title}</h4>
                <p>
                  {course.modules.length} modules • {course.logistics.totalWeeks} weeks
                </p>
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
    grid-template-columns: 1fr 1fr;
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

  .module-card:hover .card-action {
    background: #007bff;
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

  .course-info h4 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
  }

  .course-info p {
    margin: 0;
    color: #666;
    font-size: 0.9rem;
  }

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
