# Current CampusCurb app status

## November 15: trip duration limits

Published to the current public URL as Site version 3 from app commit `8d60077`; the live Abbott over-limit warning was verified. See [deployment provenance](../deployment.md).

Trips exceeding an area's maximum parking duration now turn it red with planned and allowed times. The shared check runs before permit/general-hours shortcuts and preserves area-specific exemptions. Abbott's 10-hour limit is explicitly user-reported; exact signed curbs/hours remain unverified. Time-limit details remain visible without the chance preview. All 55 tests pass; see [verification and limitations](../../artifacts/trip-duration-limits/README.md).

## November 15: reviewed permit schedules

Published to the current public URL as Site version 2, app source `3850591`. Hosted Grand Avenue status and enforcement-resumption text were verified. See [deployment provenance](../deployment.md).

Replaced generic unknown labels with source-backed permit-rule statuses for ordinary spaces in 18 reviewed facilities. Grand Avenue now shows No general permit required for trips wholly within Friday 5 PM-Monday 7 AM, with event/special-space exceptions and the next regular enforcement start. Blue means a reviewed rule; empty-space availability remains unknown. Product matching distinguishes ordinary Commuter Annual from Grand Annual. See [findings, limits and 50 passing tests](../research/permit-status-2026-11-15.md).

## November 15: no-permit and main destination controls

Added exclusive No permit selection and contextual red missing-permit/payment or mismatch explanations. Selected restricted areas stay red across map styles. Where are you headed? is now a main-map entry alongside Trip date & time, with draft/open-state retention during background refreshes. Full parking has a separate source-verified, expiring display contract; no live occupancy feed is connected. Rules, limits, 43 tests, desktop/phone checks and screenshots are in [the verification record](../../artifacts/permit-destination-controls/README.md).

Published November 15 to the user-authorized new public Site: https://campuscurb-cal-poly-current.jammyhoneydew6.chatgpt.site . Version 1 includes app source `4372816` and all 43 passing tests. The original Site remains intact. See [current deployment details](../deployment.md) for the new project identity and future publishing workflow.

Consolidated November 15, 2026, America/Los_Angeles, from integrated `main` at `0f0bd0e`. See the [repository audit](repository.md) for branch coverage, the [architecture](../architecture.md) for implementation details, and [earlier implementation notes](discovery-history-2026-11-14.md) for history.

## Integrated behavior

- The map-first redesign opens directly into geographic search with compact street/lot cards, directions, source details, and manual saved-car reminders. The fictional walkthrough remains separate under Layers.
- On screens wider than 760px, the home estimate legend aligns with the search dock's left edge and stays 12px above its measured top, instead of drifting into the map center. The phone layout and selected-place legend placement retain their existing layout.
- Satellite uses credited 2022 USDA NAIP/CDFW imagery. Dark/Standard use OpenFreeMap; Terrain uses USGS. Google is preferred when configured with a browser key; no shared key is committed.
- The expanded campus inventory includes named lots, garages, mapped subareas, stall-category notes, time-limit information, and known closures. Source entries without matching GIS geometry remain searchable. Exact stall permissions and usable capacity still require verification.
- The City street query covers 42 exact source segments on ten roads, including Abbott. These are centerlines, with approximate display bands rather than surveyed legal curbs.
- Trip arrival/departure is entered below search and validated together in Los Angeles time. Permit selection and the parking planner expose the relevant product choices and source-linked district guidance.
- Yellow/red chance explanations describe demo fixtures. A known permit conflict or closure shows the evaluator's actual reason and a restriction lock. G2/Structure 131 exclusions, G2's staff exception, H14 subarea uncertainty, and permanent closures remain distinct from chance colors.
- Style replacement restores parking overlays and selection. The earlier style-switch overlay loss and expanded-search compression were addressed by commit `00c6f99`; [recorded desktop/phone evidence](../../artifacts/trip-map-fixes/README.md) accompanies that update.
- Manual reminders retain absolute deadlines and use the driver's walk estimate and buffer. Notes stay in the browser; background/native notification delivery is not connected.

## Validation

The integrated source passes **37 Node tests** and its configured syntax checks. The separate research suite passes **28 Python tests** with the detector dependencies installed. Both suites were rerun on November 15 during the repository integration audit. This organization update changes documentation only.

Earlier rendered verification checked desktop/phone trip entry, Abbott selection, and switches through all four map styles. That evidence is dated in its report; this repository organization did not repeat rendered visual testing or verify Google authentication.

## Research status

The [free-data study](../research/free-parking-data-feasibility.md) identified seven distinct acquisition dates across 2012–2024 in the tested archive; flight clocks remain unverified. The [G2 detector pilot](../research/g2-vehicle-detector-pilot.md) matched 7 of 18 provisional assistant reference centers after exploratory scale adaptation in two County 2014 windows. The two 2022 windows returned no candidates and are unscored. Labels need independent human verification; counts are not whole-lot occupancy.

Maintained code lives in [tools/parking-research](../../tools/parking-research/README.md); complete delivered snapshots, model provenance, sample images and raw results are in the [artifact index](../../artifacts/README.md). No detector-derived counts or forecast probabilities are connected to the app.

## Remaining work

- Verify exact block faces, signs, stall categories, permit intervals, temporary closures, entrances, costs, walking routes, and usable capacity before confident recommendations. Missing policy remains unknown.
- Obtain independent labels and held-out detector evaluation, plus repeated timestamped demand observations, before replacing the explicit chance fixtures with a forecast or feed.
- Configure and verify Google rendering for the intended deployment. Current key setup is per browser.
- Continue phone framing, touch-area, accessibility, and provider-failure review beyond the recorded checks.
- Connect any production AI, shared reports, payments, automatic parking detection, or background notifications as separate work; these are not implemented services.

## GitHub and hosting

Every pre-existing local and GitHub branch was already contained in `main` at this audit; there were no open pull requests. The [repository audit](repository.md) records the checked tips. Current code, design assets, research, and evidence are all versioned together.

GitHub source and the hosted Site have separate publication histories. The existing public Site is now **version 7**, from app commit `417cc78`, including the home legend alignment fix. All 24 static app files matched the source. The hosted legend was verified at 1280×720, left-aligned with the search dock and 12px above it. See [deployment notes](../deployment.md), [legend verification](../../artifacts/legend-fix/README.md), and the [earlier version 6 checks](../../artifacts/hosted-v6/README.md). Future GitHub pushes still require a separate Site publication.
