# CampusCurb repository guidance

- Read `README.md`, `docs/architecture.md`, `docs/decisions.md`, and relevant files under `docs/status/` before changing shared behavior.
- The working browser prototype lives in `demo/`. Keep it runnable while other app implementations are developed independently.
- Start with `npm --prefix demo start`; check with `npm --prefix demo run check`. Node 20+ is required; no install step or package dependencies are needed.
- Share parking decisions through `demo/src/rules.js`. Keep deadlines as absolute timestamps; head-back time includes the return walk and buffer.
- Clearly label simulated rules, prices, routes, reports, and availability. Never make a confident recommendation from unknown eligibility or invent live occupancy or completed payments.
- Keep parked-car notes private to the browser. Reports in this demo are local fixtures, not real submissions.
- Use the approved restrained Apple-style design with system typography, neutral surfaces, blue actions, readable status labels, and light/dark appearances.
- Use short feature branches. Preserve teammates' local edits and update the relevant status document before handing off work.
- The README's Person A/B/C subsystem split remains a proposal until the team assigns it. This demo does not claim another teammate's production subsystem.
