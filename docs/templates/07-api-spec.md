# API Specification (contract)

Conventions: JSON, ISO-8601 UTC dates, error envelope
`{ "error": { "code": "STRING_CODE", "message": "Human readable" } }`.
List responses: `{ "data": [], "page": 1, "pageSize": 20, "total": 0 }`.

## Endpoint index
| Method | Path / action | Purpose | Auth / roles | Status |
|---|---|---|---|---|

## Endpoint detail
### `METHOD /api/resource`
- **Purpose:**
- **Auth:** roles allowed, ownership rule
- **Request:** params / query / body schema
- **Response 2xx:** shape + example
- **Errors:** 400 VALIDATION · 401 · 403 · 404 · 409 CONFLICT · 422 RULE_VIOLATION
- **Side effects:** notifications, activity log, emails

## Shared schemas / types
