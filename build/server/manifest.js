const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png","github-header-banner.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.97df58f9.js","app":"_app/immutable/entry/app.a25684a9.js","imports":["_app/immutable/entry/start.97df58f9.js","_app/immutable/chunks/scheduler.f2852044.js","_app/immutable/chunks/singletons.84cf9a65.js","_app/immutable/chunks/index.7c55792a.js","_app/immutable/entry/app.a25684a9.js","_app/immutable/chunks/scheduler.f2852044.js","_app/immutable/chunks/index.9ee979af.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-15bf5711.js')),
			__memo(() => import('./chunks/1-bf97fe62.js')),
			__memo(() => import('./chunks/2-1f5d0e12.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/generate",
				pattern: /^\/api\/generate\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-df2a67d9.js'))
			}
		],
		matchers: async () => {
			
			return {  };
		}
	}
}
})();

const prerendered = new Set([]);

export { manifest, prerendered };
//# sourceMappingURL=manifest.js.map
