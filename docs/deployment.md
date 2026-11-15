# Public demo deployment

**[Open the current CampusCurb demo](https://campuscurb-cal-poly-current.jammyhoneydew6.chatgpt.site)**

The new public Site was created at the user's request on November 15, 2026 because the previous project's publishing permissions were unavailable in this account. Anyone with the new link can visit. The previous Site remains intact at its original address.

## Current publication

- Site project: `appgprj_6af9ebd565e0819191160fadd87c9a66`
- Version: 3
- GitHub app source: `main`, `8d600777138a6672e36e261f465a68cf5a7ac21b`
- Sites source commit: `f555835c8be0b74d6992670e7770f99eec16b796`
- Saved version: `appgprj_6af9ebd565e0819191160fadd87c9a66~appgver_0cf1a55174988191b97534e8584d22a5`
- Successful deployment: `appgdep_6af9f514d1ac819187f44d2a1392ec44`, November 15, 2026 at 18:08:25 UTC (10:08 AM Pacific)
- Local publication checkout: `C:/Users/bhend/.codex/visualizations/2026/11/14/01a1dbb4-8b2b-7f32-a933-ed9fe30ee6a7/campuscurb-current-site`

The static app is an exact copy of `demo/index.html`, `demo/favicon.svg`, `demo/manifest.webmanifest`, and `demo/src/`. Its checked-in `SOURCE.json` records the GitHub source. All 22 files under `src/` matched by SHA-256; all 55 tests and source syntax checks passed. The new hosted map and current destination/trip UI loaded in the browser. No Google key or user browser data was copied. Saved sessions/preferences belong to each browser origin, so they do not migrate from the old URL automatically. Live occupancy remains unconnected.

Version 3 adds elapsed-trip checks against applicable parking time limits. Overlong trips turn red and display planned and allowed durations. Abbott uses the user-reported 10-hour cap with explicit sign/curb/hour limitations; G2 retains its published two-hour rule and staff exception. The live Abbott card was verified for an 11-hour trip. [Verification and screenshot](../artifacts/trip-duration-limits/README.md).

Version 2 published researched permit-rule statuses for ordinary spaces at 18 campus facilities, including Grand Avenue's regular Friday 5 PM-Monday 7 AM exemption. Blue identifies a permit rule; occupancy and full stall eligibility remain separate. Friday/Monday boundaries, exceptions and DST were tested. The live card shows the next regular enforcement start and still says empty spaces are unknown. See [findings](research/permit-status-2026-11-15.md) and [hosted evidence](../artifacts/researched-permit-status/grand-weekend-live.jpg).

Version 1 was initially published from GitHub app commit `4372816`. Version 2 uses app commit `3850591`; subsequent documentation commits do not change hosted app assets. The packaging helper verified the newly committed and pushed Sites source before building the archive; the opening checkout's older Sites SHA was not used for native publication.

## Updating this Site

GitHub pushes still do not automatically publish the website. Reuse this new project identity, checkout and URL for future publications; no additional Site is needed.

1. Read the publication checkout's `.openai/hosting.json` and obtain a fresh credential for the project above.
2. Open the checkout with the Sites source helper before editing. Fetch GitHub main and preserve teammate changes.
3. Synchronize only the app assets listed above into `dist/`, and update `SOURCE.json`. Keep credentials out of files.
4. Check the app, push/package exact source with the supported Sites workflow, save a version, and deploy it.
5. Confirm deployment success. Preserve public access unless the user asks for a different audience.

Only app assets are hosted; repository research, history, credentials and parked-car notes are not uploaded. No shared Google key is configured. Browser notes, sessions and local reports remain private to that browser.

## Historical publication on the original Site

The record below describes the original project, which this account could not update. Its version 7 remains intact; it is no longer the primary demo link in this repository.

### Original Site deployment

Public URL: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site

The demo is public and does not require ChatGPT or GitHub sign-in. The GitHub repository's visibility is unchanged. App sessions, parking notes, and fictional reports stay in each visitor's browser.

## Current publication

- Site project: `appgprj_6af8d642a48c8191a783c991f417a5a0`
- Version: 7
- Source app branch: `main`
- Source app commit: `417cc78eb4575ccc69c4baf53090349c8159ef70`
- Published source commit: `d9e9e1ddeb7a2e76307b650cb018d856fa6734ae`
- Saved version: `appgprj_6af8d642a48c8191a783c991f417a5a0~appgver_c0f536c8dbf881918155b0cadd7eee05`
- Successful deployment: `appgdep_6af9b0856b38819190a0812287d17b03`, November 15, 2026 at 13:15:55 UTC
- Publication checkout on Matthew's Mac: the sibling `campuscurb-site` directory, with its tracked `.openai/hosting.json` identity.

## Updating the same link

The November 15 no-permit/main-destination source update has [local verification](../artifacts/permit-destination-controls/README.md). The current Codex account reads public metadata, but write-credential requests returned `Sites project not found`. Version 7 remains current; an authorized owner/editor must publish this new source to the same project and URL.

Version 7 fixes the home estimate legend drifting into the center on wide screens. It retains version 6's trip-entry/highlight/Abbott update and expanded campus inventory. The November 15 publication reused the existing Site, public audience, and URL. A fresh source-write credential succeeded, resolving the earlier `Sites project not found` publishing failure. See the [legend fix and hosted verification](../artifacts/legend-fix/README.md), plus the [earlier version 6 verification](../artifacts/hosted-v6/README.md).

Changes in this GitHub repository are not automatically deployed. After changing `demo/`, ask Codex to publish the updated CampusCurb demo to the existing Site. Keep its project identity, slug, and public audience.

1. Read the existing publication checkout's `.openai/hosting.json`.
2. Obtain a fresh supported source credential for the existing Site; do not create another Site.
3. Copy only `demo/index.html`, `demo/favicon.svg`, `demo/manifest.webmanifest`, and `demo/src/` into the publication checkout's `dist/`.
4. Update its `SOURCE.json` with the app's source commit. Keep all tokens out of files.
5. Check changed code, use the supported Site workflow to push/package the exact source, save the version, and deploy to the existing public Site.
6. Confirm deployment success and share the same public URL.

Only the browser app is hosted. Team research files, repository history, local logs, and credentials are not served. The geographic map uses real campus GIS geometry and separately reviewed research records; incomplete policies and occupancy remain unknown. The separate walkthrough's rules, prices, routes, and community reports remain explicitly illustrative.

Version 7 publishes 24 static app files matching the integrated source, including 42 source-backed neighborhood street segments on ten roads, expanded campus inventory, destination/permit planning, trip date/time entry, color explanations, and the style-switch highlight fix. All 37 Node tests and configured syntax checks passed before packaging. Version 6 verified the hosted trip form, expanded inventory, and Abbott search/place card. Version 7 additionally verified that the desktop legend aligns with the search dock and sits 12px above it; local layout checks covered 1280×720, 900×700, and the unchanged 390×844 phone breakpoint. Earlier review snapshots retain the older app's state; use [current status](status/discovery.md) for remaining work.

Google remains unconfigured for the shared deployment. **Layers → Map connection** connects a key for the current browser only. Actual occupancy remains unknown; chance colors are explicitly illustrative demo fixtures. See [map configuration](maps.md).

## GitHub sync status for this publication

The [November 15 repository audit](status/repository.md) checks the newer integrated `main`, all remote branches, and open pull requests. The record below describes the earlier November 14 publication.

**GitHub synchronization completed November 14, 2026 local time.** The signed-in GitHub Desktop connection successfully published `main` and `codex/free-parking-research`; Git's remote query independently confirmed both at `1b8fe1353fa6aaac2bddc81fcf8202acaf43dccb` before this status update. The previously unpublished redesign commits, free-data study, local detector pilot, and all 99 copied design/research deliverables are included. See the [artifact index](../artifacts/README.md). These status notes follow that verified publication.

The original Matthew checkout and teammates' branches were preserved. No history was rewritten. Archived handoffs and evidence snapshots retain creation-time pending-push notes; those are historical records. That GitHub synchronization did not create a Site deployment; the separate November 15 Site publications are recorded above.
