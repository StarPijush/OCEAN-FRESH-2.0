# OceanFresh — Premium Seafood Platform

[![CI](https://github.com/oceanfresh/oceanfresh/actions/workflows/ci.yml/badge.svg)](https://github.com/oceanfresh/oceanfresh/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28)](https://firebase.google.com/)
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
│   ├── firebase/       # Firebase modular SDK config
│   └── config/         # Shared ESLint, TypeScript configs
└── functions/          # Firebase Cloud Functions
```

## Quick Start

```bash
pnpm install
pnpm dev
```

## Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md) | System architecture and design decisions |
| [ROADMAP.md](docs/ROADMAP.md) | Development roadmap |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](docs/SECURITY.md) | Security policies and procedures |
| [CHANGELOG.md](docs/CHANGELOG.md) | Release history |
| [CODE_OF_CONDUCT.md](docs/CODE_OF_CONDUCT.md) | Community standards |
| [ADR/](docs/architecture/adr/) | Architecture Decision Records |

## Tech Stack

- **Frontend:** React 19, TypeScript 5.5, TailwindCSS, shadcn/ui, Framer Motion
- **State:** TanStack Query, Zustand (cart only)
- **Forms:** React Hook Form, Zod
- **Backend:** Firebase Auth, Firestore, Cloud Functions, Storage
- **Security:** Firebase App Check, CSP, RBAC
- **CI/CD:** GitHub Actions, Vercel, Firebase Hosting
- **Quality:** Vitest, Playwright, ESLint, Prettier, Husky

## License

MIT &copy; OceanFresh
