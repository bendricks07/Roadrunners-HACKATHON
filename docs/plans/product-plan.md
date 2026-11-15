# CampusCurb product plan

> Original planning material added November 14, 2026, moved from the repository README without removing its feature proposals. For implemented behavior, read the [current app status](../status/discovery.md) and [architecture](../architecture.md).

> **Status: product outline; only the browser-demo subset above is implemented.** Added November 14, 2026. CampusCurb is a working name, not a finalized brand. Features, integrations, and release stages below describe the intended product. Local rules and sources must be verified before use in a live app.

The app is a parking companion that answers four questions: **Where can I park, can I stay there, when should I head back, and how do I get there?**

This outline focuses on **Cal Poly San Luis Obispo and its immediate surroundings**, with a structure that can later support other universities.

### 1. Product vision

CampusCurb helps students, employees, and visitors find suitable parking, understand restrictions, remember their parked car, and return before their parking permission ends.

The app follows the whole trip:

**Choose a destination → compare parking → navigate → confirm parking → monitor the session → receive reminders → return to the car.**

Its main advantage is personalized guidance based on the driver's permit, destination, arrival time, and planned departure.

The app must distinguish:

- **Eligibility:** Whether the driver appears permitted to park there.
- **Availability:** Whether spaces are known or expected to be open.
- **Confidence:** How current and reliable that information is.

A lot can be eligible while its availability is unknown.

### 2. Initial audience and geographic coverage

**Primary users**

- Commuter students traveling to class.
- Students visiting campus without a long-term parking permit.
- Faculty and staff.
- Visitors attending tours, performances, sporting events, or meetings.
- Residents who need help understanding where their existing permits apply.

**Initial coverage**

- Cal Poly SLO parking lots and structures.
- Verified public street parking immediately around campus.
- Nearby residential permit districts, displayed with their restrictions.
- Legitimate nearby paid parking where public access is verified.
- Campus destinations, lot entrances, and pedestrian connections.

Start with a carefully verified area around the campus boundary, then expand coverage as the data becomes dependable.

Cal Poly identifies commuter parking by permit category, including specific H lots and structures. Categories must come from current official records. [Cal Poly commuter parking](https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/general)

**A Cal Poly permit and a City of SLO residential permit are separate permissions.** Nearby residential streets cannot be treated as generally available student parking. [SLO residential permits](https://www.slocity.org/government/department-directory/public-works/parking-services/residential-permits)

### 3. Find and compare parking

The home screen opens to a campus map with the prompt: **Where are you going, and how long will you stay?**

Users can search by building name, building number, campus landmark, or address.

**Inputs**

- Destination.
- Arrival date and time.
- Intended departure time.
- Existing permit type and expiration.
- Maximum walking time.
- Budget.
- Optional accessibility, EV charging, or motorcycle requirements.

**Parking results**

| Suggestion | What it prioritizes |
| --- | --- |
| Best overall | A balance of cost, walking time, and dependable information |
| Closest eligible | Shortest suitable walk to the destination |
| Lowest cost | Lowest estimated total parking cost |
| Best for a long stay | Permission covering the intended duration |
| Off-campus option | A verified nearby alternative with applicable street restrictions |
| Backup choice | Another suitable location if the first is full |

**Each result shows**

- Lot name or precise street segment.
- On-campus or off-campus designation.
- Relevant permit or payment requirement.
- Whether it fits the **entire planned stay**.
- Estimated total cost, with unknown fees identified.
- Driving time and walking time separately.
- Next restriction change.
- Current closures or access issues.
- Availability status and observation time.
- Source and last verification date.
- **Navigate**, **View rules**, and **Save** actions.

**Recommendation logic**

First filter out options that fail known requirements: incompatible permits, active closures, insufficient permitted duration, or unmet vehicle/accessibility restrictions. Then rank remaining choices by the user's preferences.

Unknown eligibility belongs in a separate **Check before parking** group. It must never receive a confident recommendation.

For street parking, rules attach to the specific block and side of the street. Exact spaces still need checking against signs and curb markings.

### 4. Parking detection

Recognize a likely parking event and make starting a session easy.

**Recommended experience**

1. The phone detects a possible transition from driving to walking.
2. The app identifies nearby parking areas.
3. It asks: **Did you park here?**
4. The user confirms the lot or moves the pin.
5. The app asks for missing payment or time-limit information.
6. The session begins, and reminders are scheduled.

**Useful detection signals**

- Driving followed by a stop and walking.
- Location within a mapped parking area.
- An active trip to a selected lot.
- Optional vehicle connection signals where supported by the device.

Treat these as supporting evidence. A passenger leaving a car, a bus trip, or a brief drop-off can resemble parking.

Android provides activity transition tools suitable for detecting changes such as leaving a vehicle and beginning to walk. Background behavior remains subject to platform permissions and operating conditions. [Android activity recognition](https://developer.android.com/codelabs/activity-recognition-transition)

**Manual fallback**

A prominent **I parked** button lets users:

- Drop or adjust a pin.
- Select the lot or street segment.
- Enter the actual parking start time.
- Enter paid-through time.
- Add structure level, row, and a photo.
- Add a note such as “near the south staircase.”

GPS must not claim to identify a specific garage floor or parking stall. Detection may occur after parking, so users must be able to correct arrival time instead of silently starting a fresh time allowance.

**Departure detection**

Offer **Have you left?** when movement suggests departure, with a manual **End session** action. Walking away from a parked car must not end its session.

### 5. Smart expiration and return reminders

The active parking screen shows two separate times:

> **Parking permission ends at 2:00 PM**
>
> **Start walking back by 1:43 PM**

The second time accounts for the walk back and a user-selected buffer.

**What can create a deadline**

- Paid parking expiration.
- Maximum stay duration.
- Permit expiration.
- A change in permit eligibility.
- An upcoming closure.
- A temporary restriction or applicable street restriction.
- The end of an overnight parking allowance.

Calculate the earliest applicable restriction rather than watching only the payment timer.

**Reminder options**

- Advance warning, such as 30 minutes before the deadline.
- Personalized **Head back now** notification.
- Final reminder.
- Expired-session warning.
- New closure or restriction affecting the parked vehicle.

**Notification example**

> **Time to head back**
>
> Your parking ends in 17 minutes. Your estimated walk is 12 minutes, plus your 5-minute buffer.

**Actions**

- Walk to my car.
- View the restriction.
- Open the official payment service.
- Update confirmed payment time.
- Find another suitable location.
- End the session.

**Payment rules**

A reminder snooze must not extend the parking allowance. Opening a payment app must not count as a completed purchase.

Until an authorized integration confirms payment, the user must enter or confirm the new paid-through time. Offer an extension only where applicable rules allow it.

Cal Poly lists ParkMobile and PayByPhone for designated hourly and daily parking locations; availability must be checked for each area. [Cal Poly parking fees and payment options](https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/fees)

**Reliability**

Use device-scheduled reminders for known deadlines and server notifications for changing conditions. Clearly indicate when notifications are disabled or background detection is unavailable. Background location requires deliberate platform support and cannot be assumed to run continuously. [Apple background location documentation](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background)

### 6. Directions to parking and the final destination

Directions are feasible. The first release should launch an established navigation app.

**Three navigation stages**

1. Drive to the parking entrance.
2. Walk from parking to the destination.
3. Walk back to the saved car.

Store verified vehicle entrances separately from lot center points. Also store pedestrian exits where available.

**First-release experience**

- Choose a parking result.
- Review entrance instructions and known access issues.
- Tap **Navigate**.
- Open Google Maps or another supported maps app.
- Return to CampusCurb to confirm parking.

Google Maps supports cross-platform links for directions without requiring a Maps API key for the link itself. [Google Maps directions links](https://developers.google.com/maps/documentation/urls/get-started)

**Later improvements**

- Embedded route previews.
- Alternate entrances.
- Verified step-free pedestrian routes.
- Closure-aware walking routes.
- A quick switch to the backup parking choice.

Sending a destination to an external navigation app does not automatically make it honor every closure reported in CampusCurb. Show that limitation and avoid implying that a report has already changed the external route.

### 7. AI parking assistant

Answer questions using verified parking information and the same rules used by the map.

**Example questions**

- “Where can I park near the library until 6?”
- “Does my permit work in this lot?”
- “Can I stay here overnight?”
- “Where is the closest off-campus option for a two-hour visit?”
- “Why did you recommend this lot?”
- “When should I leave class to get back to my car?”
- “Does this closure affect my route?”

**Answer format**

Every location-specific answer includes a direct answer, relevant assumptions, applicable time window, official source, last verification date, and a map or session action where useful.

If the answer depends on missing information, ask for it: **Which permit do you have, and when do you plan to leave?**

**Dependable behavior**

The assistant retrieves approved information and asks a structured rules system to evaluate eligibility. It then explains that result in plain language.

It must:

- Identify conflicting or outdated information.
- Separate community observations from official restrictions.
- Say when eligibility cannot be confirmed.
- Avoid inventing prices, availability, permit exceptions, or completed payments.
- Treat uploaded signs and reports as evidence to examine.

**Later addition: sign-photo assistance**

Users photograph a parking sign. The assistant extracts visible restrictions and explains them, showing the image and extracted text for confirmation. Account for incomplete photos, nearby supplemental signs, temporary notices, and curb markings.

### 8. Community parking updates

Give users a structured way to report local changes.

**Report categories**

- Road or lot entrance closure.
- Partial lot closure.
- Temporary no-parking signs.
- Construction.
- Blocked pedestrian path or accessibility route.
- Broken payment equipment.
- Incorrect map information.
- Lot reported full.
- Reopening or resolved issue.

**Submission fields**

- Map pin, street segment, lot, or entrance.
- Category.
- Observation time.
- Optional end time.
- Short description.
- Optional photo.

**What other users see**

> **Entrance closure reported**
>
> Observed 12 minutes ago · Community report · Not yet independently verified.

**Report lifecycle**

- Newly reported.
- Corroborated.
- Officially confirmed.
- Disputed.
- Resolved.
- Expired and awaiting recheck.

Use different expiry periods by report type. A “lot full” observation becomes stale much faster than a photographed construction closure.

**Quality controls**

- Combine duplicate reports.
- Allow **Still present** and **Resolved** confirmations.
- Distinguish independent observations from repeated reposts.
- Flag suspicious activity for review.
- Blur faces and plates in public photos.
- Provide moderation and correction history.

Multiple votes can strengthen an observation, but they do not establish an official parking rule.

Connect reports to the rest of the product: relevant closures appear in search results, on the map, and in affected parking sessions.

### 9. Additional beneficial features

| Feature | Benefit | Priority |
| --- | --- | --- |
| Find my car | Saved location, level, photo, and return directions | First release |
| Future-time planning | Check parking for tomorrow's class or an evening event | First release |
| Favorites | Save buildings, preferred parking, and backup choices | First release |
| Permit wallet | Store permit type, validity dates, and applicable zones | First release |
| Recommendation explanation | Make recommendations understandable | First release |
| Offline session details | Keep the saved car and known deadline accessible | First release |
| Notification health check | Reveal disabled reminders before users rely on them | First release |
| Calendar integration | Suggest departure time for class, including walking | Later, opt-in |
| Accessibility information | Surface verified spaces and suitable pedestrian access | Foundational data; expand coverage carefully |
| EV charging details | Show charger information separately from parking eligibility | Later |
| Cost history | Compare occasional payment with permit options | Later |
| Transit alternatives | Offer another way to campus when suitable parking is limited | Later |
| Occupancy estimates | Compare likely availability | Only after sufficient reliable data |

Accessibility information includes verification status. A nearby accessible space does not establish that the whole route is accessible.

Availability labels must be explicit: **Unknown**, **Recently reported full**, or **Estimated availability**. Do not show exact open-space counts without a dependable source.

### 10. App structure

Use four primary tabs, with profile/settings accessible from an icon.

| Tab | Main purpose |
| --- | --- |
| Explore | Map, destination search, filters, recommendations, directions |
| My Parking | Active session, deadlines, car location, payment links, return route |
| Ask | AI questions grounded in the selected location or session |
| Updates | Nearby closures, community reports, and report submission |

**Supporting screens**

- Parking location details.
- Plan a future visit.
- Permit and vehicle profile.
- Saved destinations.
- Notification and detection settings.
- Source details and correction requests.

**Onboarding**

Ask only what is needed initially: campus, permit status, and optional preferences. Request location, motion, and notification permissions when their purpose becomes relevant. Users can still search manually without enabling automatic detection.

### 11. Cal Poly SLO data and verification plan

The first release needs a dependable local dataset.

**Campus records**

- Lots, structures, and boundaries.
- Vehicle entrances and pedestrian exits.
- Permit eligibility.
- Payment zones.
- Enforcement schedules and exceptions.
- Time limits.
- Event restrictions.
- Current closures.
- Buildings and destination aliases.

**Immediately off-campus records**

- Residential permit district boundaries.
- Exact street segments and applicable sides.
- Posted restrictions and time windows.
- Public access conditions.
- Relevant temporary restrictions.
- Verified pedestrian connections.

The city publishes a residential parking district GIS layer that could help establish boundaries, subject to checking its currency and permitted use. It does not replace individual street restrictions. [SLO residential parking GIS](https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/31)

**Local details the product must handle**

- Cal Poly's published enforcement schedule includes exceptions for residential areas, special spaces, and other restrictions. A broad weekend or evening shortcut is inadequate. [Cal Poly enforcement hours](https://afd.calpoly.edu/parking/slo/parking-on-campus/enforcement-hours)
- Cal Poly states that campus signs supersede website information. Provide a visible way to flag a discrepancy. [Cal Poly permit guidance](https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/)
- Facilities notices include partial parking closures and pedestrian impacts, making them relevant to parking and walking directions. [Cal Poly facilities notices](https://afd.calpoly.edu/facilities/about/news/)

**Verification workflow**

Collect the source → record applicable dates → review the rule → check mapped boundaries → publish → monitor changes → reverify.

Conflicting sources trigger review and reduced confidence. Holiday and academic schedules must be maintained by year.

### 12. Architecture that supports expansion

Build around a reusable parking model, with Cal Poly SLO as the first campus configuration.

| Record | Purpose |
| --- | --- |
| Campus | Identity, boundary, timezone, destinations, official sources |
| Jurisdiction | University, city, or private operator controlling the rules |
| Parking area | Lot, structure section, street segment, or special-space group |
| Entrance and path | Driving access and pedestrian connections |
| Permit type | Eligibility and validity requirements |
| Parking rule | Conditions, time windows, exceptions, and effective dates |
| Price schedule | Costs, payment zones, and payment links |
| Temporary restriction | Closures or overrides for a defined place and time |
| Parking session | Confirmed location, arrival, payment, and calculated deadlines |
| Community report | Observation, evidence, status, and expiry |
| Source record | Origin, verification time, and change history |

**Shared services**

- Parking eligibility evaluator.
- Recommendation ranking.
- Session and reminder management.
- Map and navigation integration.
- AI retrieval and explanations.
- Community moderation.
- Data administration.

**Expansion process**

Adding a university means creating and validating a new campus dataset: jurisdictions, permits, rules, maps, calendars, and sources. The interface, session system, assistant, and reporting tools remain reusable.

**Essential internal tool:** An administrator dashboard for correcting rules, reviewing reports, tracking stale sources, and publishing scheduled changes. Data maintenance is a core product function.

### 13. Privacy, accessibility, and reliability

**Location privacy**

- Make automatic detection optional.
- Prefer processing detection signals on the device.
- Keep parked-car locations private.
- Avoid retaining full travel histories by default.
- Allow session-history deletion.
- Keep individual movement data out of university dashboards.
- Make aggregate analytics explicitly opt-in and privacy-preserving.

**Usability**

- Large controls and clear time displays.
- Screen reader support.
- Icons and text alongside map colors.
- Clear notification explanations.
- A minimal driving view.
- No reporting or complex interactions required while moving.

**Failure handling**

Provide a visible fallback or uncertainty message when:

- GPS places the user between two lots.
- A parking structure obscures location.
- Notifications are disabled.
- Connectivity disappears.
- Background detection misses an event.
- A source is stale.
- A payment extension is unconfirmed.
- The selected location is full.

### 14. Recommended release sequence

| Stage | Scope |
| --- | --- |
| Hackathon demonstration | Curated Cal Poly dataset; map/list comparison; manual parking; working timer where supported; walking-buffer reminder; directions link; grounded AI questions; report submission |
| Small campus pilot | Verify mapped locations in person; test reminders on real devices; establish moderation; evaluate automatic detection |
| Public Cal Poly release | Tested opt-in detection; broader verified off-campus coverage; dependable source maintenance; production notification monitoring |
| Expansion | Additional campuses, authorized integrations, richer routing, and validated availability estimates |

For demonstrations, simulated detection or occupancy must be labeled clearly.

**Platform recommendation:** Use a mobile app with native location and notification support for the full parking-detection experience. A mobile-friendly web prototype can demonstrate the planning flow, but background detection needs separate device validation.

**Defer initially**

- Custom turn-by-turn navigation.
- Direct payment processing.
- Exact real-time stall availability.
- Parking reservations.
- Broad social features.

These add significant integration work before the core parking experience is proven.

### 15. Validation and success measures

**Core scenarios to test**

- A user's permit becomes invalid before the planned departure.
- Payment ends after a separate maximum-stay deadline.
- A street restriction starts during the planned stay.
- A closure affects only one lot entrance.
- A passenger's phone incorrectly suggests parking.
- GPS cannot distinguish adjacent parking areas.
- A reminder must include a long return walk.
- A user opens a payment service but does not complete payment.
- The app has cached information while offline.

**Product measures**

- Time from opening the app to selecting suitable parking.
- Percentage of users successfully starting a session.
- Detection accuracy and missed parking events.
- Observed reminder delivery and timeliness.
- Frequency of incorrect eligibility guidance.
- Percentage of rules with current verification.
- Time to resolve reports and source conflicts.
- User corrections and repeat usage.

Incorrect confident eligibility guidance is a particularly serious defect.

### 16. Example complete experience

*Illustrative timing, not a statement of a particular location's rules.*

A commuter searches for parking near the library from 11:00 AM until 2:00 PM.

CampusCurb checks the permit and presents three suitable choices: one closest, one lower-cost option, and one backup. Each includes the walk, applicable restrictions, and availability confidence.

The user navigates to the selected entrance. After arrival, the app suggests that they have parked. They confirm the location and enter the paid-through time.

The session ends at 2:00 PM. With a 12-minute return walk and a 5-minute buffer, the app schedules a **1:43 PM Head back reminder**.

During the session, a pedestrian exit closure is reported. The app identifies its verification status and offers an alternate return path if one is verified.

The user walks back, locates the car using the saved photo, and ends the session.

**This complete journey guides the design: every major feature helps the user make a parking decision, manage the stay, or return to the car.**
