# Demo implementation decisions

These are choices for Matthew's one-hour demonstration branch, not agreements imposed on the eventual production app.

1. Isolate a complete browser journey in `demo/` so another teammate can build at the root independently.
2. Use native ES modules, CSS, local SVG artwork, and Node's HTTP server. Require no install or service keys for the presentation.
3. Apply the approved Apple-style direction: system fonts, generous spacing, neutral surfaces, restrained blue, clear deadlines, and light/dark appearances.
4. Label rules, prices, reports, routes, and map geometry as demonstration data. Keep space availability unknown and distinct from permit fit.
5. Use one evaluator for recommendations and explanations, with shared session/deadline helpers.
6. Persist absolute timestamps; never reset parking time on refresh or silently remove expired sessions.
7. Provide a 90-second demo with a 30-second return walk, 30-second buffer, and reminder after 30 seconds.
8. Keep reports local; use a walkway-closure simulation to demonstrate connected recommendations and reminders.
9. Deliver on `codex/campuscurb-demo`, keeping main stable for review and integration.
10. The geographic extension is isolated on `codex/satellite-parking-map`. Google Maps is preferred, with an explicit USGS fallback while the browser key is missing. Real campus IDs and GIS geometry are separate from fictional walkthrough data; manual real-area reminders never inherit sample rules or walking times. See `docs/maps.md`.
