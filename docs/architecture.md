# Browser demo architecture

## Implemented scope

`demo/` is a standalone ES-module browser app with locally vendored MapLibre GL JS and a Leaflet fallback; no npm runtime installation is needed. The repository root remains free for a teammate's chosen framework. The Node server exposes only the app on loopback, not the repository or a data API. The geographic client queries Cal Poly's and the City's public GIS directly.

| File | Responsibility |
| --- | --- |
| `demo/src/data.js` | Explicitly simulated parking areas, destinations, permits, and report fixtures |
| `demo/src/rules.js` | Eligibility, active reports, walking adjustments, earliest deadlines, sessions, and reminder phases |
| `demo/src/map.js` | Separate walkthrough's original SVG map, selected markers, and illustrative routes |
| `demo/src/map-model.js` | Real campus IDs, GIS queries, source identity checks, and campus-time conversion |
| `demo/src/campus-permit-policy.js` | Scoped researched permit schedules, trip-wide enforcement checks, and published commuter-product distinctions; separate from occupancy/full policy |
| `demo/src/geographic-map.js` | Google, MapLibre, and non-WebGL Leaflet adapters; retained geographic map |
| `demo/src/street-model.js` | Stable City segment IDs, source identity checks, and separate illustrative chance fixtures |
| `demo/src/map-style.js` | Original satellite/dark/standard/terrain styling and parking overlay layers |
| `demo/src/discovery.js` | Geographic parking search, details, provider connection, and manual reminders |
| `demo/src/app.js` | Minimal geographic shell integration, walkthrough tabs, persistence, dialogs, and reminder clock |
| `demo/src/styles.css` | Responsive light/dark design system |
| `demo/server.mjs` | Built-in Node HTTP server restricted to app assets |
| `demo/tests/rules.test.mjs` | Deadline, eligibility, report expiry, and restored-session checks |

## Shared session contract

```js
{
  id, areaId, destinationId,
  startedAt,           // epoch milliseconds
  deadlineAt,          // epoch milliseconds; earliest applicable deadline
  deadlineReason,
  walkMinutes, bufferMinutes, note,
  demo                // true for accelerated presentation timing
}
```

Use `createSession`, `calculateDeadline`, `headBackAt`, and `sessionPhase` from `rules.js`. Remaining time is `deadlineAt - Date.now()`; refresh cannot grant more time. Expired sessions remain visible until explicitly ended.

Active walkway reports add return time. Entrance closures exclude recommendations and warn parked drivers without ending their sessions. Observations remain unverified and do not establish official rules.

The browser key is `campuscurb.demo.v1`. Reports and notes are not sent to a service or shared between devices. Sessions are validated on restoration; a second browser tab receives storage updates.

Saved payloads are parsed with `parseSavedState`; `normalizeReports` rejects malformed records, deduplicates report IDs, and retains local unverified provenance. Storage events synchronize session, reports and saved preferences across tabs. The clock refreshes views when active reports expire, and preserves focused drafts during those refreshes. Native background delivery is still not connected.

## Integration seams

The `codex/satellite-parking-map` branch adds `map-model.js` (source-backed research identities and runtime GIS queries), `geographic-map.js` (Google/USGS adapters), and `discovery.js` / `discovery.css` (geographic Explore and manual reminder UI). `runtime-config.js` contains blank public map configuration. Read `docs/maps.md` for provider setup and data confidence. Real `cal-poly-slo-*` IDs are separate from walkthrough fixtures; manual reminders carry `manual: true` and require the driver's deadline and walk estimate.

- Replace `data.js` with verified records while retaining stable area IDs.
- Import the pure `rules.js` helpers into another app without the DOM UI.
- Replace `answerQuestion` in `app.js` with a configured service; currently it is explicitly a rule-based guide.
- Replace `campusMap` with a real maps adapter. The current original SVG is illustrative, not geographic navigation data.
- Connect tested background/native reminders separately. The current browser demo provides in-app feedback only.

Production authentication, a shared database, automatic detection, payments, and live occupancy are outside this branch.

## Map-first redesign

The geographic UI has no persistent sidebar, header, tab bar, filters, or result list on launch. `discovery.shell()` renders the full map, search dock, compact chance legend, and layers/location controls. Search, selected-place details, and saved reminders open on demand. On phones the actual map viewport ends above the measured sheet, keeping map attribution visible. The same map host survives state changes; this preserves the camera and avoids reloading Google on every search.

Street geometry is fetched by exact City OBJECTID and FULLNAME. The renderer draws paired approximate bands beside centerlines in MapLibre; Google and the non-WebGL fallback use street line strokes. No source geometry is committed. The 42 City IDs are stable `slo-street-*` identities and are accepted by the same absolute-deadline manual reminder flow as campus locations.

`parkingDisplay()` is a presentation layer, separate from `evaluateParking()`. Explicit fixtures supply green/yellow/red demo colors; known ineligibility/closure overrides them with a red restriction symbol. Disabling the preview returns unknown availability. A demo color never grants parking permission or modifies the evaluator/session contract.
