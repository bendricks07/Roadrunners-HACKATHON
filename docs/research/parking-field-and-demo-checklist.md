# Parking field survey and demo validation

Prepared November 14, 2026. This is a checklist and proposed interview guide, not completed testing or collected interview findings.

## Sign and entrance survey

For each location in [the research handoff](cal-poly-slo-parking-2026-11-14.md):

- [ ] Record location ID, observation date/time, and observer.
- [ ] Photograph entrance signs, supplemental notices, and the relevant curb/stall signs while safely parked or on foot.
- [ ] Record the actual vehicle entrance and permitted approach; distinguish it from the lot center.
- [ ] For streets, record both endpoints, side of street, sign arrows, and exceptions.
- [ ] Separate staff, guest, ADA, loading, EV, timed, resident, and commuter stalls.
- [ ] Record payment provider, posted zone, maximum stay, and displayed pricing.
- [ ] Check for temporary restrictions and affected dates.
- [ ] Confirm pedestrian exit and destination access; time the walk without presenting one measurement as universal.
- [ ] Verify step-free route details separately before labeling a route accessible.
- [ ] Exclude faces and readable plates from public research photos where possible.
- [ ] Log conflicting signs/pages as unresolved; obtain authoritative clarification.

Suggested record fields:

```text
location_id | observed_at | observer | segment_start | segment_end |
street_side | entrance_coordinates | sign_text | payment_zone |
maximum_stay | temporary_restriction | photo_paths | source_url |
unresolved_questions | reviewer | reviewed_at
```

## Acceptance scenarios for the builder

These expected behaviors are proposed requirements. They are not test results or a complete legal ruleset.

| Scenario | Expected behavior |
| --- | --- |
| Search without a permit | Show supported paid options and distinguish unknown eligibility |
| Select Structure 131 with an ordinary commuter permit | Do not assume Grand Avenue Structure rules apply; show the recorded exclusion and exceptions requiring review |
| Choose a three-hour stay in G2 without an applicable exception | Reject a two-hour session recommendation or require another location |
| Choose H14 | Require the correct subarea before selecting its rules |
| Old page suggests K1 | Dedicated closure exclusion prevents recommendation |
| H-2b construction dates overlap the stay | Show partial impact; do not close all of H2 |
| Facilities lists a closure but parking sidebar does not | Preserve the positive closure evidence and source conflict |
| Holiday year is missing | Do not apply 2023/2024 dates to 2026 |
| Parking expires at 14:00, walk is 12 minutes, buffer is 5 | Show return departure time of 13:43 |
| Payment expires after a posted maximum stay | Earlier applicable deadline controls |
| User opens an external payment service | Session remains unextended until payment is confirmed |
| Passenger leaves a vehicle | Require confirmation before starting a parking session |
| Location accuracy overlaps adjacent lots | Ask user to identify the location; do not silently choose |
| User walks away from the parked car | Keep session active |
| User crosses midnight in a district with overnight restrictions | Evaluate both dates and restriction transitions |
| Community report has expired | Mark stale; do not present as current confirmation |
| Notifications disabled/offline | Show reminder limitations; keep saved session details accessible |
| No occupancy source | Display unknown, not a fabricated open-space count |

## Five-minute demo script

1. Select a building and enter arrival, departure, and a permit.
2. Compare two researched parking choices; display eligibility reasoning and uncertainty.
3. Open directions only to a verified entrance, or label the destination as an unverified demo point.
4. Confirm parking manually and enter a hypothetical paid-through time.
5. Demonstrate the walk-back reminder using an explicitly accelerated demo clock.
6. Submit a clearly labeled fictional entrance-closure report.
7. Ask the assistant why a location was selected; show its supporting source.
8. Demonstrate one failure case: disabled notifications, missing rule, or adjacent-lot ambiguity.

Do not mix fictional reports or accelerated sessions into production observations.

## Short student interview guide

Ask three to five willing students; record anonymous summaries unless they explicitly agree otherwise.

1. Describe the last time parking made you late or caused confusion.
2. How do you currently decide where you can park?
3. Which permit or sign rules are hardest to understand?
4. Do existing payment reminders give you enough time to return?
5. When your preferred lot is full, what do you do?
6. What evidence would make you trust a recommendation or community report?
7. Which part of the prototype would you use first, and what is unclear?

Capture observations, requested features, contradictions, and next actions separately. Do not invent interview results or treat a small convenience sample as representative of all students.
