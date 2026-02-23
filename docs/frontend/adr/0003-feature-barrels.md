# ADR 0003: Feature and Layer Barrel Exports

- Status: Accepted
- Date: 2026-02-23

## Context

A growing frontend needs stable public entrypoints for each module to avoid leaking internal file structure.

## Decision

Define `index.ts` barrels for each feature/layer directory:

- Layer barrels: `app`, `components`, `features`, `services`, `hooks`, `lib`, `types`, `styles`, `pages`, `test`
- Feature barrels: `features/meeting`, `features/participants`, `features/ai-participant`, `features/settings`

Direct deep imports are discouraged unless the target is intentionally public.

## Consequences

- Cleaner imports and clearer module API boundaries
- Safer internal refactors because consuming code targets stable barrels
- Additional discipline needed to keep barrel exports intentional
