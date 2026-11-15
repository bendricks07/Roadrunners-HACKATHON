# Trip duration and parking limits

November 15, 2026, America/Los_Angeles.

The shared evaluator compares departure minus arrival against the applicable maximum stay before permit selection or general permit-hour exemptions. A longer trip turns the area red and shows the trip duration and allowed time. Exact equality does not trigger an over-limit warning. Missing rules never mean unlimited parking. Elapsed time crosses midnight/DST without silently resetting. Configured permit exemptions remain scoped to their own area (for example, G2 staff).

Abbott's 600-minute maximum comes from the user's reported sign information, not independent City verification. Both source centerline records are approximate display candidates; exact curbs, enforcement hours and exceptions remain unverified. The card and rules panel label the report and require sign checks. Below-limit trips still have unknown eligibility/occupancy. No new official limits are inferred for unrelated streets.

Searches of City sources did not establish an Abbott-specific 10-hour rule. The City's [general regulations](https://www.slocity.org/government/department-directory/public-works/parking-services/rules-regulations) describe 10-hour downtown meters, which is insufficient to validate Abbott. [Cal Poly's lot directory](https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/) continues to support G2's separate 2-hour maximum and staff exception.

All 55 Node tests and source syntax checks pass. New tests cover both Abbott IDs, 10:00/10:01/11:00 cutoffs, permit-independent warnings, G2 exceptions, multi-permit evaluation, DST/midnight, unknown rules, and rejection of overlong manual reminders. Rendered checks confirmed an 11-hour Abbott trip in red, an exact 10-hour trip without the over-limit warning, maximum/planned duration rows, disabled saving for an overlong trip, and retained red selection after switching Satellite to Dark. Phone document width stayed 390px.

Evidence: [desktop red warning](abbott-over-limit-desktop.jpg), [phone red warning](abbott-over-limit-phone.jpg). Publication provenance follows in [deployment notes](../../docs/deployment.md). Google remains untested without a key.

Published Site version 3 from GitHub app `8d60077`, Sites source `f555835`. [Hosted screenshot](abbott-over-limit-live.jpg) verifies the red Abbott warning, 11-hour trip and 10-hour reported maximum. The existing public project, URL and audience were preserved.
