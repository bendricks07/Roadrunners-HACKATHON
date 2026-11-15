# Public demo deployment

Public URL: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site

The demo is public and does not require ChatGPT or GitHub sign-in. The GitHub repository's visibility is unchanged. App sessions, parking notes, and fictional reports stay in each visitor's browser.

## Current publication

- Site project: `appgprj_6af8d642a48c8191a783c991f417a5a0`
- Version: 5
- Source app branch: `main`
- Source app commit: `fd63c2ad643271bf590e0ae9f28f93a6cee03576`
- Published source commit: `d9675b3005268988264aec2301cc3c230caace1e`
- Publication checkout on Matthew's Mac: the sibling `campuscurb-site` directory, with its tracked `.openai/hosting.json` identity.

## Updating the same link

Changes in this GitHub repository are not automatically deployed. After changing `demo/`, ask Codex to publish the updated CampusCurb demo to the existing Site. Keep its project identity, slug, and public audience.

1. Read the existing publication checkout's `.openai/hosting.json`.
2. Obtain a fresh supported source credential for the existing Site; do not create another Site.
3. Copy only `demo/index.html`, `demo/favicon.svg`, `demo/manifest.webmanifest`, and `demo/src/` into the publication checkout's `dist/`.
4. Update its `SOURCE.json` with the app's source commit. Keep all tokens out of files.
5. Check changed code, use the supported Site workflow to push/package the exact source, save the version, and deploy to the existing public Site.
6. Confirm deployment success and share the same public URL.

Only the browser app is hosted. Team research files, repository history, local logs, and credentials are not served. The geographic map uses real campus GIS geometry and separately reviewed research records; incomplete policies and occupancy remain unknown. The separate walkthrough's rules, prices, routes, and community reports remain explicitly illustrative.

Version 5 publishes the approved satellite/dark map redesign, 40 source-backed neighborhood street segments, compact place cards, sharper NAIP imagery, OpenFreeMap vector styling, and the returning-visitor migration. The new map opens on launch; an old sample session is preserved separately and remains accessible through the walkthrough. All 32 Node checks and the updated DOM integration check passed. Full rendered visual review was interrupted by the desktop/browser connection dropping.

Google remains unconfigured for the shared deployment. **Layers → Map connection** connects a key for the current browser only. Actual occupancy remains unknown; chance colors are explicitly illustrative demo fixtures. See [map configuration](maps.md).

## GitHub sync status for this publication

The app changes are committed and merged into local `main`, preserving the original Matthew checkout and teammates' branches. **GitHub push is pending.** The existing GitHub Desktop connection became unavailable, and terminal Git has no GitHub credential (`could not read Username`). Publishing to the Site source repository succeeded independently; the live public app is updated, but a teammate pulling GitHub will not receive this revision until `main` is pushed. Use the laptop's signed-in GitHub Desktop **Push origin**, then fetch/verify the remote SHA. Do not discard local commits or restart an unnecessary device-login flow.
