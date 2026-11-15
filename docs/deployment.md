# Public demo deployment

Public URL: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site

The demo is public and does not require ChatGPT or GitHub sign-in. The GitHub repository's visibility is unchanged. App sessions, parking notes, and fictional reports stay in each visitor's browser.

## Current publication

- Site project: `appgprj_6af8d642a48c8191a783c991f417a5a0`
- Version: 6
- Source app branch: `main`
- Source app commit: `50552300b611176bd60ae1fb6096b99805e43698`
- Published source commit: `20da836ce4d0ce3b47c720d2fb742f82c438e48a`
- Saved version: `appgprj_6af8d642a48c8191a783c991f417a5a0~appgver_90ff225ddd948191945690747ca43386`
- Successful deployment: `appgdep_6af9ad60be648191b1a2d874b7eea188`, November 15, 2026 at 13:02:31 UTC
- Publication checkout on Matthew's Mac: the sibling `campuscurb-site` directory, with its tracked `.openai/hosting.json` identity.

## Updating the same link

Version 6 now includes the trip-entry/highlight/Abbott update and expanded campus inventory from integrated GitHub source. The November 15 publication reused the existing Site, public audience, and URL. A fresh source-write credential succeeded, resolving the earlier `Sites project not found` publishing failure. See [hosted verification and screenshots](../artifacts/hosted-v6/README.md).

Changes in this GitHub repository are not automatically deployed. After changing `demo/`, ask Codex to publish the updated CampusCurb demo to the existing Site. Keep its project identity, slug, and public audience.

1. Read the existing publication checkout's `.openai/hosting.json`.
2. Obtain a fresh supported source credential for the existing Site; do not create another Site.
3. Copy only `demo/index.html`, `demo/favicon.svg`, `demo/manifest.webmanifest`, and `demo/src/` into the publication checkout's `dist/`.
4. Update its `SOURCE.json` with the app's source commit. Keep all tokens out of files.
5. Check changed code, use the supported Site workflow to push/package the exact source, save the version, and deploy to the existing public Site.
6. Confirm deployment success and share the same public URL.

Only the browser app is hosted. Team research files, repository history, local logs, and credentials are not served. The geographic map uses real campus GIS geometry and separately reviewed research records; incomplete policies and occupancy remain unknown. The separate walkthrough's rules, prices, routes, and community reports remain explicitly illustrative.

Version 6 publishes 24 static app files matching the integrated source, including 42 source-backed neighborhood street segments on ten roads, expanded campus inventory, destination/permit planning, trip date/time entry, color explanations, and the style-switch highlight fix. All 37 Node tests and configured syntax checks passed before packaging. After deployment, the hosted trip form, expanded inventory, and Abbott search/place card were checked in the browser. Earlier review snapshots retain the older app's state; use [current status](status/discovery.md) for remaining work.

Google remains unconfigured for the shared deployment. **Layers → Map connection** connects a key for the current browser only. Actual occupancy remains unknown; chance colors are explicitly illustrative demo fixtures. See [map configuration](maps.md).

## GitHub sync status for this publication

The [November 15 repository audit](status/repository.md) checks the newer integrated `main`, all remote branches, and open pull requests. The record below describes the earlier November 14 publication.

**GitHub synchronization completed November 14, 2026 local time.** The signed-in GitHub Desktop connection successfully published `main` and `codex/free-parking-research`; Git's remote query independently confirmed both at `1b8fe1353fa6aaac2bddc81fcf8202acaf43dccb` before this status update. The previously unpublished redesign commits, free-data study, local detector pilot, and all 99 copied design/research deliverables are included. See the [artifact index](../artifacts/README.md). These status notes follow that verified publication.

The original Matthew checkout and teammates' branches were preserved. No history was rewritten. Archived handoffs and evidence snapshots retain creation-time pending-push notes; those are historical records. That GitHub synchronization did not create a Site deployment; the separate November 15 publication above subsequently deployed version 6.
