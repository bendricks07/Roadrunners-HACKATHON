# Hosted version 6 verification

Published November 15, 2026, America/Los_Angeles, to the existing public [CampusCurb URL](https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site). Sites returned a successful deployment for version 6; the project, audience, and URL were preserved.

- GitHub app source: `50552300b611176bd60ae1fb6096b99805e43698`.
- Site source commit: `20da836ce4d0ce3b47c720d2fb742f82c438e48a`.
- All 24 packaged static app files exactly matched `demo/` at the app source commit. Localhost's sampled JavaScript files also matched that checkout.
- All 37 Node tests and configured syntax checks passed before publication.
- The old hosted page lacked trip controls and the expanded inventory. After deployment and reload, the hosted page displayed both.
- Opened the hosted trip form and checked arrival/departure fields and Los Angeles time guidance. No trip values were changed.
- Searched for Abbott, selected its two-block street result, and checked its place card, demo-chance explanation, and directions link. External routing was not opened.
- Browser verification used the existing in-app browser at 667×717. The page was returned to its home view. This was a publication smoke test, not a new full cross-browser or Google-key verification.

Evidence: [trip form](campuscurb-live-v6.jpg), [Abbott place card](campuscurb-live-v6-abbott.jpg), and [deployment provenance](deployment.json).

The earlier write-credential failure is resolved. GitHub updates do not automatically deploy the Site; use [deployment instructions](../../docs/deployment.md) for later publications. Parking availability and incomplete permissions remain unknown.
