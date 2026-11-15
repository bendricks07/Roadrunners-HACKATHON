# CampusCurb design and research deliverables

This folder preserves the generated concepts, rendered app evidence, source-backed research, and runnable pilot handoffs alongside the application source. `manifest.json` records the copied deliverable paths, sizes and hashes. Reports, source snapshots and ZIPs retain their creation-time metadata; an archived `github_pushed: false` describes the handoff when it was produced, not the current repository synchronization state.

## Design and app review

- [Estimate legend alignment fix and hosted version 7](legend-fix/README.md), with wide-screen screenshot and layout measurements.
- [Hosted version 6 publication and verification](hosted-v6/README.md), including the deployed trip form and Abbott place card.
- [Latest trip-entry, Abbott, and restored-highlight verification](trip-map-fixes/README.md), with desktop and phone screenshots. This update addresses the overlay loss and compressed search field in the earlier review.
- [Earlier rendered app test review](campuscurb-design-test-review.md).
- [Refined dark selected-street concept](campuscurb-concept-02-dark-selected-street-v2.png) and [refinement prompt](campuscurb-refined-streets-v2-prompt.md).
- [Satellite concept](campuscurb-concept-01-satellite-streets.png), [dark concept](campuscurb-concept-02-dark-selected-street.png), [campus areas concept](campuscurb-concept-03-campus-parking-areas.png), and [concept prompts](campuscurb-concept-prompts.md).
- [Live desktop satellite screenshot](campuscurb-live-desktop-satellite.jpg), [phone satellite](campuscurb-live-phone-satellite.jpg), [phone search](campuscurb-live-phone-search.jpg), [dark style after switch](campuscurb-live-phone-dark-after-switch.jpg), and [dark style after reload](campuscurb-live-phone-dark-after-reload.jpg). Additional local test screenshots are retained at this folder's root.
- [Earlier generated concept history](design-history/), including the approved [satellite home](design-history/exec-f1fa6530-00b6-42ba-8ae9-02f89ad1a9e7.png) and [dark selected-place](design-history/exec-69d475e7-c4bb-493b-9da4-2e9a5422b3e7.png) references.

Generated concepts use illustrative geography and estimates. They are design references, not source data, navigation maps, or measured parking availability. Screenshots record the state tested on their report date. Use the latest verification report and [current app status](../docs/status/discovery.md) to distinguish resolved defects from remaining work.

## Free-data study and detector pilot

- [Free-source feasibility study](slo-parking-research/feasibility-study.md), [research handoff](slo-parking-research/README.md), and [complete ZIP](slo-parking-research.zip).
- [G2 detector pilot report](g2-vehicle-pilot/pilot-report.md), [reproduction instructions](g2-vehicle-pilot/README.md), and [complete ZIP](g2-vehicle-pilot.zip).
- [Annotated County 2014 result](g2-vehicle-pilot/scale-adapted/county2014-north-overlay.png), [raw results](g2-vehicle-pilot/scale-adapted/detections.json), and [provenance](g2-vehicle-pilot/provenance/provenance.json).

The detector matched only 7 of 18 provisional assistant reference centers after exploratory scale adaptation. Labels need independent human verification. The 2022 windows are unscored and returned no useful candidates; they must not be interpreted as empty parking. No result here supplies current occupancy, legal permission, usable capacity, or a validated forecast. Source credits and reuse evidence are retained with the imagery and model records. Model weights are downloaded on demand from a pinned, checksummed source rather than bundled.

Current maintained research code is in [tools/parking-research](../tools/parking-research/README.md). The copies and ZIPs here preserve the earlier delivered handoffs.
