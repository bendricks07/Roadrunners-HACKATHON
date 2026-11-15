# CampusCurb repository guidance

- Read `README.md`, `docs/architecture.md`, `docs/decisions.md`, and relevant files under `docs/status/` before changing shared behavior.
- The working browser prototype lives in `demo/`. Keep it runnable while other app implementations are developed independently.
- Geographic Explore is integrated on `main`; start follow-up feature branches from the latest `main`. Read `docs/maps.md` and `docs/status/discovery.md` for provider configuration and data gaps. Keep real `cal-poly-slo-*` IDs separate from the walkthrough's `north`, `west`, and `grand` IDs.
- Google Maps is preferred. Its browser/demo key is optional configuration, not a server secret; do not commit keys. Until connected, keep the NAIP / OpenFreeMap / USGS fallbacks explicitly credited. Never use scraped Google map tiles or trace Google imagery into the parking dataset.
- Campus GIS geometry is queried directly. Its `Types` classifications are not eligibility policy. Preserve G2/Structure 131 exclusions, H14 subareas, and closed K1. Missing policy and actual space availability remain unknown. The optional green/yellow/red chance preview is an explicitly labeled UI demo fixture, independent of eligibility; never claim it is measured or validated. City source lines are not verified parking curbs.
- Start with `npm --prefix demo start`; check with `npm --prefix demo run check`. Node 20+ is required; no install step or package dependencies are needed.
- Share parking decisions through `demo/src/rules.js`. Keep deadlines as absolute timestamps; head-back time includes the return walk and buffer.
- Clearly label simulated rules, prices, routes, reports, and availability. Never make a confident recommendation from unknown eligibility or invent live occupancy or completed payments.
- Keep parked-car notes private to the browser. Reports in this demo are local fixtures, not real submissions.
- Use the approved restrained Apple-style design with system typography, neutral surfaces, blue actions, readable status labels, and light/dark appearances.
- Use short feature branches. Preserve teammates' local edits and update the relevant status document before handing off work.
- The Person A/B/C subsystem split in `docs/plans/team-collaboration.md` remains a proposal until the team assigns it. This demo does not claim another teammate's production subsystem. Use `docs/README.md` for current documentation and `CONTRIBUTING.md` for the development workflow.
