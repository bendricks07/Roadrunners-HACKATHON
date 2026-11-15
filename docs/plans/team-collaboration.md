# Team collaboration proposal

> Original planning material added November 14, 2026, moved from the repository README. Person A/B/C assignments, suggested paths and interfaces remain proposals. The current workflow is in [CONTRIBUTING.md](../../CONTRIBUTING.md); repository instructions remain in [AGENTS.md](../../AGENTS.md).

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
