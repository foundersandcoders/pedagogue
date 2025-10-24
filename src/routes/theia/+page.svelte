<script lang="ts">
	import CourseStructureUpload from '$lib/components/theia/CourseStructureUpload.svelte';
	import type { CourseData } from '$lib/types/themis';
	import { goto } from '$app/navigation';
	import { currentCourse, courseWorkflowStep } from '$lib/stores/themisStores';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let errorMessage = '';

	onMount(() => {
		const error = $page.url.searchParams.get('error');
		if (error === 'resume_required') {
			errorMessage =
				'Please upload a course structure to continue working, or start a new course in Themis.';
		}
	});

	function handleCourseUploaded(event: CustomEvent<{ data: CourseData }>) {
		// Populate store
		currentCourse.set(event.detail.data);
		// Jump to structure review step
		courseWorkflowStep.set(4);
		// Navigate to Themis
		goto('/themis/generate');
	}
</script>

<div class="container">
	<header>
		<h1>Theia: Content Manager</h1>
		<p class="subtitle">
			Upload previously generated content to continue working or export in different formats
		</p>
	</header>

	{#if errorMessage}
		<div class="alert alert-warning">
			<span class="alert-icon">⚠️</span>
			<span>{errorMessage}</span>
		</div>
	{/if}

	<div class="upload-section">
		<CourseStructureUpload on:courseUploaded={handleCourseUploaded} />
	</div>

	<div class="help-section">
		<h3>How It Works</h3>
		<ol>
			<li>Export your course structure from Themis (Structure Review step) as JSON</li>
			<li>Upload the JSON file here</li>
			<li>Choose to continue generation or export in different formats</li>
		</ol>

		<h3>What's Preserved</h3>
		<ul>
			<li>All arc narratives and themes</li>
			<li>Module descriptions and learning objectives</li>
			<li>Generated module XML (for completed modules)</li>
			<li>Course and progression narratives</li>
			<li>All logistics and cohort data</li>
		</ul>
	</div>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 2rem auto;
		padding: 0 1.5rem;
	}

	header {
		margin-bottom: 2rem;
		text-align: center;
	}

	h1 {
		margin-bottom: 0.5rem;
		color: #212529;
	}

	.subtitle {
		color: #6c757d;
		font-size: 1.1rem;
		margin: 0;
	}

	.alert {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-radius: 6px;
		margin-bottom: 2rem;
	}

	.alert-warning {
		background-color: #fff3cd;
		border: 1px solid #ffc107;
		color: #856404;
	}

	.alert-icon {
		font-size: 1.25rem;
	}

	.upload-section {
		margin-bottom: 3rem;
	}

	.help-section {
		background: #f8f9fa;
		border-radius: 8px;
		padding: 2rem;
		margin-top: 2rem;
	}

	.help-section h3 {
		color: #495057;
		margin-top: 0;
		margin-bottom: 1rem;
	}

	.help-section h3:not(:first-child) {
		margin-top: 2rem;
	}

	.help-section ol,
	.help-section ul {
		margin: 0;
		padding-left: 1.5rem;
		color: #6c757d;
	}

	.help-section li {
		margin: 0.5rem 0;
	}
</style>
