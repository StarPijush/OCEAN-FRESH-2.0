# ADR 002: Firestore over Realtime Database

**Status:** Superseded by migration to Supabase PostgreSQL  
**Date:** 2026-07-16

## Context

The current project uses Firebase Realtime Database (RTDB). The database stores products, orders, and settings. Key problems:

1. No query capabilities — `getStats()` fetches ALL orders to count pending
2. No filtering — must filter client-side
3. Security rules are path-based, not document-based
4. No automatic sharding — limited to ~200K concurrent connections

## Decision

Migrate from RTDB to Firestore.

## Rationale

- **Rich queries:** `where`, `orderBy`, `limit`, `startAfter` (cursor-based pagination)
- **Document-level security:** Rules checked per-document, not per-path
- **Auto-scaling:** Shards automatically up to millions of documents
- **Composite indexes:** Efficient complex queries
- **Better SDK:** Firestore has better TypeScript support
- **Cost model:** Pay per read/write — better for query-heavy workloads

## Alternatives Considered

- **Keep RTDB + add indexes:** Impossible — RTDB doesn't support indexes (rejected)
- **Supabase:** Would require abandoning Firebase ecosystem (rejected — future consideration)
- **Custom backend + PostgreSQL:** More control but vastly more operational overhead (rejected)

## Consequences

- Must rewrite all data access code
- Data migration script needed (RTDB → Firestore)
- Firestore has higher per-document read cost ($0.06/100K vs RTDB bandwidth pricing)
- Real-time listeners use `onSnapshot` instead of `on('value')`

## Supersession Note

This ADR is superseded. The project has migrated directly from Firebase RTDB to **Supabase PostgreSQL** (2026-07-30), skipping Firestore entirely. The SQL migrations are in the `database/` directory.

See `database/001_extensions.sql` through `database/010_verify.sql` for the full schema.
