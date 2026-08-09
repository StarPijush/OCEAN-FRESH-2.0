# Contributing to OceanFresh

## Quick Start

```bash
git clone https://github.com/oceanfresh/oceanfresh.git
cd oceanfresh
pnpm install
pnpm dev
```

## Before You Code

1. **Check existing issues and PRs** — someone may already be working on it
2. **Discuss architecture changes via ADR** — create an ADR before implementing
3. **Follow the Engineering Constitution** — see `docs/CONSTITUTION.md`
4. **Write a test first** — we follow TDD for all business logic

## Branch Strategy

| Branch      | Purpose        | Protected | Deploys To        |
| ----------- | -------------- | --------- | ----------------- |
| `main`      | Production     | ✅        | Vercel production |
| `staging`   | Pre-production | ✅        | Vercel staging    |
| `develop`   | Integration    | ✅        | —                 |
| `feat/*`    | Features       | ❌        | Vercel preview    |
| `fix/*`     | Bug fixes      | ❌        | Vercel preview    |
| `release/*` | Release prep   | ❌        | —                 |
| `hotfix/*`  | Emergency      | ❌        | Direct to staging |

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): implement admin login with OTP
fix(orders): correct delivery charge calculation
security(api): add rate limiting to OTP endpoint
perf(ui): memoize product list rendering
```

## PR Checklist

- [ ] Code follows coding standards
- [ ] TypeScript strict compiles
- [ ] ESLint: zero errors, zero warnings
- [ ] Tests written and passing (coverage ≥90%)
- [ ] No `console.log` / `debugger`
- [ ] No `TODO` / `FIXME` / `HACK`
- [ ] No magic numbers or strings
- [ ] Error handling complete (loading, empty, error states)
- [ ] Accessible (keyboard, screen reader, axe-core)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] No performance regressions
- [ ] No circular dependencies
- [ ] Security best practices followed
- [ ] Documentation updated (if applicable)
- [ ] ADR written (if architectural change)

## Development Workflow

```bash
# Start dev servers
pnpm dev

# Run all checks before pushing
pnpm lint          # ESLint
pnpm typecheck     # TypeScript strict
pnpm test          # Vitest
pnpm build         # All packages

# Run specific app
pnpm dev:storefront
pnpm dev:admin
pnpm dev:functions

# Add a new package
pnpm --filter @oceanfresh/shared add zod

# Run tests for a specific package
pnpm --filter @oceanfresh/storefront test
```

## Coding Standards

- **Files:** kebab-case (`use-products.ts`, `product.service.ts`)
- **Components:** PascalCase (`ProductCard.tsx`)
- **Functions:** camelCase (`getFilteredProducts`)
- **Types/Interfaces:** PascalCase (no `I` prefix)
- **Enums:** PascalCase (`OrderStatus`)
- **Constants:** UPPER_SNAKE_CASE
- **Max lines per file:** 300
- **Max lines per component:** 150
- **Max lines per function:** 40
- **Max parameters:** 3
- **Max nesting:** 3
- **Max cyclomatic complexity:** 10

## Code Review Expectations

Reviews focus on:

1. **Correctness** — Does it solve the problem?
2. **Security** — Any vulnerabilities?
3. **Maintainability** — Will another developer understand this in 6 months?
4. **Performance** — Any unnecessary work?
5. **Accessibility** — Can everyone use this?
6. **Test coverage** — Are edge cases covered?

## Getting Help

- Slack: #engineering channel
- Office hours: Wednesdays 3-4 PM IST
- PRs: Tag @oceanfresh/engineering for review
