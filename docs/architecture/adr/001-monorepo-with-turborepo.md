# ADR 001: Monorepo with Turborepo

**Status:** Accepted  
**Date:** 2026-07-16  
**Author:** Principal Software Architect

## Context

The project must manage multiple applications (storefront, admin), shared packages (types, UI, Firebase configuration), and Cloud Functions — all sharing TypeScript configuration, ESLint rules, and build tooling.

## Decision

Use pnpm workspaces with Turborepo for task orchestration.

## Rationale

- **Single dependency tree:** One `pnpm install` for all packages
- **Atomic commits:** Changes across packages in one commit
- **Shared configs:** TypeScript, ESLint, Prettier configured once
- **Caching:** Turborepo caches build/lint/test outputs — second CI run is 80% faster
- **Dependency graph:** `turbo run build` builds in correct order automatically
- **Future-proof:** Easy to add new apps/packages

## Alternatives Considered

- **Nx:** More powerful but steeper learning curve and more configuration. Turborepo provides 80% of the value with 20% of the complexity.
- **Lerna:** Effectively deprecated in favor of Nx.
- **Multiple repos:** More isolation but makes atomic cross-package changes impossible.

## Consequences

- Developers must learn pnpm workspaces and Turborepo
- Build caching must be invalidated on config changes
- All packages must follow the monorepo conventions

## Migration

The existing project is a single app — no migration needed. Starting fresh.
