# Estimate legend alignment fix

Published November 15, 2026, as version 7 at the existing [CampusCurb URL](https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site).

The wide-screen legend previously inherited a 500px left offset while the home view kept a raised vertical position, leaving it floating near the center. Above 760px, the home legend now shares the search dock's 24px left edge and sits 12px above its measured top. The existing dock observer accounts for changes in dock height. Phone and selected-place styles are unchanged.

Validation: all 37 app tests and configured syntax checks passed. Local browser geometry checks verified the 12px gap at 1280×720 and 900×700. The unchanged 390×844 layout had no legend/dock overlap or horizontal overflow. After publication, the hosted app was checked at 1280×720 and again measured a shared 24px left edge and 12px gap. No new full phone visual or Google-key verification is claimed.

Evidence: [hosted screenshot](campuscurb-live-legend-fixed.jpg), [local measurements](layout-checks.json), [hosted measurement](hosted-layout.json), and [deployment provenance](deployment.json).

App source: `417cc78eb4575ccc69c4baf53090349c8159ef70`. Site source: `d9e9e1ddeb7a2e76307b650cb018d856fa6734ae`. The existing project, public audience, and URL were preserved.
