# Architecture Decision: Runtime Consolidation

## Context

The project initially had Deno spawning Node processes to run SvelteKit—architecturally curious but ultimately irrational. A wrapper that provides no value is just ceremony.

## Decision

**Use Deno's native npm specifier system to run SvelteKit directly within Deno runtime.**

This eliminates the dual-runtime complexity whilst preserving both SvelteKit's ecosystem and Deno's actual benefits (permissions model, built-in TypeScript, standard library).

## Implementation

### Configuration Changes

- Keep `deno.json`, make `package.json` optional (or minimal for IDE support)
- All dependencies via `npm:` specifiers in imports
- Tasks run Vite directly through Deno
- Delete `main.ts` (or simplify to `deno task dev` wrapper)

### What We Gain

**From Deno:**
- Built-in TypeScript (no build step for scripts)
- Explicit permissions model
- Standard library without npm cruft
- Single executable deployment

**From SvelteKit:**
- Mature routing and SSR
- Robust ecosystem access
- Excellent DX for UI development

**Rationality:**
- One runtime doing actual work
- npm specifiers are a feature, not a hack
- No abstraction layers that serve no purpose
- Each piece justifies its existence

## Escape Hatch

If Deno + SvelteKit creates genuine friction (tooling issues, deployment complexity), Priority 1 (rational structure) overrides Priority 3 (Deno preference).

In that case: delete all Deno config, use pure Node + SvelteKit. Rationality > aesthetic preferences.

## Status

Decision made: 2025-10-08
Implementation: Pending
Expected emotional journey: Initial satisfaction → brief confusion → eventual contentment or rage-deletion

Both outcomes valid.
