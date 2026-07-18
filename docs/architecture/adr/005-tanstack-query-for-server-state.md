# ADR 005: TanStack Query for Server State

**Status:** Accepted  
**Date:** 2026-07-16  

## Context

The application needs to manage server state (products, orders, settings) separate from client state (cart, form inputs, UI state).

## Decision

Use TanStack Query (React Query v5) for all server state management.

## Rationale

- **Automatic caching:** Deduplicates requests, caches responses, stale-while-revalidate
- **Background refetching:** Data stays fresh without manual work
- **Optimistic updates:** Cart mutations update instantly
- **Pagination/infinite queries:** Built-in cursor-based pagination
- **DevTools:** Excellent debugging experience
- **TypeScript:** First-class TypeScript support
- **Bundle size:** ~13 KB gzipped

## State Management Strategy

| State Type | Tool |
|---|---|
| Server state (products, orders) | TanStack Query |
| Client state (form inputs) | React Hook Form |
| UI state (modals, toasts) | React local state |
| Cross-component UI state (cart) | Zustand (minimal) |
| Auth state | React Context + TanStack Query |

## Alternatives Considered

- **Redux Toolkit + RTK Query:** Heavier bundle (~30 KB), more boilerplate (rejected)
- **Zustand for everything:** Would duplicate server state management logic (rejected)
- **SWR:** Simpler but less feature-rich than TanStack Query (rejected)

## Consequences

- Learning curve for TanStack Query patterns
- Must configure queryClient with sensible defaults
- Cache invalidation must be explicit on mutations
- Must handle stale states (isStale, isFetching)
