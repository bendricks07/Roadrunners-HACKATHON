# Permit and destination verification

Checked November 15, 2026 (America/Los_Angeles).

- **No permit** is separate from **Not sure yet** and mutually exclusive with actual products. Deselecting the last product returns to No permit; empty saved selections migrate to No permit.
- **Where are you headed?** is directly under map search, above Trip date & time. It immediately updates the summary and illustrative review ordering. Editors retain their open state and date drafts during background geometry refreshes.
- Red cards explain missing permit/payment, supported permit mismatches or closure. Selected restricted polygons and pins stay red across style switches. Conflicts stay out of the illustrative review list, even with estimates off; a supported second permit can clear a false conflict.
- Missing-permit cautions use the common weekday 7 AM-5 PM enforcement window, with holiday/sign exceptions disclosed. Residential 131/R3/R4 authorization applies 24/7. C-lot commuter cautions concern general staff spaces during daytime enforcement. Unknown streets, evenings, weekends, special stalls and holiday exceptions never establish free parking. Overall policy remains unknown when incomplete.
- **No available spaces** requires a fresh `availability` object: `status: full`, `verified: true`, HTTPS `sourceUrl`, finite `observedAt` and `expiresAt` covering now. Expired, unverified or future observations cannot claim full parking. No actual occupancy observations/feed are connected; low demo chance is never confirmed full.

Official sources rechecked: [enforcement hours](https://afd.calpoly.edu/parking/slo/parking-on-campus/enforcement-hours) and [lot directory](https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/). The enforcement page's listed holiday dates are obsolete; no current holiday/event calendar or full policy is inferred from GIS classifications.

Validation: all 43 Node tests and source syntax checks passed. Rendered desktop 1280x720 and phone 390x844 checks covered destination changes, date application, No permit exclusivity, persisted selection, red H1 explanation, selected polygon, and Dark-to-Satellite overlay retention. Phone document width stayed 390px. No browser console errors were recorded. Google remains untested without a key.

Evidence: [red H1 missing-permit explanation](no-permit-desktop.jpg), [phone destination entry](destination-phone.jpg).

Publishing is blocked in this account: two write-credential requests for the existing Site returned `Sites project not found`; public metadata is readable. Version 7 remains live. No replacement Site was created. An authorized editor must publish the merged `demo/` using [deployment instructions](../../docs/deployment.md).
