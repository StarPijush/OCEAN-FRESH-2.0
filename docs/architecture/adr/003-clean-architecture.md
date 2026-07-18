# ADR 003: Clean Architecture with Domain-Driven Design

**Status:** Accepted  
**Date:** 2026-07-16  

## Context

The current codebase mixes auth, data fetching, business logic, and UI concerns in a single IIFE module (`src/store/index.js`). This is not maintainable beyond a few hundred lines.

## Decision

Use Clean Architecture with Domain-Driven Design principles.

## Rationale

- **Separation of concerns:** UI, business logic, and data access in separate layers
- **Testability:** Each layer can be tested independently
- **Swapability:** Repository pattern allows swapping Firestore for another DB
- **Team scaling:** Multiple developers can work on different domains simultaneously
- **Future-proof:** Adding features doesn't require rewriting existing code

## Architecture Layers

```
Presentation  →  Application  →  Domain  →  Infrastructure
    (React)        (Hooks)      (Services)    (Firebase)
```

Each domain (auth, products, orders) owns its:
- Components
- Hooks
- Services
- Types
- Tests

## Alternatives Considered

- **Feature-based (no layers):** Simpler but couples UI to data access (rejected)
- **MVC:** Not suitable for React's component model (rejected)
- **Flux:** Overly complex for this scale (rejected — we use TanStack Query for server state)

## Consequences

- More files and directories than a flat structure
- Learning curve for developers unfamiliar with Clean Architecture
- Strict import rules enforced by ESLint (no repository imports in components)
