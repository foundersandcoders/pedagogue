import { c as create_ssr_component } from './ssr-280359d3.js';

const css = {
  code: "body{margin:0;padding:0;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;background:#fafafa}main.svelte-bfmj6h{max-width:1200px;margin:0 auto;padding:2rem}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css);
  return `<main class="svelte-bfmj6h">${slots.default ? slots.default({}) : ``} </main>`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-72f8a07f.js.map
