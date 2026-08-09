# ADR 006: TypeScript Strict Mode

**Status:** Accepted  
**Date:** 2026-07-16

## Context

The current codebase is JavaScript with no type safety. This leads to runtime errors, poor IDE support, and difficulty refactoring.

## Decision

Use TypeScript in strict mode across the entire monorepo.

## Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## Rationale

- **Zero runtime type errors:** Catch bugs at compile time
- **Superior IDE support:** Autocomplete, refactoring, inline docs
- **Self-documenting code:** Types serve as documentation
- **Safer refactoring:** Compiler catches every usage change
- **Team scaling:** New developers understand the codebase faster

## Alternatives Considered

- **JSDoc:** Less powerful, no compile-time checking (rejected)
- **TypeScript with loose mode:** Catches fewer bugs (rejected — strict or nothing)
- **Flow:** Effectively abandoned by Facebook (rejected)

## Consequences

- Migration cost (JS → TS for existing files — but we're rewriting anyway)
- Learning curve for developers new to TypeScript
- Build step required (handled by Vite)
- Third-party libraries may lack types (install @types/ or write custom)
