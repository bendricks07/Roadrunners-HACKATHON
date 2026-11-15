# Geographic Explore implementation

Branch: `codex/satellite-parking-map`. Implementation started November 14, 2026.

## Implemented

- A map-first Explore layout with a floating desktop panel and phone bottom sheet, restrained light/dark surfaces, a clear legend, parking categories, source information, and keyboard-accessible controls.
- Google Maps adapter with satellite/hybrid, terrain, GeoJSON overlays, custom accessible parking labels, and an in-app browser/demo-key connection. The source default is blank; a Google key has not been supplied or tested against Google's live SDK.
- An explicitly labeled USDA/USGS aerial/topographic fallback and locally bundled Leaflet, with no npm install needed to run the app.
- Direct Cal Poly public GIS queries for eight lot/structure outlines plus closed K1's point; no invented polygons or street segments.
- Shared permit/time evaluation preserving exclusions, whole-stay checks, unknown policy states, separate occupancy, and distinct Grand Avenue/131 identities.
- Real-area manual reminders with an explicitly entered deadline and walk estimate, absolute timestamps, local notes, and restore/end behavior. Original demo sessions remain separate.
- The old fictional walkthrough is reachable from Explore, and the 90-second presentation path remains available.

## Validation

- `npm --prefix demo run check`: 21 passing tests covering source conflicts, permit exclusions, future/partial closures, incomplete policy, GIS identity matching, missing geometry, campus timezone/DST, manual sessions, and original session/report behavior.
- Actual Cal Poly GIS endpoints returned public GeoJSON with `Access-Control-Allow-Origin: *`; the official map configuration identifies both services.
- A National Map aerial tile at Cal Poly returned HTTP 200 with JPEG imagery. Local app and module requests returned HTTP 200.
- A JSDOM integration smoke check passed using the actual Leaflet library and fetched campus GIS responses: nine markers/eight outlines, permit and duration updates, selecting details, manual reminder save/restore/end, Google configuration dialog, the original demo session, and the empty street-data state. This checks DOM behavior, not visual rendering in a browser.
- Full visual browser QA was unavailable because the connected Browser control tool was not exposed in this session. The laptop's existing preview server is serving the updated page at http://localhost:5173.
- A Google browser/demo key is still required to verify Google-hosted rendering and authentication. Do not describe the fallback as Google imagery.

## Remaining data and integration work

- Connect an appropriate Google browser/demo key for the shared judge deployment; the current connection form is per browser.
- Field/source review of complete permit rules, exact stalls/subareas, current temporary restrictions, real entrances, costs, and walking routes. Existing research records do not establish a complete current eligibility policy.
- Source-backed curb segments for street parking, including the correct side and signs. None is currently represented as available parking.
- Real occupancy, shared reports, live AI, payments, automatic detection, and background/native notification delivery remain unconnected.

Do not attach the walkthrough's sample prices, walking times, closures, or rules to these real campus IDs. Continue using the existing Site project and public URL; GitHub pushes alone do not publish the demo.
