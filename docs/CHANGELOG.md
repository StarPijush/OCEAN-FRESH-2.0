# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Enterprise architecture freeze — Phase 0 complete
- Turborepo monorepo with pnpm workspaces
- TypeScript strict configuration
- ESLint + Prettier with consistent rules
- Husky pre-commit hooks + commitlint
- Design system v1 (shadcn/ui + design tokens)
- \`@oceanfresh/shared\` package (types, validators, errors)
- \`@oceanfresh/ui\` package (accessible components)
- \`@oceanfresh/supabase\` package (client initialization)
- Environment configuration (.env files + validation)
- GitHub Actions CI/CD pipeline
- PostgreSQL schema (10 migration files)
- Supabase RLS policies (row-level security)
- Authentication: email login, admin password reset
- Storefront: product browsing, search, filter, cart, checkout
- Admin panel: dashboard, product CRUD, order management
- Automated deployment pipeline

### Security

- Input validation on client and server (Zod)
- Supabase Row Level Security for all tables
- CSP headers with strict policy

### Changed

- Migrated from Firebase to Supabase (all backend services)
- Migrated from Firestore to PostgreSQL
- Migrated from JavaScript to TypeScript (strict)
- Migrated from Vite 5 to 6
- Migrated from React 18 to 19
- Replaced vanilla JS admin with React admin

### Removed

- All Firebase dependencies (firebase-admin, firebase-functions, firebase SDK)
- Firebase Realtime Database code (legacy RTDB repositories)
- Firebase Firestore code (Firestore repositories, rules, indexes)
- Firebase Auth (replaced by Supabase Auth)
- Firebase Cloud Functions (stubs only — no business logic)
- Firebase App Check (not implemented)
- \`@oceanfresh/firebase\` package (never existed as source)

### Performance

- TanStack Query for efficient data fetching/caching
- Tree-shaken Supabase imports

### Infrastructure

- GitHub Actions CI (lint → typecheck → test → build)
- Vercel preview deployments on every PR
