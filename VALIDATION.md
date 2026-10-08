# Validation record — 8 October 2026

Passed on Windows with Node 24.19 and local embedded PostgreSQL:

- TypeScript strict check and compilation: server, shared schemas, API client and tests.
- ESLint: server, shared schemas, API client and tests.
- Build: compiled API, bundled browser API client; retained renderer/integration JavaScript syntax checks.
- Eight Node test results: authentication/CSRF/RBAC; asset CRUD/constraints/pagination; valid/invalid images and report-to-score/Pulse changes; incident lifecycle and safe deletion; directed deterministic/cycle-safe RICE and saved overlay; optimizer constraints and non-destructive what-if; ownership/audit/notifications/search/session revocation; full-suite restart persistence.
- Two Chrome browser tests: original pages, desktop navigation, asset create/filter/refresh persistence, RICE, budget, what-if, citizen submission, mobile overflow, logout; citizen ownership/permissions, protected deep links, API-failure state and retry.
- Screenshots inspected at 1280px and 390px. Navigation overlap and mobile overflow were corrected while retaining the existing design language.

The sandbox initially blocked loopback networking and its bundled Chromium executable could not launch. Tests were successfully run with local networking and installed Chrome. No test failures remain in the tested configuration.

Not verified: hosted production deployment, external PostgreSQL server, external GIS feeds, load/penetration testing, multi-village use or engineering validity of the demo formulas. These are not represented as completed. See README.md for exact model and deployment boundaries.
