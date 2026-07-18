# OceanFresh Architecture

## System Overview

OceanFresh is a serverless e-commerce platform built on Firebase, featuring a Clean Architecture monorepo with strict separation of concerns.

```
┌──────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  apps/storefront/  apps/admin/  (React 19 SPAs)              │
├──────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                          │
│  TanStack Query  |  React Router  |  React Hook Form         │
├──────────┬───────────┬────────────┬───────────┬──────────────┤
│  AUTH    │ PRODUCTS  │  ORDERS    │ CHECKOUT  │  SETTINGS    │
│  Domain  │  Domain   │  Domain    │  Domain   │  Domain      │
├──────────┴───────────┴────────────┴───────────┴──────────────┤
│                    SERVICE LAYER                              │
│  AuthService  |  ProductService  |  OrderService              │
├──────────────────────────────────────────────────────────────┤
│                    REPOSITORY LAYER                           │
│  ProductRepo  |  OrderRepo  |  UserRepo  |  SettingsRepo     │
├──────────────────────────────────────────────────────────────┤
│                    INFRASTRUCTURE LAYER                       │
│  Firebase Auth  |  Firestore  |  Cloud Functions  |  Storage │
└──────────────────────────────────────────────────────────────┘
```

## Architecture Decisions

All ADRs in [docs/architecture/adr/](adr/)

| ADR | Decision | Rationale |
|---|---|---|
| 001 | Monorepo with Turborepo | Shared types, configs, atomic commits |
| 002 | Firestore over RTDB | Rich queries, auto-scaling, security rules |
| 003 | Clean Architecture + DDD | 10-year maintainability, team scaling |
| 004 | Cloud Functions for sensitive ops | Zero-trust security posture |
| 005 | TanStack Query for server state | Caching, deduplication, stale management |
| 006 | TypeScript strict | Zero-runtime type safety |

## Package Dependency Graph

```
@oceanfresh/storefront  →  @oceanfresh/shared, @oceanfresh/ui, @oceanfresh/firebase
@oceanfresh/admin       →  @oceanfresh/shared, @oceanfresh/ui, @oceanfresh/firebase
@oceanfresh/ui          →  @oceanfresh/shared
@oceanfresh/firebase    →  @oceanfresh/shared
@oceanfresh/shared      →  (leaf — no internal deps)
```

## Data Flow

### Read Flow
```
Page → Hook (TanStack Query) → Service → Repository → Firestore
                                                     ↓
                                              Cache (TanStack)
```

### Write Flow
```
Form (RHF + Zod) → Hook (useMutation) → Service → Cloud Function → Firestore
                                                                    ↓
                                                             Invalidate Query
```

## Security Layers

1. **Network:** HTTPS enforced, CSP headers, HSTS
2. **App Level:** Firebase App Check (reCAPTCHA v3)
3. **Auth:** Firebase Auth with Custom Claims
4. **Data:** Firestore security rules (per-document)
5. **API:** Cloud Function validation (Zod) + rate limiting
6. **Audit:** All admin actions logged to auditLogs collection

## Performance Targets

| Metric | Target |
|---|---|
| Initial JS bundle | <150 KB |
| LCP | <2.0s |
| INP | <100ms |
| CLS | <0.1 |
| TTI | <3.0s |
