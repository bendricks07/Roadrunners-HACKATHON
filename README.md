# Roadrunners HACKATHON

## App planning note: CampusCurb

> **Status: proposed product outline, not an implemented app.** Added November 14, 2026. CampusCurb is a working name, not a finalized brand. Features, integrations, and release stages below describe the intended product. Local rules and sources must be verified before use in a live app.

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

## Team implementation and collaboration guide

> Planning guidance added November 14, 2026. Ownership below uses Person A/B/C until the team assigns names. Suggested paths, interfaces, branches, and supporting documents are proposals, not existing implementations. No application features are implemented by this note.

### Three-person subsystem split

Give each person ownership of both the screens and logic for a complete subsystem so work can progress independently.

| Owner | Subsystem | Responsibilities | First working milestone |
| --- | --- | --- | --- |
| Person A | Discovery and navigation: “Where should I park?” | Map, campus destination search, parking cards, filters, comparison, directions, saved destinations | Search for a building, compare parking, and open directions |
| Person B | Parking sessions and reminders: “I parked—help me manage it” | Manual parking, saved car location, timer, return-walk buffer, notifications, departure confirmation, later automatic detection | Start a session and receive a return reminder |
| Person C | Rules, AI, and community updates: “What are the rules, and what changed?” | Cal Poly dataset, permit eligibility, restriction evaluation, AI answers, closure reports, report storage and moderation | Evaluate parking eligibility, explain the result, and submit a closure report |

Assign roles by interest: A suits visual design and maps; B suits mobile/device work; C suits backend logic and AI. Person C has substantial scope: keep the initial assistant simple and source-grounded, and start reporting with a structured form and feed before sophisticated moderation.

### Agree on subsystem interfaces before coding

In the first shared session, agree on:

- One application framework and deployment approach.
- Shared navigation and visual components.
- Parking-area and session data formats.
- Interfaces between the three subsystems.
- A small, verified Cal Poly dataset everyone can use.

| Shared record | Required information |
| --- | --- |
| Parking area | Stable ID, name, boundary, entrance, jurisdiction, source |
| Eligibility result | Eligible/ineligible/unknown, reasons, next restriction time |
| Availability observation | Status, source, observation time, confidence |
| Parking session | Parking-area ID, actual start, paid-through time, applicable deadline |
| Community report | Location, type, observed time, expiry, verification status |

**Use one rules evaluator throughout the app.** Person A uses its results to filter recommendations; Person B uses its deadlines for reminders; Person C uses its results to ground AI explanations. This keeps the map, timer, and assistant consistent.

Person B owns session state. Other subsystems request changes through the agreed interface instead of creating independent timers.

### Branch and pull request workflow

Use one shared repository, a stable `main`, and short feature branches. A permanent `develop` branch is unnecessary for the initial three-person workflow.

| Owner | Example feature branches |
| --- | --- |
| Person A | `codex/parking-map`, `codex/destination-search`, `codex/navigation-links` |
| Person B | `codex/manual-parking-session`, `codex/return-reminders`, `codex/parking-detection` |
| Person C | `codex/calpoly-parking-data`, `codex/eligibility-rules`, `codex/assistant-reports` |

Use a branch for each deliverable rather than keeping one enormous branch per person for the whole project.

1. Start a feature branch from current `main`.
2. Make a small, working change.
3. Push it and open a pull request.
4. Have one teammate review it.
5. Merge once it works and relevant checks pass.
6. Start the next feature from updated `main`.

Integrate throughout development so the team does not discover incompatible implementations at the end. For shared interfaces, agree on changes before implementing dependent work.

### Suggested file ownership

This organization is illustrative and does not require a particular framework:

```text
src/
  features/
    discovery/       # Person A
    parking-session/ # Person B
    assistant/       # Person C
    reports/         # Person C
  shared/
    components/
    types/
    navigation/
  services/
    parking-rules/   # Person C; shared interface
    notifications/   # Person B
    navigation/      # Person A
data/
  campuses/
    cal-poly-slo/    # Person C
```

Assign one person to coordinate shared setup files, dependencies, and application navigation. Everyone can propose changes, but avoid simultaneous unrelated edits to those files.

Populate `AGENTS.md` with subsystem ownership, run/check commands, shared data definitions, and rules for changing interfaces. Include these requirements:

- Do not invent parking restrictions or availability.
- Clearly label simulated data.
- Coordinate changes to shared interfaces before dependent implementation.

Example task for an individual Codex session:

> Implement manual parking sessions in the parking-session module. Use the shared parking-area IDs and eligibility result. Coordinate any shared interface changes before modifying them.

### Build and integration sequence

| Stage | Person A | Person B | Person C |
| --- | --- | --- | --- |
| Foundation | App shell and map/list | Session model and basic screen | Shared types and verified sample data |
| First integrated flow | Select a parking option | Start session manually | Evaluate permit and time eligibility |
| Core experience | Directions and walking estimate | Return reminders and saved car | AI explanations and closure reporting |
| Polish | Filters and backup options | Notification reliability | Source timestamps and report expiry |
| Stretch | Richer route previews | Automatic parking detection | Availability experiments |

The first end-to-end milestone is:

**Select destination → choose eligible parking → navigate → confirm parked → receive reminder.**

### Satellite imagery and empty-space detection

Satellite imagery could support an experiment, but it should not be the initial live parking-availability system. Image detail, freshness, and visibility are separate limitations.

| Imagery option | Potential use | Main limitation |
| --- | --- | --- |
| Satellite basemap | Help users recognize lots and entrances | Does not establish current occupancy |
| Free Sentinel-2 imagery | Broad land and environmental analysis | Finest bands are 10 metres per pixel, too coarse for individual parking spaces |
| Commercial high-resolution imagery | Potentially estimate visible vehicles in a captured scene | Captures are intermittent and require suitable imagery access |
| Authorized fixed camera | Estimate occupancy in a visible part of a lot | Requires permission, coverage, and testing |

Sentinel-2's resolution rules it out for individual parking-space detection. [Copernicus specifications](https://documentation.dataspace.copernicus.eu/Data/SentinelMissions/Sentinel2.html)

Commercial SkySat products are sampled at approximately 50 centimetres per pixel, making vehicle detection a plausible experiment. Its advertised revisit capability is up to 10 times daily, not a continuous feed or a guaranteed schedule for a particular lot. Occupancy can change before a driver arrives. [Planet SkySat documentation](https://docs.planet.com/data/imagery/skysat/)

Trees, shadows, covered spaces, and garage interiors further limit overhead imagery. A model also needs mapped parking spaces: the absence of a vehicle does not establish that an area is a valid parking space.

**Recommended availability progression**

1. **Initial release: recent community observations.** Display statements such as “Reported full 4 minutes ago” and expire observations quickly.
2. **Pilot: an authorized camera or campus data partnership.** Test a small lot with defined coverage. An accessible Cal Poly live occupancy feed has not been verified; treat it as a partnership opportunity.
3. **Later: historical availability estimates.** Predict how busy a lot may be at a given time, with confidence and freshness displayed. Distinguish predictions from live measurements.

For a hackathon computer-vision demonstration, use an authorized image or recording of one lot, mark its stalls, classify each as occupied/free/unknown, and display the capture time. Clearly label prerecorded results as a demonstration.

Use imagery with appropriate analysis rights. Google Maps Platform restricts extracting content and creating derived content from its imagery; screenshots are not automatically an unrestricted analysis dataset. [Google Maps Platform FAQ](https://developers.google.com/maps/faq)

Keep computer vision as a stretch task after the shared parking flow works.

### Sharing context across three Codex sessions

Connecting everyone to the GitHub repository shares code and committed files. It does not automatically share every teammate's conversation. A built-in feature continuously combining conversations across three separate accounts was not verified when this guidance was written.

Use shared project notes as the team's durable context:

| File | Purpose |
| --- | --- |
| `README.md` | App vision, feature outline, and collaboration guide |
| `AGENTS.md` | Repository instructions each teammate's Codex should follow |
| `docs/architecture.md` | Subsystem boundaries, shared data formats, and interfaces |
| `docs/decisions.md` | Agreed decisions and their reasons |
| `docs/status/discovery.md` | Person A's progress, blockers, and handoffs |
| `docs/status/parking-session.md` | Person B's progress, blockers, and handoffs |
| `docs/status/intelligence.md` | Person C's progress, blockers, and handoffs |

`AGENTS.md` is recognized by Codex for repository instructions. The other filenames are team conventions: explicitly instruct Codex to read them. These supporting documents still need to be created and populated; listing them here does not create them. [Codex repository instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [development context workflow](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex)

**At the start of a task**

1. Bring the latest shared changes into the working branch without discarding local work.
2. Ask Codex to read shared instructions, agreed decisions, and relevant status files.
3. Work on the assigned subsystem.

**Before handing work off**

1. Have Codex summarize completed work, interface changes, blockers, and what teammates need to know.
2. Update that subsystem's status file.
3. Commit and push the changes, then share the pull request.

Changes only on a teammate's laptop, or on a branch others have not read, do not automatically become shared context. Reading a shared file is a point-in-time action, not continuous synchronization. Distinguish proposed decisions from agreed decisions and merged behavior.

**Starter prompt for all three teammates**

> Before working, read AGENTS.md, README.md, docs/architecture.md, docs/decisions.md, and the subsystem status files. Identify any that do not exist yet. Summarize relevant decisions and dependencies. Distinguish proposals from agreed decisions. Before finishing, update my subsystem's status with completed work, changed interfaces, blockers, and handoff instructions.

**Optional future automation**

A custom shared service or MCP integration could let each Codex read and publish team updates. It would require setup, permissions, and explicit instructions about when to check it. This is a designed context-sharing workflow, not automatic access to everyone's private chats. For the hackathon, begin with versioned GitHub notes rather than building a coordination service.
