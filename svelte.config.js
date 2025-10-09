import adapter from '@sveltejs/adapter-node';
/* @type {import('@sveltejs/kit').Config} */
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: false
		}),
		files: {
			assets: 'static',
			hooks: {
				client: 'src/hooks.client.js',
				server: 'src/hooks.server.js'
			},
			lib: 'src/lib',
			params: 'src/params',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker.js',
			appTemplate: 'src/app.html',
			errorTemplate: 'src/error.html'
		}
	}
};

export default config;
