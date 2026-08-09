# OceanFresh — Premium Seafood Platform

[![CI](https://github.com/oceanfresh/oceanfresh/actions/workflows/ci.yml/badge.svg)](https://github.com/oceanfresh/oceanfresh/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Enterprise-grade premium seafood e-commerce platform serving Jhargram, West Bengal. Fresh catch delivered within 3 hours.

## Architecture

```
oceanfresh/
├── apps/
│   ├── storefront/     # Customer-facing React 19 SPA
│   └── admin/          # Admin panel React 19 SPA
├── packages/
│   ├── shared/         # Types, validators, utilities
│   ├── ui/             # Design system (shadcn/ui)
│   ├── supabase/       # Supabase client configuration
│   └── config/         # Shared ESLint, TypeScript configs
├── database/           # PostgreSQL migrations (Supabase)
└── scripts/            # Utility scripts
```

## Quick Start

```bash
pnpm install
pnpm dev
```

## Documentation

| Document                                             | Description                              |
| ---------------------------------------------------- | ---------------------------------------- |
| [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | System architecture and design decisions |
| [ROADMAP.md](docs/ROADMAP.md)                        | Development roadmap                      |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md)              | Contribution guidelines                  |
| [SECURITY.md](docs/SECURITY.md)                      | Security policies and procedures         |
| [CHANGELOG.md](docs/CHANGELOG.md)                    | Release history                          |
| [CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md)        | Community standards                      |
| [ADR/](docs/architecture/adr/)                       | Architecture Decision Records            |

## Tech Stack

- **Frontend:** React 19, TypeScript 5.5, TailwindCSS, shadcn/ui, Framer Motion
- **State:** TanStack Query, Zustand (cart only)
- **Forms:** React Hook Form, Zod
- **Backend:** Supabase Auth, PostgreSQL, Storage, Row Level Security
- **Security:** CSP, PostgreSQL RLS, RBAC
- **CI/CD:** GitHub Actions, Vercel
- **Quality:** Vitest, Playwright, ESLint, Prettier, Husky

## License

MIT &copy; OceanFresh
