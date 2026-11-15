# Trip entry and parking highlight verification

Verified locally November 14, 2026 (America/Los_Angeles), from `codex/trip-entry-map-fixes`.

- Trip date/time is directly below search on home, search, and place cards. Native date/time inputs use Los Angeles time; invalid/reversed trips show an inline error and do not replace the current plan. Permits remain under Layers > Permits & preferences.
- Yellow/low-chance red explanations explicitly describe illustrative samples. Known permit exclusions and closures instead show their evaluator reason with a red lock; G2's commuter exclusion disables saving a car there.
- Rendered Satellite > Dark > Standard > Terrain > Satellite switches kept the street highlights visible. A selected Abbott segment retained its selection after switching back to Satellite. A lifecycle regression test checks restored fill/outline/curb/hit layers and latest selection/data during replacement-style loading.
- Abbott is searchable and selectable, with two source-matched City segments (OBJECTID 2173 and 2333, FULLNAME `ABBOTT ST`). The official City layer 16 query was checked directly; rules and availability remain unknown. Directions target the mapped area center, not a verified entrance.
- Checked 1280x720 desktop and 390x844 phone rendering; phone document width stayed 390px. Search no longer compresses vertically. Phone attribution is positioned above home trip controls.
- Source syntax checks and all 37 Node tests pass. A temporary edit-time syntax error was corrected before final checks and screenshots.

Evidence: [phone trip entry](trip-entry-phone.jpg), [phone Abbott details](abbott-phone.jpg), [desktop dark highlights](dark-highlights-desktop.jpg).

Google rendering was not tested because no key is configured. The existing hosted app is still version 5: the current Sites connection can read its public metadata, but a source-write credential request returned `Sites project not found`. GitHub merging does not publish the Site. The existing project's owner/editor must publish the updated `demo/` using `docs/deployment.md`; preserve the same Site and URL.
