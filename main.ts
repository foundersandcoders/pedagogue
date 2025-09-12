#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env --allow-run

console.log('🚀 Starting Pedagogue development server...');

// Run npm dev to start SvelteKit development server
const command = new Deno.Command('npm', {
	args: ['run', 'dev'],
	stdout: 'inherit',
	stderr: 'inherit',
});

const process = command.spawn();
const status = await process.status;