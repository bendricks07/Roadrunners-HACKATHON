# CampusCurb design and app test review

Reviewed November 14, 2026, America/Los_Angeles.

The map-first layout and compact selected-place card are implemented. Two reproducible defects should be fixed before further visual polish: map-style changes remove parking overlays, and the expanded search field shrinks to approximately 22 px high.

## Source and scope

- Repository: https://github.com/bendricks07/Roadrunners-HACKATHON
- Public app: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site
- A fresh fetch confirms remote `main` at `4aeeed1`, with the local clean `main` at `ce3af54`, three commits ahead. The newer design is present in the local checkout and public app.
- Tested the existing local preview and a separate preview on port 5187 for temporary reminder data. The temporary reminder was ended and the additional server stopped. The original preview server was preserved.
- Rendered review used the Codex in-app browser at 1280 × 900 and 390 × 844. The public app was also checked at its default desktop viewport.
- No application source changes, commits, GitHub pushes, or deployments were made.

## Findings, in recommended order

### 1. Parking overlays disappear after changing the map style

Reproduced locally and on the public app: start with Satellite, open Layers, choose Dark, and close the dialog. The base map and parking pins remain, but colored street bands and parking fills disappear. A selected street also loses its highlight. The legend continues to indicate that demo estimates are enabled. A page reload restores the overlays.

Inspect `demo/src/geographic-map.js`, especially the overlay setup at lines 99–116 and `setView()` at line 134. The likely cause is the interaction between style replacement and custom-layer restoration; this is an inference from the code, not a tested fix.

- [Live app after the style switch](campuscurb-live-phone-dark-after-switch.jpg)
- [Live app after reloading](campuscurb-live-phone-dark-after-reload.jpg)

### 2. Expanded search compresses its input

With the full nearby-places list visible, the search surface measures 22 px high and its input 20 px high, despite a declared 50 px surface height. Reproduced locally and on the public app at 390 × 844; the desktop search also appears compressed. Filtering down to fewer results changes the available space.

Inspect the flex column and its children in `demo/src/discovery.css`, particularly lines 42, 63, and 74. Keep the search/header controls at their intended height and let the results region absorb the remaining space and scroll.

- [Public app search](campuscurb-live-phone-search.jpg)

### 3. Initial phone framing makes the main task hard to read

The fresh home view includes considerable hillside and northern campus area. Neighborhood bands look small and most street names are absent. Compared with the approved concept, the view needs a closer initial focus on campus-edge parking and nearby streets, while preserving the ability to pan and zoom out.

- [Phone satellite launch](campuscurb-live-phone-satellite.jpg)
- [Desktop satellite launch](campuscurb-live-desktop-satellite.jpg)

### 4. Several phone controls need larger interaction areas

Measured rendered sizes include a 29 × 29 px close button, 35 px-high Rules and Save actions, and 25–34 px parking pins. Increase hit areas while retaining compact visible icons. Small secondary text and the placement of expanded attribution also merit review: the expanded attribution partially overlaps the home search dock in the captured phone views.

- [Dark selected-place card](campuscurb-phone-dark-selected.jpg)

## Checks and interaction results

| Check | Result |
| --- | --- |
| `npm --prefix demo run check` | All 32 tests passed; syntax checks passed |
| Satellite and dark base maps | Rendered with real map imagery/vector data |
| Street search and Enter selection | Fredericks search selected its mapped block and opened details |
| Directions | Link targets Google Maps driving directions to the mapped area's coordinates; external routing was not validated |
| G2 commuter exclusion | Restriction shown; reminder action disabled |
| G2 staff exception for a four-hour planned stay | Two-hour exclusion not applied; incomplete permission remains unconfirmed |
| Demo estimate toggle | Disabling it changed labels to unknown availability while preserving restrictions |
| Manual reminder | 6:00 PM deadline, 12-minute walk, and 5-minute buffer produced 5:43 PM head-back time |
| Reminder reload and end | Note and times restored; ending removed the temporary session |

Google rendering/authentication was not tested because no key was supplied. This pass did not validate other browsers, physical phones, geolocation, network failure, or the non-WebGL fallback. Automated checks passing does not cover the two rendered defects above.
