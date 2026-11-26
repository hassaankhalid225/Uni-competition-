# Code Quality Standards

## Structure
- Modular, feature-oriented folders (`features/<domain>/{components,api,schema,hooks}`) over
  giant type-based folders once a project has more than ~3 domains.
- Separation of concerns: UI components never talk to the database directly; route handlers stay
  thin and call service functions; business rules live in one place (service layer).
- One source of truth for types: derive TS types from validation schemas (`z.infer`) or the ORM
  schema — do not hand-duplicate shapes.
- Prefer the simplest design that delivers the requirement. No speculative abstraction, no
  generic "framework inside the app", no premature micro-services.

## Naming
- Files: `kebab-case.ts(x)`; React components: `PascalCase`; functions/vars: `camelCase`;
  constants: `SCREAMING_SNAKE_CASE`; DB tables/columns: `snake_case`, plural table names.
- Names describe intent (`approveBooking`, not `handleClick2`). Booleans read as questions
  (`isOverdue`, `hasAccess`).

## Type safety
- TypeScript `strict: true`. No `any` without a comment explaining why. No non-null `!` on data
  from the network or DB.
- Python: type hints + Pydantic models at boundaries.

## Errors & validation
- Validate every external input at the boundary (request body, query, params, form, file,
  env vars) with a schema. Trust nothing from the client.
- Never swallow errors silently. Log server-side with context; show users a clear, human message.
- Every async UI has loading, empty, error and success states.

## Readability
- Functions do one thing; ~40 lines is a smell, not a law.
- Comments explain *why*, not *what*. Delete dead code and commented-out blocks.
- No magic numbers/strings for domain values — use named constants or enums.

## Before calling a task done
- It type-checks, lints, builds, and the affected flow was exercised (see `verification-honesty.md`).
