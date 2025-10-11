const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {"start":"_app/immutable/entry/start.39aeeefc.js","app":"_app/immutable/entry/app.f65d8a7d.js","imports":["_app/immutable/entry/start.39aeeefc.js","_app/immutable/chunks/scheduler.f2852044.js","_app/immutable/chunks/singletons.0f24939e.js","_app/immutable/chunks/index.7c55792a.js","_app/immutable/entry/app.f65d8a7d.js","_app/immutable/chunks/scheduler.f2852044.js","_app/immutable/chunks/index.9ee979af.js"],"stylesheets":[],"fonts":[]},
		nodes: [
			__memo(() => import('./chunks/0-15bf5711.js')),
			__memo(() => import('./chunks/1-26cd17ef.js')),
			__memo(() => import('./chunks/2-19399b08.js'))
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
				endpoint: __memo(() => import('./chunks/_server.ts-75ab501f.js'))
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
