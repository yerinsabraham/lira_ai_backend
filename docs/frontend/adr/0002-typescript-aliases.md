# ADR 0002: Strict TypeScript Path Aliases

- Status: Accepted
- Date: 2026-02-23

## Context

Relative imports become fragile in deep trees and make architecture boundaries harder to reason about.

## Decision

Use explicit path aliases per architectural area:

- `@/app`
- `@/components`
- `@/features`
- `@/services`
- `@/hooks`
- `@/lib`
- `@/types`
- `@/styles`
- `@/pages`
- `@/test`

Wildcard forms (for example `@/components/*`) are allowed only inside the same bounded area. Generic catch-all aliases are avoided.

## Consequences

- Imports communicate intended ownership and destination
- Easier refactors and safer moves across folders
- TypeScript rejects unknown alias roots early
