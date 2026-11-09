# Mekong Business Simulator — implementation checklist

## Render deployment preparation

- [x] Add a multi-stage ASP.NET Dockerfile and exclude local/generated files from its context.
- [x] Read Render PORT and bind to 0.0.0.0; preserve local development defaults.
- [x] Configure CORS with FRONTEND_ORIGINS from the backend environment.
- [x] Read and normalize VITE_API_BASE_URL using Vite's typed environment interface.
- [x] Verify ASP.NET publish, production port binding, allowed/denied CORS origins and fallback response.
- [x] Verify frontend build, production API-origin injection and all 18 automated tests.
- [x] Write docs/DEPLOY_RENDER.md with exact Render settings, rewrite, environment setup and troubleshooting.

Deployment itself is performed in the user's Render Dashboard. Docker Desktop was not running locally, so container-image build/runtime is not yet verified; the published .NET app and its environment configuration were verified directly.

## Direction A — playable 2.5D business world

- [x] Replace the dashboard with an interactive Mekong business map.
- [x] Add factory, raw materials, workforce, office and port interactions.
- [x] Show all six purchased upgrades as visible map additions.
- [x] Compact navigation and show resources in a game HUD.
- [x] Add quarterly event cards, optional missions, direct investment confirmations and production preview.
- [x] Add a production animation and quarterly harvest results using the existing engine.
- [x] Verify complete gameplay, persistence, mobile layout, keyboard interaction, reduced-motion handling and console output.
- [x] Update screenshots and usage documentation for the new interface.

Direction A verified with a full four-quarter map playthrough, six direct upgrades, refresh persistence, the shared production flow, final report, phone navigation and building controls. Production console had no errors/warnings. At 1366 × 768 the main operation button is visible (bottom 730 px), with no horizontal overflow. The 17 automated tests, production build and unused-import type check pass. No simulation parameters or save format were changed.

- [x] Phase 1: React/TypeScript/Vite/Tailwind, routing, Zustand, ASP.NET API, environment setup.
- [x] Phase 2: Typed deterministic engine, investments, markets, events, scoring; financial unit tests.
- [x] Phase 3: Vietnamese welcome, dashboard, investment, production, markets, persistence, responsive UI.
- [x] Phase 4: Gemini server integration, knowledge base, contextual advisor, labeled fallback and error handling.
- [x] Phase 5: Four-quarter report, scoring, reproducible scenario comparisons, restart.
- [x] Phase 6: Build, engine tests, API integration checks, browser verification, README/demo instructions.

## Verification

- Production frontend builds successfully; chart code loads separately.
- ASP.NET backend builds with no warnings/errors on the installed .NET 9 SDK.
- 17 automated tests pass: accounting, all investments, fractional affordability boundaries, market sales scoring, eligibility, events, progression, reproducible scenarios, save validation and advisor failures.
- Actual local health, OpenAPI, analyze and chat endpoints verified; Vite API proxy verified.
- Browser playthrough completed all four quarters and all six investments, with market unlocking, financial previews, results and final scoring.
- Refresh preserved midgame progress; restart cleared the test run.
- Comparison metric switching and charts verified in the production build; no production console errors/warnings observed.
- Desktop 1366 × 768 and mobile 390 × 844 reviewed; no horizontal overflow.
- Dependency installation audit reports zero known vulnerabilities.
- Setup instructions, accounting assumptions, demo route and limitations are recorded in README.md.

Live Gemini output is unverified because no API credential was supplied. Server integration is implemented; verified fallback mode keeps the complete game playable. No hosted deployment was performed.

All monetary parameters are hypothetical and expressed in million VND. Accounting profit and theoretical surplus value remain separate. No live Gemini claim without credentials and a successful response.


Chapter-based gameplay redesign: see [docs/GAMEPLAY_REDESIGN.md](docs/GAMEPLAY_REDESIGN.md).
