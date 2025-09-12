<script>
	import { onMount } from 'svelte';
	
	let currentStep = 1;
	let uploadedFiles = {
		arc: null,
		nextStep: null
	};
	
	const steps = [
		'Upload Files',
		'Analyse Files',
		'Ask Questions',
		'Confirm Understanding', 
		'Deep Research',
		'Generate Module'
	];

	onMount(() => {
		console.log('Pedagogue app initialized');
	});
</script>

<svelte:head>
	<title>Pedagogue - Module Generator</title>
</svelte:head>

<div class="container">
	<header>
		<h1>Pedagogue</h1>
		<p>AI-powered module specification generator for peer-led courses</p>
	</header>

	<div class="workflow">
		<div class="steps">
			{#each steps as step, index}
				<div class="step" class:active={currentStep === index + 1} class:completed={currentStep > index + 1}>
					<span class="step-number">{index + 1}</span>
					<span class="step-name">{step}</span>
				</div>
			{/each}
		</div>

		<div class="content">
			{#if currentStep === 1}
				<div class="upload-section">
					<h2>Upload Module Files</h2>
					<p>Upload your <code>&lt;arc&gt;</code> and <code>&lt;next-step&gt;</code> XML files to begin.</p>
					
					<div class="upload-areas">
						<div class="upload-area">
							<h3>Arc File</h3>
							<div class="drop-zone">
								<p>Drop arc.xml here or click to browse</p>
							</div>
						</div>
						
						<div class="upload-area">
							<h3>Next Step File</h3>
							<div class="drop-zone">
								<p>Drop next-step.xml here or click to browse</p>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="placeholder">
					<p>Step {currentStep} - {steps[currentStep - 1]}</p>
					<p>Implementation coming soon...</p>
				</div>
			{/if}
		</div>
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

	header h1 {
		font-size: 3rem;
		color: #333;
		margin-bottom: 0.5rem;
	}

	header p {
		color: #666;
		font-size: 1.1rem;
	}

	.workflow {
		background: white;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.steps {
		display: flex;
		background: #f8f9fa;
		padding: 1rem;
		border-bottom: 1px solid #e9ecef;
	}

	.step {
		display: flex;
		align-items: center;
		flex: 1;
		padding: 0.5rem;
		position: relative;
	}

	.step:not(:last-child)::after {
		content: '→';
		position: absolute;
		right: -0.5rem;
		color: #ccc;
		font-weight: bold;
	}

	.step-number {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: #e9ecef;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: bold;
		margin-right: 0.5rem;
		font-size: 0.9rem;
	}

	.step.active .step-number {
		background: #007bff;
		color: white;
	}

	.step.completed .step-number {
		background: #28a745;
		color: white;
	}

	.step-name {
		font-size: 0.9rem;
		color: #495057;
	}

	.step.active .step-name {
		color: #007bff;
		font-weight: 600;
	}

	.content {
		padding: 2rem;
	}

	.upload-section h2 {
		margin-bottom: 1rem;
		color: #333;
	}

	.upload-section p {
		color: #666;
		margin-bottom: 2rem;
	}

	.upload-areas {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.upload-area h3 {
		margin-bottom: 1rem;
		color: #495057;
	}

	.drop-zone {
		border: 2px dashed #dee2e6;
		border-radius: 8px;
		padding: 3rem 2rem;
		text-align: center;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.drop-zone:hover {
		border-color: #007bff;
		background-color: #f8f9ff;
	}

	.drop-zone p {
		margin: 0;
		color: #6c757d;
	}

	.placeholder {
		text-align: center;
		padding: 4rem 2rem;
		color: #666;
	}

	code {
		background: #f8f9fa;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'SF Mono', Consolas, monospace;
	}
</style>