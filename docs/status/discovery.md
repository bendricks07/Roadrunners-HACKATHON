# Current CampusCurb app status

Consolidated November 15, 2026, America/Los_Angeles, from integrated `main` at `0f0bd0e`. See the [repository audit](repository.md) for branch coverage, the [architecture](../architecture.md) for implementation details, and [earlier implementation notes](discovery-history-2026-11-14.md) for history.

## Integrated behavior

- The map-first redesign opens directly into geographic search with compact street/lot cards, directions, source details, and manual saved-car reminders. The fictional walkthrough remains separate under Layers.
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

GitHub source and the hosted Site have separate publication histories. The last recorded hosted version is 5; the later source update's Site write request returned `Sites project not found`. The existing project's authorized owner/editor needs to publish the updated source to the same Site when requested. See [deployment notes](../deployment.md). No Site deployment was performed by this repository organization.
