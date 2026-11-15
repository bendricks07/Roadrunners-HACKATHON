# Geographic Explore implementation

## Latest update: trip entry and map highlights

November 14, 2026 local time: trip date/time is now a map entry directly below search; permit selection remains in Layers > Permits & preferences. Arrival and departure apply together after validation in Los Angeles time. Yellow/red cards explain demo chance colors; known permit conflicts and closures show the actual evaluator reason with a red lock. Low chance never claims confirmed full parking.

MapLibre base-style replacement now disables style diffing so `style.load` restores the current parking source/layers. Rendered switches across Satellite, Dark, Standard, Terrain and back preserved highlights and a selected Abbott segment. Abbott St adds official City IDs 2173 and 2333, bringing the street total to 42 segments on ten roads. Parking rules remain unverified.

All 37 Node tests and source syntax checks passed, including new date/DST, reason, Abbott identity, and overlay restoration regressions. Desktop and phone evidence is in [trip/map verification](../../artifacts/trip-map-fixes/README.md). The style-switch loss and expanded-search compression listed in the earlier review below are addressed in this update.

GitHub source is being merged to `main` for this request. Public Site version 5 is unchanged: the current connection's source-write credential request returned `Sites project not found`. Its owner/editor needs to publish the merged app to the existing project; see [deployment instructions](../deployment.md).

## Earlier publication and research status

Redesign, free-data research, detector pilot, and all design/research deliverables are published to GitHub `main`, including commit `1b8fe13`. The research branch `codex/free-parking-research` is also published. Feature branch `codex/map-first-redesign` is fully merged and deleted. App source remains `fd63c2a`. November 14, 2026 local time.

Public URL remains https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site . Published version 5 uses Site source `d9675b3`; full provenance and GitHub sync status are recorded in `docs/deployment.md`. No shared Google browser/demo key has been supplied.

## Implemented

- The approved satellite/dark concepts now drive a full-screen map UI. Launch shows only search, layers/location controls, a compact estimate legend, and required attribution. No persistent sidebar, header, results, filter form, or tab bar.
- A compact selected-place card includes street/lot/garage type, explicit demo estimate, sign/permit caution, Google Maps directions to the mapped area, detailed rules, and saved-car reminders. Exact driving entrances remain unverified.
- Search groups nearby street names and campus parking, with parking-type filters and trip/permit settings behind an explicit action. Keyboard search/Enter/Escape and map selection retain the same map instance.
- Satellite uses 2022 USDA NAIP imagery from CDFW at 0.6 m native resolution, replacing the coarse USGS imagery cache. Dark/Standard use original restrained MapLibre styles over OpenFreeMap vector tiles. Terrain remains USGS. All providers retain their real credits.
- Google Maps is preferred when a browser key is connected, with satellite, dark road map, standard, and terrain views. The connection form remains per browser; no key is committed or a live Google SDK result claimed.
- 40 real source segments on Fredericks St, Loomis St, Slack St, Murray Ave, Grand Ave, California Blvd, Foothill Blvd, Hathway Ave, and College Ave are queried directly from the City. Exact source IDs AND names must match. These are centerlines, not surveyed curbs or verified street-parking permissions.
- Eight Cal Poly GIS lot/structure outlines plus closed K1's source point remain separate from street geometry. Original G2/131 permit exclusions, H14 subareas, and closure rules are preserved.
- Red/yellow/green chance colors are explicitly illustrative demo fixtures. They are independent of eligibility and switchable in Layers. Known ineligibility uses a neutral restriction symbol and cannot become an available recommendation. Actual occupancy remains unknown.
- Manual reminders for campus or street source IDs require the driver's future deadline, own walk estimate, buffer, note, and acknowledgement. Deadlines persist as absolute timestamps. The original fictional 90-second walkthrough remains available in Layers.

## Validation

- `npm --prefix demo run check`: 32 passing tests. Six new tests cover independent chance fixtures, restrictions overriding fixtures, exact street source identity/type, line geometry, street-session restoration, and invalid City responses. Existing Verity/rule checks remain passing.
- Full MapLibre base styles AND parking overlay layers validated against the upstream style-spec validator for all four views.
- JSDOM integration with the actual vendored Leaflet fallback and fetched official source responses passed: nine campus pins, eight outlines, 40 street segments, minimal home, retained map DOM, street search/selection/directions, manual save/restore/end, dark appearance, chance toggle, G2 commuter/time exclusions, Google setup form, and original walkthrough.
- City runtime query returned HTTP 200 with all 40 source features. CDFW sample returned HTTP 200/JPEG with working CORS; the official California catalog documents 2022/0.6 m/public-use attribution terms.
- Returning visitors open the new map even when the old walkthrough preference was saved; an old fictional session remains preserved and reachable through the walkthrough.
- A subsequent rendered review tested the local app at 1280×900 and 390×844 and checked the public app. It reproduced disappearing parking overlays after a style switch and a compressed expanded search field, plus phone framing/touch-target concerns. See the [review and screenshots](../../artifacts/campuscurb-design-test-review.md). These defects remain open; automated checks do not cover them. Google rendering/authentication still requires an appropriate key.

## Remaining data and integration work

Free-source research on `codex/free-parking-research` adds a separate [feasibility study](../research/free-parking-data-feasibility.md), [working research prototype](../../tools/parking-research/README.md), and [G2 vehicle detector pilot](../research/g2-vehicle-detector-pilot.md). The tested NAIP archive supplies seven acquisition dates across 2012–2024 over the selected SLO area; clock times are unverified. A pinned MIT-declared quantized Mask R-CNN ran locally: a 512px baseline found no candidates, and exploratory 36m tiling matched 7 of 18 provisional assistant labels in two County 2014 windows. The two 2022 windows had no candidates and are unscored. Labels need independent human verification; counts are not whole-lot occupancy. All 28 research tests and 32 app checks pass. No live occupancy, new eligibility policy, forecast, or browser UI change is claimed.

- Connect a suitable Google key for the shared judge deployment; current UI connection is per browser only.
- Fix the rendered style-switch overlay loss and expanded-search compression documented in the [app review](../../artifacts/campuscurb-design-test-review.md), then verify phone framing and touch areas.
- Replace the explicit chance fixtures with a validated forecast or actual feed, including freshness/confidence metadata.
- Verify exact block faces, current signs, permits, curb markings, temporary restrictions, stalls/subareas, entrances, costs, and walking routes. City centerlines provide no parking permission or occupancy fields. Do not infer permission from imagery.
- City permit district layer 31 mixes residential districts and timed zones; its redistribution restrictions mean no district snapshot is committed. Current street permissions remain unconfirmed.
- Shared reports, live AI, payments, automatic detection, and background/native notification delivery remain unconnected.

Keep the existing Site project and public URL. GitHub pushes alone do not publish the demo.
