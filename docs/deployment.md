# Public demo deployment

Public URL: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site

The demo is public and does not require ChatGPT or GitHub sign-in. The GitHub repository's visibility is unchanged. App sessions, parking notes, and fictional reports stay in each visitor's browser.

## Current publication

- Site project: `appgprj_6af8d642a48c8191a783c991f417a5a0`
- Version: 1
- Source app commit: `57e45bfa9b2edf919636816194075f2446e02eb3`
- Published source commit: `f2c021cada18805d0c04951a166b8dcb68d5c527`
- Publication checkout on Matthew's Mac: the sibling `campuscurb-site` directory, with its tracked `.openai/hosting.json` identity.

## Updating the same link

Changes in this GitHub repository are not automatically deployed. After changing `demo/`, ask Codex to publish the updated CampusCurb demo to the existing Site. Keep its project identity, slug, and public audience.

1. Read the existing publication checkout's `.openai/hosting.json`.
2. Obtain a fresh supported source credential for the existing Site; do not create another Site.
3. Copy only `demo/index.html`, `demo/favicon.svg`, `demo/manifest.webmanifest`, and `demo/src/` into the publication checkout's `dist/`.
4. Update its `SOURCE.json` with the app's source commit. Keep all tokens out of files.
5. Check changed code, use the supported Site workflow to push/package the exact source, save the version, and deploy to the existing public Site.
6. Confirm deployment success and share the same public URL.

Only the browser app is hosted. Team research files, repository history, local logs, and credentials are not served. Rules, prices, routes, and community reports remain explicitly illustrative.
