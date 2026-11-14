# Cal Poly SLO parking research handoff

Research date: **November 14, 2026**, America/Los_Angeles.

This is desk research for the app builder, not a completed field survey or a live parking feed. Official pages were checked where accessible; some City pages returned HTTP 403, so their indexed official text is identified separately. No interviews, sign inspections, phone calls, or payment transactions were performed. Source retrieval does not establish that every statement on a page is current.

## Builder's starting point

- Use [the research seed JSON](../../data/research/cal-poly-slo-parking-seed.json) for ten campus location records and five city district summaries. It is a research inventory, not an executable eligibility policy.
- Use H1, Grand Avenue Structure, G2, and H14 as an initial demonstration set, with uncertain rules visibly identified.
- Keep **Grand Avenue Structure and Structure 131 as different IDs**. The university's directory labels their permit eligibility differently, despite reusing the same Google Maps link for both. [L]
- Keep occupancy unknown for every record. Neither capacity nor the presence of a map listing establishes available spaces.
- Obtain entrance coordinates, precise subarea boundaries, posted rules, payment-zone numbers, and walking routes through field verification or an authorized authoritative dataset before production navigation.

## Ten campus locations

| ID suffix | Location | Published evidence | Research action |
| --- | --- | --- | --- |
| h1 | H1 | Short-term commuter parking; pay station [L, P] | Confirm current daily/weekly purchase options and entrance |
| h12 | H12 | Long-term commuter area; pay station [L] | Confirm stall categories and evening short-term options |
| h14 | H14 | Mixed commuter and limited-time B/C areas [L] | Separate subareas before assigning rules |
| h16 | H16 | Commuter and staff spaces; pay station [L] | Map staff versus commuter stalls |
| grand-structure | Grand Avenue Structure | Commuter, staff, metered, ADA and EV categories [L] | Resolve permit-specific time eligibility [C] |
| structure-131 | Structure 131 | Visitor/resident designation; commuter/staff permits excluded [L] | Do not merge with Grand; obtain distinct entrance [V] |
| g2 | G2 | Two-hour limit; commuter permits excluded; staff exception listed [L] | Confirm space-level exceptions and payment zone |
| a1 | A1 | Metered, sponsored-guest and ADA categories [L] | Avoid treating every stall as public hourly parking |
| r3 | R3, 271 Village Drive | Separate R3 commuter semester category [C] | Distinguish commuter from resident rights |
| r4 | R4, 371 Canyon Drive | Separate R4 commuter semester category [C] | Distinguish commuter from resident rights |

These are source-listed categories, not a claim that all ten areas are currently open, eligible for a given driver, or field-verified. [L, C]

## Permits and timing

The 2026–27 table lists Commuter Grand Annual at $720, Commuter Annual at $519, and R3/R4 semester permits at $259.50. Annual permits are listed for August 24, 2026–May 21, 2027; fall R3/R4 permits end January 22, 2027. The separate spring permits start January 23, 2027. Preserve the exact product and validity dates. [C]

The commuter page's current table and its detailed guides do not fully agree about included outlying lots. It also contains general after-5 language alongside specific exclusions. Do not resolve these by assuming the most permissive interpretation. Commuter guidance prohibits overnight parking. [C]

General permit enforcement is published as Monday–Thursday 07:00–22:00 and Friday/academic breaks 07:00–17:00. Weekend exceptions include residential, Staff 24/7, event and specified metered areas. Other special-space and time-limit restrictions continue. The same page contains a holiday table from 2023–24: do not import those dates as a 2026 calendar. [E]

**Product implication:** evaluate the entire planned stay, with special-space restrictions and closures applied separately. If required information is missing, return unknown with a reason. Do not equate “permit enforcement ended” with permission to park overnight.

## Payments and costs

The fees page publishes $4 for one hour, $8 for two hours, $8 daily, and $40 weekly. It restricts daily/weekly permits to H1, with additional commuter-lot options after 17:00 Monday–Friday. Treat these as published product prices, not universal rates for every space. [F]

The meter page describes ParkMobile and PayByPhone, a published $0.35 session convenience fee, and example paired zones 4083/64083 for South Perimeter. Do not infer other payment zones from naming patterns; read the actual sign. [M]

Pay stations require a license plate, and offered products/rates depend on location. The visitor page places the Structure 131 machine on Level 1 outside the exit. A payment-service link is not evidence that payment succeeded. [P, V]

**Competition insight:** the official meter page already describes an optional 15-minute expiry reminder. Differentiate this app through permit eligibility, whole-stay restriction checks, and enough time to walk back. [M]

## Closures and conflicts to preserve

| Finding | Evidence | Builder response |
| --- | --- | --- |
| C3 and C4 are listed permanently closed | Dedicated closure page [X] | Exclude as recommendation candidates |
| K1, K2 and R1 are listed permanently closed; June 17, 2024 is given | [X] | Exclude; retain IDs only for legacy references |
| K1 still appears in visitor/pay-station guidance | [C, P] conflicts with [X] | Closure overrides the old suggestion; do not recommend K1 |
| H-2b eastern portion has scheduled construction November 16, 2026 at 06:00–December 4 at 16:00 | Facilities notice [N] | Partial subarea impact; do not mark all H2 closed |
| Fleet Services Building 71 has a partial staff-space closure November 16 at 07:00–November 30 at 15:30 | [N] | Separate future restriction with its own affected geometry |
| A parking-page sidebar says no upcoming closures while Facilities lists the above | [F, N] | Absence from one feed is not proof of no closure |
| H11 has a construction-closure label in the lot directory navigation but also an ordinary inventory entry | [L] | Hold for review, not a positive recommendation |
| Holiday dates are old | [E] | Require a current calendar; unknown until supplied |

Times above are interpreted in campus local time, America/Los_Angeles. Expected closure end times are not confirmed reopening events.

## Off-campus research

**No off-campus space was verified as unrestricted parking.** The city lists separate residential permit districts; a campus permit does not establish eligibility there. Published summaries include:

| District | Published restricted window | Verification status |
| --- | --- | --- |
| Monterey Heights | Monday–Friday 02:00–22:00 | Official indexed City page; district map text also retrieved |
| Murray | Monday–Friday 08:00–17:00 | Official indexed City page; map text also retrieved |
| College Highlands | Daily 22:00–10:00 | Official indexed City page |
| Ferrini | Daily 00:00–17:00 | Official indexed City page |
| Park View | Daily 00:00–07:00 | Official indexed City page |

The City limits permit issuance to qualifying residents/property-authorized recipients. District windows do not cover every curb restriction, boundary exception, temporary sign, or driveway. [R]

For overnight windows, represent both sides of midnight. Do not mark an entire street unrestricted merely because a district's permit window has ended.

### Five field-check targets, not parking recommendations

| Target | Reason to investigate | What remains unverified |
| --- | --- | --- |
| Grand Avenue immediately south of campus, around Slack Street | Campus approach; Monterey Heights map references Grand/Slack [MH] | Exact block faces, curb permissions, permit boundary and crossing |
| Fredericks Street around Grand Avenue | Street appears in Monterey Heights district map text [MH] | Segment endpoints, side-specific restrictions, pedestrian route |
| Loomis Street around Grand Avenue | Street appears in Monterey Heights district map text [MH] | Exact district coverage, current signage, permitted duration |
| Murray Street in the mapped Murray district | Map identifies Murray with nearby Chorro/Benton/Santa Rosa labels [MU] | Block faces, full restrictions, practical walk to campus |
| West side of Broad Street between Mission and Ramona | City greenway guidance describes parking restrictions for a bike lane [G] | Current endpoints/signage; treat as an exclusion-check target |

The PDF map text supports these survey targets, but map geometry was not visually verified: browser rendering failed. Do not digitize definitive street boundaries from the extracted text.

The City's residential GIS layer supports polygon records and JSON/GeoJSON queries, with fields including DISTRICT and HOURS. Layer metadata was accessible; a live feature query was not verified. Confirm reuse terms, freshness, coordinate system, and boundary accuracy before import. [GIS]

The City's rules page identifies a downtown overnight prohibition from 03:00–05:00. This is not evidence of a campus-neighborhood sweeping rule. Obtain segment-specific signs and the relevant city map before creating any sweeping reminder. [RR]

## Questions for TAPS and City Parking Services

These are prepared questions; no messages have been sent.

1. Which 2026–27 permit table/guide governs conflicting outlying-lot eligibility?
2. What are the current H14 A/B/C boundaries, time limits, and payment zones?
3. What payment products and maximum stays apply to each visitor area?
4. What is the current H11 status, and where is the authoritative closure feed?
5. What current holiday/academic-break schedule should the app use?
6. Are approved lot polygons, entrance points, pedestrian paths, or occupancy feeds available for reuse?
7. Which city dataset represents exact restricted curb segments and district exceptions?

Use the contacts on the official sites when the team is ready to contact them. Do not assume public website access includes access to private permit/payment systems.

## Field and user validation

See [the validation checklist](parking-field-and-demo-checklist.md). Sign photographs, entrance checks, accessible-route verification, notification delivery tests, and student interviews remain real-world work for the team.

## Source register

All sources are official university or City sources. Retrieval/check date is November 14, 2026; this is not necessarily the publisher's update date. Source IDs in the JSON resolve here and in its own source register.

| ID | Source | Access and caveat |
| --- | --- | --- |
| L | [Campus lot directory](https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/) | HTML retrieved; mixes inventory and closure labels |
| C | [Commuter permits](https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/general) | HTML retrieved; internal policy differences logged above |
| E | [Enforcement hours](https://afd.calpoly.edu/parking/slo/parking-on-campus/enforcement-hours) | HTML retrieved; holiday dates stale |
| F | [Permit fees](https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/fees) | HTML retrieved; prices are product-specific |
| M | [Meter payments](https://afd.calpoly.edu/parking/slo/parking-on-campus/meters) | HTML retrieved; confirm actual zone and current transaction total |
| P | [Pay stations](https://afd.calpoly.edu/parking/slo/parking-on-campus/pay-stations) | HTML retrieved; includes closed K1 |
| V | [Visitor guidance](https://afd.calpoly.edu/parking/slo/parking-on-campus/visiting-the-campus/) | HTML retrieved; actual payment conditions require confirmation |
| X | [Dedicated closure list](https://afd.calpoly.edu/parking/slo/lot-closures/) | HTML retrieved; check again before a trip |
| N | [Facilities notices](https://afd.calpoly.edu/facilities/about/news/) | HTML retrieved; scheduled changes may move |
| R | [City residential permits](https://www.slocity.org/government/department-directory/public-works/parking-services/residential-permits) | Official search-index text; direct fetch returned 403 |
| MH | [Monterey Heights district map](https://www.slocity.org/home/showpublisheddocument/3628/635546028948770000) | PDF text retrieved; visual geometry not verified |
| MU | [Murray district map](https://www.slocity.org/home/showpublisheddocument/3630/635496687412870000) | PDF text retrieved; visual fetch returned 403 |
| GIS | [City district GIS layer](https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/31) | Metadata retrieved; query not verified |
| G | [North Chorro Neighborhood Greenway](https://www.slocity.org/government/department-directory/public-works/programs-and-services/transportation-planning-and-engineering/north-chorro-neighborhood-greenway) | Official search-index text; direct fetch returned 403 |
| RR | [City parking rules](https://www.slocity.org/government/department-directory/public-works/parking-services/rules-regulations) | Official indexed text; downtown rule only |

## Maintenance and publication

Before production use, resolve logged policy conflicts, verify entrances and signs, review dataset reuse rights, and repeat the closure check. For the demo, unknown fields remain null and availability remains unknown. The JSON intentionally does not encode a blanket allowed/denied decision for each location.
