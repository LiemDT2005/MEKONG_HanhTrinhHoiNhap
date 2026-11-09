# Verification record

## Chapter redesign — 9 November 2026

These checks supersede the older four-quarter gameplay descriptions below.

- Baseline: all 18 existing tests and frontend production build passed before changes.
- After chapter events and strategy integration: the existing 18 tests and production build passed; the logistics regression test was moved from period four to period three to match the new story order.
- Final coverage: 31 tests in 5 files, including all existing financial/API/save checks, chapter decisions, insufficient working capital, duplicate decisions, export eligibility, all reachable choice paths, deterministic cash reconciliation, balanced winning/non-winning strategies, and save recovery.
- Store integration checks verify that missions cannot be skipped, a double operation cannot skip a chapter, decisions survive persistence, old saves retain their history, and investment/market changes trigger advisor feedback.
- React server-render checks cover the existing interactive map, illustrated scenario, disruption versus upgraded logistics, and durable educational/final reports. These are rendering smoke checks, not browser interaction or visual layout approval.
- Frontend TypeScript/Vite build passed. Vite reports a main bundle above its 500 kB warning threshold; chart code remains split as before.
- Backend build passed with 0 warnings/errors using an isolated output directory. The normal output executable was locked by an already-running backend; that process was left running. Restart the backend to load the revised advisor prompt.
- Live browser verification could not be completed: the in-app browser timed out reaching the local dev server; Windows automation stopped because it could not confidently determine the browser URL. No visual screenshots or end-to-end click-through are claimed for this redesign.
- Live Gemini output was not verified. Mocked API success/failure and deterministic educational fallback were checked; advice cannot mutate simulation state.

The new final outcome requires net asset growth/liquidity, productive technology, labor development, faster turnover, and a profitable final export sale. The legacy 100-point score is explicitly secondary. An expensive prepared EU strategy can make export sales while failing the overall win condition; a lower-cost training/traceability/logistics/RCEP strategy can win.

Official agreement references were checked against European Commission EVFTA texts and New Zealand MFAT RCEP text/resources. Game thresholds remain hypothetical and do not claim legal eligibility.

## Earlier version verification

Local checks on 9 November 2026:

- `npm run build`: passed, TypeScript and Vite production output.
- `npm test`: 17 tests passed in 3 files.
- `dotnet build backend --no-restore`: passed, 0 warnings, 0 errors.
- Installed dependency audit: 0 known vulnerabilities after updating build/test tooling.
- `scripts/verify-api.ps1`: health, OpenAPI, analyze, and chat passed in explicitly labeled demo mode.
- Vite `/api/health` proxy: HTTP 200.

Browser checks:

- New company with custom player name; correct initial cash/assets/capacity/quality.
- Purchased all six upgrades over three quarters; confirmation shows the projected quantity and ending cash.
- RCEP and EU eligibility, export selection, insufficient working-capital warnings.
- Full four-quarter playthrough, accounting results, quarter 4 logistics mitigation, final score and achievement badges.
- Midgame refresh restored saved progress; reset confirmation returned to an empty welcome form.
- Both strategy reports and changing comparison metrics work. Production console had no warnings or errors during the welcome/dashboard/report checks. Development hot reload briefly logged errors while source files were being formatted; those were absent in the production build.
- Layout reviewed at 1366 × 768 and 390 × 844; document width did not exceed viewport width.
- Keyboard focus stays inside confirmation dialogs; Escape closes them. Reduced-motion preferences disable CSS transitions.

Screenshots: `welcome-preview.jpg` and `comparison-preview.jpg`.

## Direction A — 2.5D world update

- Frontend production build and `tsc --noEmit --noUnusedLocals` pass; all 17 existing engine, persistence and advisor tests pass.
- Completed a fresh four-quarter playthrough through the interactive world. Bought all six upgrades from their buildings; visible map details and purchase states update immediately.
- Confirmed direct investments use the existing engine preview. Cash and quarterly results match the previous interface: RCEP Q1, EU Q2–Q4, final cash 324.7 million, score 59/100.
- Verified event reading, keyboard Enter on a building, investment confirmation, one-time quarterly transition, animation, harvest result, and final report navigation.
- Detailed production page returns to the same map confirmation/animation flow; it has no separate financial execution path.
- Midgame refresh restored upgrades, balances, capacity, quality, market and quarter.
- On 390 × 844, all four resources remain visible, building picker opens the matching panel and scrolls to it, navigation opens/closes correctly, and the page has no horizontal overflow (375 px document width with a 390 px viewport including scrollbar).
- Closed mobile navigation is inert; open navigation makes the workspace inert. Confirmation dialogs preserve keyboard focus. Animation has a skip control; reduced-motion handling is present in both CSS and the animation timer.
- Advisor still responds in explicitly labeled fallback mode with the real local API.
- Final production bundle loaded without console errors or warnings. At 1366 × 768, document width was 1351 px and the main operation button ended at 730 px, within the viewport.

Screenshots for the new interface: `world-preview.jpg`, `world-upgraded-preview.jpg` and `world-mobile-preview.jpg`.

Not verified: a live Gemini response (no key available), public deployment, or production hosting. The approved offline educational mode and real local frontend/backend connection were verified. These checks do not represent testing against actual export regulations or real financial data.
