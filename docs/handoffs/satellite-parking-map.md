> **Current implementation:** The satellite/dark redesign is published as version 5. Read [current map status](../status/discovery.md) and [deployment/GitHub sync status](../deployment.md) first. The historical handoff below predates the new minimal shell and illustrative chance layer.

# Next task: satellite / terrain parking map

Prepared November 14, 2026 for the teammate and GPT implementing the next CampusCurb interface. The first geographic implementation has since been built and published; this document now directs follow-up work.

## Start here

**Implementation available on `main`.** Read [the current implementation status](../status/discovery.md) and [map setup](../maps.md) before coding. The geographic UI, campus GIS overlays, and manual reminders exist; complete policy verification, street data, occupancy, and a shared Google Maps key remain unfinished. Do not rebuild the first milestone from the old demo branch.

**Build on the working demo, using a real geographic map as the main Explore interface.** Preserve the polished Apple-style design and the existing parking-session flow.

The user's requested direction is satellite/terrain imagery with red, yellow, and green parking highlights; symbols identifying surface lots, garages, street parking, and parking categories; and information gathered from websites and appropriately licensed imagery.

Actual space availability is part of the vision. There is currently no connected live occupancy source. For the first milestone, label colors as **parking eligibility for your permit and planned stay**, with availability shown separately as **Unknown**. Do not label a green area "spaces available". A future availability mode needs its own reliable source, timestamps, and explicit legend.

## Repository and branch instructions

| Location | Current purpose |
| --- | --- |
| `main` | Integrated working app in `demo/`, product plan, research, and handoff |
| `codex/campuscurb-demo` | Earlier walkthrough branch; its changes are included in `main` |
| `data/research/cal-poly-slo-parking-seed.json` | Research inventory, not executable parking policy or verified geometry |
| `docs/research/cal-poly-slo-parking-2026-11-14.md` | Sources, conflicts, and known limitations |

Fetch current work and create a short feature branch from the working demo. Preserve any existing local changes; reuse an appropriate existing feature branch if work has already started.

```bash
git fetch origin
git switch -c codex/parking-map-next origin/main
```

Start new work from the latest `main`. The original demo-branch starting point was for the first implementation only. Preserve teammates’ local edits and check current branch status before integrating.

Read the working branch's `AGENTS.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/status/demo.md`, and `docs/deployment.md` before changing behavior. Check for newer teammate work before assuming these branch descriptions still hold.

## First milestone and task order

1. **Real basemap.** Replace the illustrative map through a small map adapter. Start with satellite imagery centered on Cal Poly SLO. Add a terrain/topographic view when supported by the selected provider; a plain street map must not be mislabeled terrain. Keep selection and overlays when switching views.
2. **Small, reviewed parking dataset.** Aim for three to five correctly located campus areas, with source-backed geometry and explicit rule confidence. H1, Grand Avenue Structure, G2, and H14 are research candidates, not pre-approved recommendations. If boundaries or rules cannot be verified, keep them unknown and record the gap. Do not invent data to reach a quota.
3. **Parking layers and details.** Render lot polygons, garage symbols/footprints, and supported curb segments. Selecting a shape or list result opens the same details. Add street segments only when the exact block face and rules are supported.
4. **Shared evaluation.** Permit and arrival/departure changes update map colors and details through the shared rules evaluator. Keep eligibility, observation confidence, and occupancy separate.
5. **Integration and handoff.** Preserve sessions, reminders, reports, and the other tabs. Run the existing checks, verify the phone layout, then push the feature branch and document what works and what remains blocked.

Automated parking detection from imagery, citywide coverage, computer vision, new authentication, payment processing, and occupancy prediction are later tasks. Do not hold up the first working map for them.

## Interface requirements

- The map is the main canvas. Use a compact floating destination search and permit/stay controls; avoid burying the map beneath a dashboard.
- Preserve system typography, restrained neutral surfaces, blue primary actions, light/dark appearance, and readable spacing. Keep the existing app identity.
- On a phone, open parking details in a bottom sheet. On desktop, use a side panel. Show location/type, whole-stay eligibility and reason, known cost/payment conditions, next restriction, occupancy status, sources, and last checked date.
- Keep a visible legend. Use status text and symbols as well as color. Selected shapes need a distinct outline. Keep labels readable against imagery and provider attribution visible.
- Distinguish a vehicle entrance from a lot centroid. Enable navigation only to a supported entrance/destination, with uncertainty stated. Do not fabricate walking times, routes, or garage levels.

### Overlay and symbol mapping

| Parking feature | Map representation |
| --- | --- |
| Surface lot | Translucent boundary fill, clear outline, parking symbol |
| Garage / structure | Supported footprint or location symbol, garage icon, separate subareas where rules differ |
| Street parking | Line along the verified curb/block face; do not color the entire road as available parking |
| Paid / metered | Payment badge, separate from the physical parking type |
| Permit-only | Permit badge with the applicable permit name |
| Accessible / EV / other restricted stalls | Distinct symbols and requirements; do not apply one stall's permission to an entire lot |

### First-milestone color meanings

These are implementation defaults for the first milestone, not claims that live availability has been solved.

| Color | Meaning for the selected permit and entire planned stay |
| --- | --- |
| Green | Known rules fit the driver's context; no unresolved eligibility conditions |
| Yellow | Known conditional option, such as a required payment; display the exact remaining action |
| Red | A known restriction, closure, permit mismatch, or duration limit rules the option out |
| Gray | Required rules, location/subarea, or source confirmation are missing or conflicting |

Missing information is gray, not yellow or green. A known closure remains a restriction even when another source is incomplete. Occupancy stays **Unknown** unless there is a separately identified feed or recent report. Any estimates or community observations must have their own labels, times, and expiry behavior.

## Data and research requirements

Use official campus parking pages, current campus maps, municipal GIS, and posted/verified restrictions to determine legal categories and permission. Imagery can help identify physical candidates and, where licensed, boundaries; it cannot establish public access, current vacancies, or garage interior occupancy.

The existing seed explicitly says `research_inventory_not_executable_policy` and `production_ready: false`. Entrance coordinates, boundary geometry, walking times, and availability are unset. Preserve those unknowns until supported; do not turn the ten records into ten green recommendations.

At minimum, keep these concepts in separate records/fields:

| Concept | Required information |
| --- | --- |
| Identity | Stable area ID, name, jurisdiction, physical type, parent/subarea relationship |
| Geometry | GeoJSON with longitude/latitude order, geometry source, review status/date; street side and endpoints where relevant |
| Rules | Applicable permits, time windows/timezone, maximum stay, payment conditions, temporary restrictions, source references |
| Evaluation | Allowed / conditional / denied / unknown, reason, and evaluated trip context; compute this rather than storing a permanent green status |
| Occupancy | Unknown by default; otherwise source, observed time, expiry, and measured/reported/estimated classification |
| Provenance | Source URL/record ID, checked date, unresolved conflicts, and confidence, separately for geometry and rules |

A missing/unreviewed boundary must not become a guessed real-world polygon. A separately verified point may appear as a point, with boundary uncertainty stated. A district polygon is not a set of verified parking spaces. Do not display a production "verified" badge based only on a downloaded page.

Preserve known research conflicts: Grand Avenue Structure and Structure 131 are different records; H14 needs subareas; G2 has a published two-hour limit with exceptions requiring review; closed K1 must not be revived from an older listing; partial closures must not close an entire neighborhood or lot. See the research handoff for sources and dates, and recheck before relying on them.

## Provider and imagery approach

**User-selected provider: Google Maps JavaScript API**, using satellite/hybrid and terrain views with independent GeoJSON overlays. It is implemented behind the map adapter. A Google browser/demo key is still needed; the explicit USDA/USGS fallback keeps the prototype usable until connected. See [map configuration](../maps.md) for Google’s no-billing demo-key option and shared deployment setup. Keep provider code separate from parking IDs and rules.

- Confirm current SDK compatibility, access, attribution, and usage costs. Document the selected provider and configuration. Use a provider-approved, domain-restricted public browser token where required; keep secret credentials out of browser code and git.
- The existing demo is static and has no bundler. Do not assume server environment variables automatically exist in browser JavaScript. Document how public configuration reaches both local and hosted builds. Include only blank/example configuration in git.
- Handle missing credentials, tile errors, and unavailable WebGL with an honest map-unavailable message and a usable parking list/session view. Keep the existing illustrative demo clearly identified if it remains selectable.
- Basemap display permission does not automatically allow extracting training data, tracing inventory, or running image analysis. In particular, do not scrape or trace Google Maps satellite content into our parking dataset. Use a separately authorized GIS/imagery source for any derived inventory.
- NAIP is a possible aerial-imagery research source for a later analysis experiment; check the specific asset, capture date, terms, and access method. Neither NAIP nor a commercial basemap is a live parking camera.

Official references checked for this handoff:

- [Google Maps demo-key setup](https://developers.google.com/maps/documentation/javascript/demo-key)
- [Google map types](https://developers.google.com/maps/documentation/javascript/maptypes)
- [Mapbox Standard / Standard Satellite and custom layer slots](https://docs.mapbox.com/map-styles/guides/standard-styles/)
- [Mapbox Satellite imagery, update timing, and attribution](https://docs.mapbox.com/data/tilesets/reference/mapbox-satellite/)
- [Google Maps Platform terms, including section 3.2.3 restrictions on derived content](https://cloud.google.com/maps-platform/terms)
- [NAIP dataset description and terms](https://developers.google.com/earth-engine/datasets/catalog/USDA_NAIP_DOQQ)
- [Existing campus and City source register](../research/cal-poly-slo-parking-2026-11-14.md#source-register)

## Existing app integration

`demo/src/map.js` draws the separate fictional walkthrough; `geographic-map.js` provides the geographic map. The `north`, `west`, and `grand` demo fixtures are simulated; do not attach their fictional rules, prices, or coordinates to real Cal Poly locations. Keep a clearly separated demo mode or migrate records explicitly, with stable IDs and validation of saved sessions.

Reuse `demo/src/rules.js` for shared decisions. If its current fixture-oriented evaluator cannot express verified rules, extend it with explicit unknown outcomes and meaningful tests; do not hardcode a separate set of colors inside the renderer. Keep absolute session deadlines and the return-walk buffer. Missing walking data must not silently become zero minutes or an invented estimate. Existing accelerated sessions and fictional reports must remain visibly simulated.

## Definition of done

- [ ] Real imagery loads; map attribution and credential/error states work.
- [ ] Source-backed parking geometry stays aligned when panning, zooming, and changing supported basemaps. Unsupported geometry is omitted or explicitly identified.
- [ ] Lot, garage, and supported street features have distinct symbols and selectable details. Selection agrees between map, list, and detail panel.
- [ ] Permit/stay changes update eligibility consistently. Missing evidence stays gray; no vacancy counts or implied live availability are invented.
- [ ] An upcoming restriction overlapping the stay is considered. Partial/subarea restrictions affect only their supported geometry.
- [ ] A real parking record cannot inherit fictional rules, walking times, or reports from the old demo.
- [ ] Existing session start/restore/end, deadlines, head-back calculations, and other tabs still work. Real-data sessions with incomplete required information have an explicit limitation rather than a fabricated deadline.
- [ ] Phone touch targets, bottom sheet, contrast, keyboard access, light/dark appearance, and map/list fallback are checked.
- [ ] Run `npm --prefix demo run check` from the working app branch. Add focused checks for new evaluation/data behavior; do not count a screenshot as rules validation.
- [ ] Update `docs/status/discovery.md` (create if absent), relevant architecture/configuration notes, and a short source/data-gap list. Record actual checks, screenshots, and remaining limitations.
- [ ] Push the feature branch and provide a reviewable diff/PR. Coordinate shared-file changes with the teammate maintaining sessions or rules.

The current public judge demo is https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site/. GitHub pushes do not auto-deploy it. Follow the working branch's deployment handoff when the integrated feature is ready; the integrated publication is recorded in `docs/deployment.md`.

## Prompt to give the implementing GPT

> Read the satellite parking map handoff on `origin/main` at `docs/handoffs/satellite-parking-map.md`, then read the working demo's repository guidance and architecture. Read `docs/status/discovery.md` and `docs/maps.md`; the first geographic milestone already exists. Start a follow-up feature branch from the latest `origin/main` and work on the remaining provider/data gaps rather than recreating the interface. Keep the Apple-style UI and existing session flow. Start with real satellite imagery, a small source-backed parking overlay dataset, type symbols, and permit/stay eligibility colors with unknown occupancy clearly labeled. Preserve unsupported data as unknown. Push your branch and leave a clear status handoff with validation and blockers.
