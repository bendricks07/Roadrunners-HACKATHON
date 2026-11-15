# Public demo deployment

Public URL: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site

The demo is public and does not require ChatGPT or GitHub sign-in. The GitHub repository's visibility is unchanged. App sessions, parking notes, and fictional reports stay in each visitor's browser.

## Current publication

- Site project: `appgprj_6af8d642a48c8191a783c991f417a5a0`
- Version: 2
- Source app branch: `codex/satellite-parking-map`
- Source app commit: `9eb64dff92af3bb96a1d824a510e334ad4513d87`
- Published source commit: `85fa75856f2773a4fd527df19b6ca20416068bfb`
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

Version 2 adds the Google-ready geographic Explore view, source-backed overlays, manual reminders, and an explicitly labeled USDA/USGS fallback. A Google browser/demo key has not been configured for the shared deployment. Map settings connects a key for the current browser only; see [map configuration](maps.md) for shared deployment setup. Do not represent the fallback as Google imagery.
