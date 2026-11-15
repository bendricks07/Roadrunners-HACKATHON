# Reviewed campus permit statuses

Checked November 15, 2026. These findings concern permit requirements, not empty-space counts, a surveyed stall, or complete parking eligibility.

## Sources and findings

- [TAPS enforcement hours](https://afd.calpoly.edu/parking/slo/parking-on-campus/enforcement-hours): general enforcement is Monday-Thursday 7 AM-10 PM and Friday 7 AM-5 PM, with shorter academic-break hours. Residential, timed, special and other signed restrictions have exceptions. Its holiday list contains obsolete dates; do not generate a current holiday calendar from it.
- [Academic Personnel handbook](https://academic-personnel.calpoly.edu/content/handbook/emplinfo): confirms the ordinary-space weekend window from Friday 5 PM to Monday 7 AM, subject to posted exceptions. The app checks the entire trip and displays the next regular enforcement start. An exemption from general permit enforcement does not establish overnight storage rights.
- [Current lot directory](https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/): identifies ordinary commuter/staff spaces in the facilities below. Facility classifications do not authorize special stalls. G2, residential 131/R3/R4, mixed H14, C6, construction areas, and unknown subareas are excluded from the general exemption mapping.
- [2026-27 commuter guide](https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/general): Grand Annual covers Grand and listed commuter facilities; ordinary Commuter Annual lists Grand only after 5 PM. The app distinguishes these products within their published academic-year dates and does not claim an overnight product match.
- [Dedicated closure list](https://afd.calpoly.edu/parking/slo/lot-closures/): retains existing permanent closures. H11 remains a source conflict: the directory index calls it closed for construction, while the dedicated closure page does not resolve its status. No reopening is inferred.

## Implemented scope

Reviewed ordinary-space facilities: Grand Structure 130, H1, H12, H16, H13, H15, H14A, C1, C2, C5, C7, H2, H4, H10, Dairy, Crops, Poultry and Meat Processing (18 records). Some facility records have no verified map geometry; their searchable cards still provide the rule.

Blue means a researched permit rule, such as **No general permit required** or **Permit matches general spaces**. It never means an empty space. Red missing-permit and mismatch reasons still take precedence. Overall policy completeness and occupancy remain unknown. Rules & details supplies a source link, review date and scope.

No new definitive City curb permissions were established. The City permit webpage returned HTTP 403 to this research client; existing district guidance remains available, but centerlines and historical district reports cannot verify an individual current curb. No vacancy feed was found or connected.

## Validation

50 tests pass. New checks cover Friday/Monday boundaries, a stay extending one minute into enforcement, weekday night/evening hours, both DST weekends, all 18 reviewed identities, exclusions, closures, product differences and guide date limits. Rendered Grand's weekend label, Monday 7:01 AM red warning, source details and 390px phone layout were checked. Evidence is in [researched-permit-status](../../artifacts/researched-permit-status/).
