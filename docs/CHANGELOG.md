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
- Firebase modular SDK configuration
- \`@oceanfresh/shared\` package (types, validators, errors)
- \`@oceanfresh/ui\` package (accessible components)
- \`@oceanfresh/firebase\` package (client initialization)
- Environment configuration (.env files + validation)
- Vercel configuration (CSP, rewrites, caching)
- GitHub Actions CI/CD pipeline
- Firestore security rules + indexes
- Firebase App Check with reCAPTCHA v3
- Authentication: email login, admin custom claims, OTP reset
- Storefront: product browsing, search, filter, cart, checkout
- Admin panel: dashboard, product CRUD, order management
- Cloud Functions: createOrder, sendOTP, optimizeImage
- RTDB to Firestore migration script
- Automated deployment pipeline

### Security
- Complete zero-trust architecture
- All business logic moved to Cloud Functions
- Rate limiting on all public endpoints
- Input validation on client and server (Zod)
- Audit logging for all admin actions
- CSP headers with strict policy
- Firestore rules with per-document authorization

### Changed
- Migrated from Firebase Realtime Database to Firestore
- Migrated from Firebase compat SDK to modular SDK
- Migrated from JavaScript to TypeScript (strict)
- Migrated from Vite 5 to 6
- Migrated from React 18 to 19
- Replaced vanilla JS admin with React admin
- Removed localStorage-based auth
- Removed client-side OTP generation
- Removed plaintext password storage

### Performance
- Initial JS bundle reduced from 753 KB to <150 KB
- Code splitting with React.lazy for admin routes
- Image optimization pipeline (Cloud Function + sharp)
- TanStack Query for efficient data fetching/caching
- Tree-shaken Firebase imports

### Accessibility
- WCAG 2.2 AA compliant
- Keyboard navigation throughout
- Screen reader support with proper ARIA
- Touch targets ≥44×44px
- Color contrast ≥4.5:1
- prefers-reduced-motion support

### Infrastructure
- GitHub Actions CI (lint → typecheck → test → build)
- Vercel preview deployments on every PR
- Lighthouse CI with performance budgets
- Firebase hosting + Cloud Functions deploy
