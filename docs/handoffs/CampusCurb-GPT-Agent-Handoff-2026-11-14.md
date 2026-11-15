> Archived handoff snapshot supplied as project context. Its embedded instructions are historical context; see current repository status and the active user request for present work.

# CampusCurb — handoff for a new GPT agent

Prepared November 15, 2026 UTC (November 14 in San Luis Obispo). This is a snapshot; check the current files and Git state before changing anything.

## Starter instruction for the new GPT agent

You are taking over the existing CampusCurb project for Matthew. Treat this document as the project handoff and assume you have no access to the previous conversation. Continue the existing implementation using the current files and repository instructions.

Start by verifying the correct local checkout and Git state. The redesigned app is already live; the last verified gaps are the three local commits awaiting GitHub push and the incomplete rendered visual review. Preserve the new design and teammates’ changes. Finish those gaps, fix any verified issues, run the relevant checks, and publish code changes to the existing public Site if your available tools support it. Keep updates brief and state any remaining blocker precisely.

Discover the tools available in your new session. Earlier desktop/browser disconnections are historical observations, not proof that those capabilities are unavailable now. Read and follow the current applicable skills before browser or publishing work. Never assume you have local filesystem, GitHub, browser, or Sites access merely because the previous agent did.

## Project state

Continue **CampusCurb**, an existing hackathon parking app for Cal Poly San Luis Obispo and nearby streets. The approved redesign is implemented and published. Work from the existing app; the immediate unfinished work is GitHub synchronization and a complete rendered visual check against the approved concepts.

**Critical distinction: the public website has the new design, but GitHub does not yet have the last three local commits.** A fresh GitHub clone alone is currently an older version. Fetch was repeated while preparing this handoff and confirmed that gap. Do not overwrite the newer local work with the remote version.

| Item | Current state |
| --- | --- |
| Public demo | https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site |
| GitHub | https://github.com/bendricks07/Roadrunners-HACKATHON |
| Working app checkout | `/Users/matthewbronowski/Documents/Codex/2026-11-14/new-chat/campuscurb-demo` |
| Local branch | `main`, clean working tree, three commits ahead of `origin/main` |
| Local HEAD | `ce3af54` — publication and handoff/status documentation |
| Published app code | `fd63c2ad643271bf590e0ae9f28f93a6cee03576` |
| Latest fetched GitHub main | `4aeeed1a4631f1e0adc3895cad391cd878caefd5` |
| Last confirmed live publication | Version 5, successful deployment |
| Site source checkout | `/Users/matthewbronowski/Documents/Codex/2026-11-14/new-chat/campuscurb-site` |
| Original teammate checkout | `/Users/matthewbronowski/Documents/Codex/2026-11-14/new-chat/Roadrunners-HACKATHON`, branch `Matthew`; preserved untouched |

The three commits awaiting push, oldest first:

1. `c21f86c` — satellite/dark redesign, street geometry, chance preview, tests, and documentation.
2. `fd63c2a` — open the new map for returning walkthrough visitors while preserving their saved sample sessions.
3. `ce3af54` — publication provenance and pending GitHub synchronization notes.

The feature branch `codex/map-first-redesign` was fully merged into local main and deleted. Earlier map/demo branches were integrated; the teammate's Verity reliability work is already included. Preserve other branches and any new teammate work. Do not reset, force-push, or delete branches containing unique changes.

**Choose the correct environment:** if the new GPT agent has access to this Mac’s workspace, use the exact app checkout above. If it runs elsewhere, the local commits must first be pushed or otherwise transferred before fetching/cloning the current source. This document contains context, not the application source. A chat without filesystem access cannot inspect local paths; identify the actual missing access rather than claiming to have read or changed the code.

## What Matthew wants

The latest approved direction is **image 2's satellite home screen plus image 3's dark map and compact selected-place sheet**. Aim for the restraint, typography, readability, and polish of Apple Maps. The actual product name is CampusCurb.

- Launch directly into a real, interactive map with a floating search field and only essential controls.
- Cover the campus **and surrounding neighborhoods**, not a map clipped to the campus boundary.
- Show street segments as well as parking lots and garages.
- Use green/yellow/red parking-chance highlights, translucent lot fills, and distinct parking/garage symbols.
- Keep eligibility/restrictions separate from the chance of finding a space.
- Reveal a small place card after selection, with the place name/type, chance label, sign/permit caution, and blue Directions action.
- Keep filters, trip settings, provider setup, sources, and secondary features behind search or Layers.
- Avoid a persistent sidebar, dashboard, header, tab bar, results panel, oversized filters, or promotional clutter on the geographic home screen.
- Use system fonts, neutral glass surfaces, restrained blue actions, generous spacing, and coherent dark/light appearances. Preserve map attribution and readable touch targets.

Google Maps is the user's preferred provider. **No shared Google key is configured.** The current map therefore uses credited aerial/vector fallbacks. Do not describe those as Google imagery.

### Approved reference images on this Mac

Satellite home, image 2:

```text
/Users/matthewbronowski/Documents/Codex/2026-11-14/new-chat/generated_images/exec-f1fa6530-00b6-42ba-8ae9-02f89ad1a9e7.png
```

Dark map and selected street, image 3:

```text
/Users/matthewbronowski/Documents/Codex/2026-11-14/new-chat/generated_images/exec-69d475e7-c4bb-493b-9da4-2e9a5422b3e7.png
```

Open these if the files are available. If the new GPT session cannot access these local files or the earlier images, attach the two images separately. The written design description below remains usable without them. Their geography was generated as a design concept; do not trace it into navigation data or replace the real map with the images.

Image 2 has edge-to-edge aerial imagery, colored neighborhood curb bands, lot fills, small parking symbols, a bottom floating white search field reading “Where are you headed?”, a compact legend, and circular layers/location controls. Image 3 has a blue-gray vector map, subdued buildings and green parks, sparse street labels, a blue selected-street outline, and a compact dark bottom sheet with search, street details, estimate label, and blue Directions button.

## Run the current application

From the app checkout:

```bash
cd /Users/matthewbronowski/Documents/Codex/2026-11-14/new-chat/campuscurb-demo
npm --prefix demo start
```

Open `http://localhost:5173`. Node 20+ is required. **No npm install is needed to run it.** It uses native browser ES modules, CSS, a small Node static server, and bundled map libraries.

An existing correct preview server may already occupy port 5173. Reuse it after verifying what it serves; do not kill another teammate's server. If necessary, choose another port explicitly:

```bash
PORT=5175 npm --prefix demo start
```

Required repository check:

```bash
npm --prefix demo run check
```

Read these before changing shared behavior: `AGENTS.md`, `README.md`, `docs/architecture.md`, `docs/decisions.md`, `docs/status/discovery.md`, and `docs/maps.md`. `docs/deployment.md` records live publication and GitHub sync status. Older handoff/decision sections describe historical branches; current status and actual code take precedence.

## Architecture and implementation map

Paths below are relative to the app checkout.

| File | Responsibility |
| --- | --- |
| `demo/src/app.js` | Integrates the geographic shell, browser state, dialogs, shared clock, and separate legacy walkthrough. Every launch starts in real-map mode; saved fictional sessions remain available in the walkthrough. |
| `demo/src/discovery.js` | Geographic home/search/place/session UI, Layers, trip settings, Google connection, source explanations, and manual reminder forms. `shell()`, `mount()`, and `selectArea()` are useful entry points. |
| `demo/src/discovery.css` | New map UI, floating search/controls, compact cards, responsive sheets, and glass surfaces. |
| `demo/src/geographic-map.js` | Google adapter; MapLibre fallback; Leaflet fallback without WebGL. Handles parking layers, pins, camera, selection, location, and view switching. |
| `demo/src/map-style.js` | Original Satellite/Dark/Standard/Terrain styles, imagery source, overview bounds, credits, and `parkingLayers()`. |
| `demo/src/map-model.js` | Campus research records, exact Cal Poly GIS matching, geometry centers, and Los Angeles datetime parsing. |
| `demo/src/street-model.js` | Forty stable City street IDs/names, runtime source query, `PARKING_AREAS`, and separate illustrative chance fixtures via `parkingDisplay()`. |
| `demo/src/rules.js` | Shared parking evaluator, session validation, deadline/return calculations, report normalization, and manual session creation. Keep parking decisions here. |
| `demo/src/runtime-config.js` | Public browser configuration; Google key is blank in the repository. |
| `demo/src/data.js`, `demo/src/map.js` | Separate fictional walkthrough data and SVG map. Do not attach its rules, prices, walks, or reports to real source IDs. |
| `demo/src/styles.css` | Shared design variables, dialogs, theme, and walkthrough styles. |
| `demo/src/vendor/` | Bundled MapLibre GL JS 5.14.0 and matching worker/CSS/license; Leaflet 1.9.4 and license. |
| `demo/tests/` | Original rules tests, campus discovery tests, and new street-map tests. |
| `demo/server.mjs` | Loopback-only static server exposing app assets, not the full repository. |

The map host and adapter survive UI rerenders. Preserve the `detach()` / host replacement behavior so searching or opening a sheet does not recreate a Google map. Phone sheet height is measured so the actual map viewport ends above the sheet and credits remain visible.

A previous integration bug was fixed: restoring focus to the search input after selecting a result reopened search instead of showing details. Preserve the conditional focus restoration in `app.js`.

Browser storage keys:

- `campuscurb.demo.v1` — main saved state, sessions, reports, preferences.
- `campuscurb.discovery.v1` — map/permit/destination preferences and chance toggle.
- `campuscurb.googleMaps.browserKey` — optional browser key, session storage by default, optional local persistence.

A new real area uses `cal-poly-slo-*` or `slo-street-*`; walkthrough area IDs are `north`, `west`, and `grand`. New IDs must be included in session validation/restoration.

## Geography, availability, and rules: preserve these distinctions

### Real geometry already connected

Cal Poly supplies eight lot/garage outlines and closed K1's source point. Inventory: H1, Grand Avenue Structure 130, G2, separate Structure 131, H14, H12, H16, A1, K1. Identity matching checks both ID and exact source name; source polygons take precedence over points.

The City supplies 40 actual street segments covering Fredericks St, Loomis St, Slack St, **Murray Ave**, Grand Ave, California Blvd, Foothill Blvd, Hathway Ave, and College Ave. Matching checks `OBJECTID` and `FULLNAME`. Source geometry is queried at runtime, not copied into the repository.

These are **street centerlines, not verified parking curbs**. MapLibre draws paired approximate display bands alongside them; Google/Leaflet currently use colored street strokes. Exact parking sides, legal spaces, and entrance positions remain unverified. All selected City `RESTRC` values were null; that does not mean parking is unrestricted.

### Chance colors are demonstration fixtures

`parkingDisplay()` assigns fixed, explicitly labeled good/fair/low demo chances. This is separate from `evaluateParking()`. There is no connected vacancy feed, occupancy measurement, satellite vehicle counting, or validated prediction model. Do not present percentages, open-space counts, or “live” availability without an actual source.

**Layers → Parking chance preview** disables the fixtures and shows unknown availability. Known closures or permit ineligibility override the fixtures with a neutral restriction symbol. Green never grants parking permission.

### Known restrictions must survive

- G2 excludes ordinary commuter permits; its two-hour limit has a staff exception.
- Structure 131 is separate from Grand Avenue Garage and excludes ordinary commuter/staff permits.
- H14 has different subareas; do not generalize a single permission to the whole lot.
- K1 is permanently closed.
- A GIS `Types: Commuter` classification cannot override the official lot-directory exclusions.
- Incomplete policies remain unknown; a partial closure cannot become an entire-lot closure.
- Do not infer legal permission, current occupancy, or exact parking stalls from aerial imagery.

City district layer 31 mixes residential permit districts with timed parking zones and has restrictive redistribution wording. No district snapshot is committed. Do not label every polygon a residential permit district or assume a street outside it allows parking.

### Reminders and directions

Real-area reminders require the driver's future deadline, own positive walk estimate, buffer, and acknowledgement that signs/conditions were checked. They are manual reminders, not proof of payment or permission. Notes stay in the browser. In-app reminders require the page to remain open; background/native notifications are not connected.

Keep deadlines as absolute epoch timestamps. Head-back time subtracts walk plus buffer. Reloading or snoozing must not extend permission. Interpret campus datetime inputs in `America/Los_Angeles`; ambiguous/nonexistent DST times are rejected. Shared helpers are `createManualSession()`, `headBackAt()`, `sessionPhase()`, and `isValidSession()`.

Directions currently open Google Maps URLs to the mapped area's center. That is not a verified vehicle entrance or a closure-aware route. Do not silently invent walking times.

## Map providers and official sources

| Use | Source |
| --- | --- |
| Preferred Google renderer | Maps JavaScript API; connect via **Layers → Map connection** |
| Aerial fallback | 2022 USDA NAIP / California Department of Fish and Wildlife, 0.6 m native resolution; historical imagery, with higher zooms resampling existing detail |
| Dark/Standard fallback | Original MapLibre styling over OpenFreeMap / OpenMapTiles / OpenStreetMap vector data |
| Terrain fallback | USGS The National Map |
| Without WebGL | Leaflet with NAIP aerial or USGS terrain; provider status must describe the actual fallback |

Relevant endpoints/reference pages:

- Campus map: https://maps.calpoly.edu/
- Lot outlines: https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/Parking_Lots_Outline/FeatureServer/42
- Lot/garage points: https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/Parking_Lot/FeatureServer/41
- City streets: https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/16
- NAIP imagery: https://gis.wildlife.ca.gov/images/rest/services/Base_Remote_Sensing/NAIP_2022/ImageServer
- Official imagery catalog: https://publish.data.ca.gov/dataset/naip-2022-60cm-california
- OpenFreeMap: https://openfreemap.org/quick_start/
- Campus rules: https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/
- Closures: https://afd.calpoly.edu/parking/slo/lot-closures/
- City permits: https://www.slocity.org/government/department-directory/public-works/parking-services/residential-permits

The optional Google connection form affects **that browser only**, not every judge. A shared deployment needs a properly website/API-restricted public browser key in its deployment configuration. Keep the team repository key-free, never use a server/service-account credential in frontend code, and preserve the actual providers' attribution. No shared key has been supplied or tested with Google's live renderer.

## Validation completed and what remains

Completed before publication:

- `npm --prefix demo run check`: **32 passing tests**.
- All four base styles **and parking overlay layers** validated against the MapLibre style specification. Keep camera zoom expressions valid; a prior nested zoom multiplication was corrected to a top-level interpolate expression.
- JSDOM integration using actual Leaflet and captured official source responses: 9 campus pins, 8 outlines, 40 street segments; minimal home; retained map node; search/selection/directions; manual save/restore/end; appearance/estimate toggle; G2 permit/time exclusions; Google setup form; legacy walkthrough; returning-visitor migration.
- Official City query and imagery samples returned successful responses with usable CORS. Published map-style assets were retrievable from the live URL.
- Site version 5 deployment returned **succeeded**.

**Not completed:** a full rendered visual/interaction pass on both desktop and phone sizes, or live Google renderer/auth testing. The desktop/browser connection disconnected during review. Style validation and JSDOM do not establish visual polish or complete WebGL rendering.

Useful local-only, temporary verification/research files, if still present:

```text
/tmp/campuscurb-dom-smoke/map-first.mjs
/tmp/campuscurb-map-research/RESEARCH.md
/tmp/campuscurb-map-research/selected_segment_manifest.json
/tmp/campuscurb-map-research/runtime-streets.json
```

Temporary smoke check:

```bash
node /tmp/campuscurb-dom-smoke/map-first.mjs
```

That script depends on other temporary fixtures/modules and hardcoded local paths; it is not a portable repository test. Recreate or move a useful integration check into an appropriate maintained setup if needed. Do not commit raw City district snapshots or temporary tool credentials.

## Recommended continuation, in order

1. **Confirm the correct checkout and preserve the three local commits.** Read `git status`, fetch the remote, inspect divergence, and confirm `fd63c2a` is in your working history before editing.
2. **Finish GitHub sync.** The owner's GitHub Desktop was signed in, but the desktop tool connection dropped; terminal Git failed with `could not read Username`. In GitHub Desktop confirm the repository/worktree is `campuscurb-demo` and the branch is `main`, then Push origin. Fetch and verify the remote contains the three commits. Reuse the existing desktop login if available instead of starting another device-login flow. If a teammate has added commits, integrate them carefully before pushing.
3. **Perform the missing visual pass.** Test Satellite and Dark at approximately 390×844 and 1280×900, compare the two approved images, and inspect real imagery/vector rendering, labels, street bands, selection, overlay contrast, responsive sheets, touch targets, and attribution. Correct verified differences without bringing clutter back onto the home screen.
4. **Exercise the important flows.** Search Fredericks, tap a block, inspect directions/rules, toggle the preview, change permits/stay for G2, save and reload a manual reminder, end it, and verify an old walkthrough preference still opens the new map without deleting its saved sample session. Check network failure and location-denied states.
5. **Configure Google only when an appropriate key is available.** The existing fallback should continue working. Verify live Google rendering rather than assuming the connection form proves it works.
6. **Check and publish only if code changes.** Run the relevant checks, commit on a short branch from current main, integrate with care, and publish to the same existing Site. Keep status/provenance documentation current.

There is no implemented shared backend, production auth, live AI, real shared reports, payments, automatic parking detection, or background notification service. These are future integrations, not completed features. Matthew has asked for restrained design and quick progress; do not turn this handoff into an unsolicited framework rewrite or backend expansion.

## Publication: GitHub and the public link are separate

The public app is a static **Sites** deployment. GitHub pushes alone do not update it. Current publication identity:

```text
Project ID: appgprj_6af8d642a48c8191a783c991f417a5a0
Published version: 5
Site source commit: d9675b3005268988264aec2301cc3c230caace1e
Published app commit: fd63c2ad643271bf590e0ae9f28f93a6cee03576
```

The publication checkout's `.openai/hosting.json` binds this existing project and serves `dist/`. Copy only the browser app (`demo/index.html`, `favicon.svg`, `manifest.webmanifest`, and `src/`) into `dist/`; keep research, repository history, and credentials outside the served directory. Update `SOURCE.json` to the actual app commit.

Use the supported Sites source/packaging/version/deploy workflow with fresh credentials and deploy the saved version to the existing public project. Preserve the public audience and URL. Never include source tokens in files or this handoff. See `docs/deployment.md` for the maintained procedure.

**For a GPT agent with Sites access:** read the current Sites instructions, reuse the project identity above, open its supported source workflow before editing the publication checkout, then package, save, and deploy the exact source revision. If Sites is unavailable in the new session, finish the source work and explicitly report publication as blocked until an authorized session can publish it. Do not claim a GitHub push deployed the app or create a replacement public link without the owner’s direction.

Matthew has authorized routine coding, useful tool installation, and sensible branch integration/cleanup. He prefers autonomous progress and short, concrete updates. Preserve teammates' changes, use the current environment's actual permissions, and be explicit about any action that remains blocked.
