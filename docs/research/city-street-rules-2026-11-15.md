# Cal Poly neighborhood street rules

Reviewed November 15, 2026. Coverage is all 42 street source sections currently mapped by the app, on ten roads, not every street in San Luis Obispo. No occupancy feed is connected.

## Primary evidence

- [City street layer 16](https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/16): exact street identities, address ranges, maintenance and side jurisdictions. A null RESTRC is not permission to park.
- [City parking-zone layer 31](https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/31): timed zones SLACK (OBJECTID 27, 2 Hr), LONGVIEW (29, 2 Hr), LOOMIS (30, 2 Hr), and ABBOT (38, 10 Hr). The source uses ABBOT although the street layer uses ABBOTT ST. District zones use RPD codes; timed zones have null codes and must not be treated as neighborhood permits.
- [City residential permits](https://www.slocity.org/government/department-directory/public-works/parking-services/residential-permits): Alta Vista weekday 2 AM-5 PM or 2 AM-10 PM by zone; Monterey Heights weekday 2 AM-10 PM; Murray weekday 8 AM-5 PM. City permits are distinct from Cal Poly products and apply only to their district's signed spaces.
- [City parking FAQ](https://www.slocity.org/services/how-do-i/faqs): public streets have a 72-hour same-space ceiling. This is a ceiling, not a verified local parking allowance; shorter signs can apply. Do not apply it to campus-maintained or mixed-jurisdiction sections.
- [Cal Poly ASI Recreation Center](https://www.asi.calpoly.edu/facilities/recreation-center/): free two-hour parking exists along Slack, Longview and Hathway. This page does not identify exact curb faces or exceptions; it does not establish a two-hour rule for all of Hathway. Longview is not an additional mapped street in this inventory.

## Scope and method

Street and zone geometry was inspected from the official service in memory. Nearby district associations were identified along sampled centerlines within 30 meters to catch opposite sides and boundary curbs. These are conservative proximity warnings, not verified legal curb assignments. Only factual source IDs, address ranges, zone attributes and reviewed associations are committed; no copied district polygon snapshot is bundled or redistributed. Tiny Grand junction segments were not assigned an adjacent timed-zone maximum. The branch contains no new runtime polygon requests.

The exact curb, enforcement hours of timed zones, exceptions, loading/disabled spaces, temporary signs, street sweeping and current closures still need a sign-level survey. No universal two-hour rule was found for all roads. No missing local rule is converted into green permission.

## Product behavior

- Each mapped section is selectable by source address range; these ranges identify source segments, not legal stall boundaries.
- Red means the trip exceeds the known mapped maximum or no selected City permit matches an active nearby district. The reason states the duration or district hours and warns about curb scope. Duration conflicts take priority and retain permit-warning context.
- Yellow means sign/side/local rules remain unresolved, including a selected City permit or an inactive district window. Having one of two adjacent districts' permits does not require holding both; choose the correct signed side.
- Blue on a timed street identifies reviewed maximum-time evidence, never a vacancy or full eligibility. Street rule colors are independent of the optional campus chance fixtures and survive map-style changes.
- Street review suggestions require a mapped shorter timed zone and a trip that fits with no current permit warning. Unknown local limits, 72-hour-ceiling-only sections and conflicts are excluded. Suggestions are explicitly areas to inspect, not guaranteed parking.
- City permits have their own multi-select settings, defaulting to none, separate from campus permits. Enforcement checks cover the entire trip in Los Angeles time; permit selections and trip values are memoization inputs.

## Section coverage

Nearby district evidence is not a blanket requirement for both sides of a street. A dash-equivalent Not established means no verified association was established, not no restrictions.

| Road | Street source ID | Address range | Time evidence | Nearby permit zones |
| --- | --- | --- | --- | --- |
| Fredericks St | 1953 | 1200-1299 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Fredericks St | 2146 | 1300-1499 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-5 PM) |
| Fredericks St | 1966 | 1500-1599 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-5 PM) |
| Fredericks St | 2147 | 1600-1619 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-5 PM) |
| Fredericks St | 2149 | 1620-1765 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-5 PM) |
| Loomis St | 2290 | 1800-1899 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Loomis St | 2291 | 1900-1999 address range | 2 hours, signed portions | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Loomis St | 2032 | 2000-2093 address range | 2 hours, signed portions | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Loomis St | 2151 | 2094-2099 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Loomis St | 2152 | 2100-2199 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Slack St | 3347 | 1400-1599 address range | 2 hours, signed portions | Alta Vista (Mon-Fri 2 AM-10 PM) |
| Slack St | 3379 | 1600-1799 address range | 2 hours, signed portions | Not established |
| Slack St | 3383 | 1820-1899 address range | Local limit unverified | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Slack St | 3375 | 1900-1999 address range | Local limit unverified | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Slack St | 3348 | 2000-2103 address range | Local limit unverified | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Murray Ave | 1401 | 800-899 address range | Local limit unverified; 72-hour City ceiling only | Murray (Mon-Fri 8 AM-5 PM) |
| Murray Ave | 1480 | 1000-1099 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Murray Ave | 2244 | 1100-1199 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Murray Ave | 1746 | 1200-1289 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Murray Ave | 2142 | 1290-1299 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Grand Ave | 2002 | 411-499 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Grand Ave | 1903 | 400-410 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM); Alta Vista (Mon-Fri 2 AM-5 PM) |
| Grand Ave | 2122 | 300-399 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM); Alta Vista (Mon-Fri 2 AM-5 PM) |
| Grand Ave | 1686 | 200-299 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM); Alta Vista (Mon-Fri 2 AM-5 PM) |
| Grand Ave | 2344 | 110-199 address range | Local limit unverified; 72-hour City ceiling only | Monterey Heights (Mon-Fri 2 AM-10 PM) |
| Grand Ave | 2322 | 106-109 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Grand Ave | 2323 | 104-105 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Grand Ave | 2326 | 102-103 address range | Local limit unverified | Not established |
| California Blvd | 2001 | 200-299 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| California Blvd | 2271 | 190-199 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| California Blvd | 2270 | 132-189 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| California Blvd | 3378 | 120-129 address range | Local limit unverified | Not established |
| Foothill Blvd | 1420 | 1000-1099 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Foothill Blvd | 2222 | 1100-1179 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Foothill Blvd | 2233 | 1180-1199 address range | Local limit unverified; 72-hour City ceiling only | Not established |
| Hathway Ave | 1639 | 300-399 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-5 PM) |
| Hathway Ave | 1843 | 200-299 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-10 PM); Alta Vista (Mon-Fri 2 AM-5 PM) |
| Hathway Ave | 1749 | 150-199 address range | Local limit unverified; 72-hour City ceiling only | Alta Vista (Mon-Fri 2 AM-10 PM); Alta Vista (Mon-Fri 2 AM-5 PM) |
| College Ave | 2296 | 110-189 address range | Local limit unverified | Not established |
| College Ave | 815 | 100-109 address range | Local limit unverified | Not established |
| Abbott St | 2173 | 1900-1999 address range | 10 hours, signed portions | Not established |
| Abbott St | 2333 | 1800-1899 address range | 10 hours, signed portions | Not established |

## Maintenance and verification

Update city-street-policy.js when official zone attributes change. Review source IDs, side jurisdiction, hours, exceptions and sign-level evidence before claiming complete eligibility. The current Abbott evidence supersedes its earlier user-reported provenance, while curb/hours uncertainty remains.

All 64 Node tests and source syntax checks pass. Added checks cover all sections, Slack versus eastern blocks, Abbott source identity, independent City permits, district boundary hours and whole-trip overlap, mixed district sides, the non-recommendable City ceiling and filtered street suggestions. See artifacts/city-street-rules for browser evidence.
