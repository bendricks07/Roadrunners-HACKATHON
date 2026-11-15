# CampusCurb browser demo handoff

## Verity follow-up

The `Verity` changes, now integrated on `main`, add keyboard-accessible search/map controls, focused dialog transitions, clearer unsupported guide answers, resilient saved-report restoration, report-expiry refreshes, draft preservation during timers, and preference synchronization between tabs. See [the run report](../verity/Verity.md) for observed coverage, regression checks, screenshots, and limitations. The original branch publication did not update the judge Site; see current `docs/deployment.md` for subsequent integrated publications.

Branch: `codex/campuscurb-demo`

## Completed

- Polished responsive app shell, light/dark appearance, four-tab navigation.
- Destination search, permit/stay filters, ranked sample parking cards, eligibility states, saved options, details, and route previews.
- Parking confirmation, persistent car-location notes, absolute-time countdown, deadline calculation, head-back time, and explicit session ending.
- Accelerated 90-second presentation session and simulated reminder preview.
- Rule-based guide using shared sample rules and the current session.
- Local report submission, expiry/resolution, and a walkway-closure demonstration that updates head-back time.
- No package dependencies or service credentials.
- Unit coverage of unknown eligibility, time-limit boundaries, active/expired closures, earliest deadlines, walking buffers, persisted sessions, and corrupt saved state.
- Destination-first parking planning: users can type destinations such as Kennedy Library, Engineering buildings, or residence halls; choose a ranking preference; toggle student permit products; and review blue-highlighted candidate areas. These highlights only suppress known conflicts and remain explicitly subject to sign, space-type, and official-policy checks.

## Run

```bash
npm --prefix demo start
```

Open http://localhost:5173. Check with `npm --prefix demo run check`.

## Presentation path

1. Explore Kennedy Library with a commuter permit and 90-minute stay.
2. Select North Parking, preview the route, and choose **I parked here**.
3. Add a car-location note and start the session; show its deadline and head-back time.
4. Open Updates, simulate the walkway closure, then show the earlier head-back time in My Parking.
5. Ask when to head back; the guide uses the same session.
6. Run the 90-second session for an automatic in-app reminder, or preview one immediately.
7. End the session and optionally show dark appearance.

## Handoff

- Integrated the team's sourced research handoff from main (`387a752`). Its JSON explicitly identifies itself as a research inventory, not executable parking policy. Entrances and walking times are unset; keep those records separate from fictional demo fixtures until the team validates them.
- The complete prototype is isolated under `demo/`; keep a separate production/native app outside it.
- Pure session/rules helpers can be reused. See `docs/architecture.md` for the record contract.
- A maps link opens the actual campus destination; on-screen parking locations and routes are illustrative.
- Live AI, occupancy, official eligibility verification, payments, detection, shared reports, and background notifications are not connected.
- Person A/B/C roles in the product plan remain proposed. This branch does not assign another teammate's subsystem.
