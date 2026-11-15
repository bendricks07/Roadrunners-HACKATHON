# Verity: CampusCurb browser demo

Date: November 14, 2026. Branch: `Verity`.

## Baseline and publication scope

- Repository: `bendricks07/Roadrunners-HACKATHON`.
- Started from `origin/codex/campuscurb-demo` at `d08086d2edad09f681c555bbaa26cf67d0b46ff8`.
- No existing local/remote Verity branches or matching run subjects were found. This is the unnumbered first run.
- Public judge demo: https://campuscurb-roadrunners-demo.buffrhubarb.chatgpt.site/.
- `docs/deployment.md` identifies deployed app source `57e45bfa9b2edf919636816194075f2446e02eb3`. The branch baseline has the same demo application files; its later commit documents publication.
- Changes are validated against the local branch preview at `http://127.0.0.1:5174/`. Port 5173 had an unresponsive listener, so a separate loopback preview was used.
- Publication for this run means pushing this GitHub branch. It does not deploy over the public judge demo or merge into main.

## Findings and fixes

| Finding | Change |
| --- | --- |
| Destination search did not implement arrow-key/Enter selection | Added ArrowUp/ArrowDown, Enter, Escape and focus-exit behavior; preserve focus after selection and synchronize expanded state |
| Interactive parking markers were descendants of an SVG exposed as a single image | Expose the interactive map as a group so named marker controls remain available; compact map illustrations remain images |
| Replacing an open dialog's content left focus on the page body | Focus the new form's first control, or the first action for non-form dialogs |
| Asking about overnight parking returned eligibility for the current short demo stay | Explicitly state that future-day, overnight, weekend and holiday permission cannot be verified by these sample rules |
| Persisted report arrays could contain null or malformed records and crash restoration | Validate saved-state shape and normalize reports; reject invalid types, dates and IDs, deduplicate, and retain local unverified provenance |
| Duplicate path reports could double-count the same detour | Deduplicate restored IDs before evaluating walks |
| Report expiry could leave the visible feed/map stale without a session | Check active-report identity changes during clock updates and refresh derived views |
| Timed refreshes could erase a question being typed | Preserve focused text, selection and filtered destination suggestions during timer refreshes |
| Other browser tabs synchronized sessions/reports but not related preferences | Synchronize permit, destination, duration, favorites and appearance, including storage-clearing events; preserve focused drafts |
| Whitespace-only report submissions silently did nothing | Show inline native validation, cleared as the user edits |
| Single eligible result said “1 options” | Correct singular wording |
| Every time label recreated its formatter | Reuse one America/Los_Angeles formatter |

Initial report fixtures are cloned before mutation so clearing saved state does not reuse mutated defaults.

## Browser verification

Manually exercised with the supported in-app browser, in local demo storage only. Desktop viewport: 1280 × 720. Phone viewport: 390 × 844, checked against the page's actual dimensions.

| Flow | Outcome |
| --- | --- |
| Destination search: matching and no-match text | Matching choices and useful no-match message shown |
| Destination keyboard navigation | Arrow selects a choice; Enter changes the destination; selected input retains focus; Escape closes suggestions with expanded=false |
| Permit unknown and visitor choices | Unknown remains separate from positive eligibility; incompatible options are not startable |
| Stay longer than a fixture's maximum | Library West's three-hour plan rejected; start action disabled |
| Best-match, closest and lowest-cost controls | Controls update selected ranking and results |
| Parking details and favorite toggle | Detail record and saved indicator update |
| Rules/source and route-preview dialogs | Open and close; show simulation limits; external link targets inspected |
| Manual session from route dialog | Correct setup form; starts session with private note |
| Walkway report | Return walk increased by three minutes and head-back time moved earlier |
| Closure report | Local feed updated, recommendation excluded, parked-session warning shown |
| Whitespace report | Validation message displayed; meaningful replacement text submits successfully |
| Note edit and reload | Note and absolute deadline retained |
| Return-route dialog and reminder preview | Correct session location/note; preview does not extend the deadline |
| Guide overnight question | Explicit unknown answer instead of current-stay approval |
| Two tabs | Permit/appearance changes appear in the other tab; ending a session removes its active indicator there |
| 90-second demo | Active, automatic head-back and expired states observed; focused question draft survived the reminder; expired state persisted after reload |
| End session confirmation | Clears session and shows empty parking state |
| Map markers | Named Grand Avenue marker selected with Enter and opens corresponding details |
| Zoom/recenter | Transform changes to 1.15 scale, then restores to 1 on recenter |
| Phone light/dark layout | Navigation, map, session and dialogs remain usable; measured no horizontal document overflow |
| Console | No captured warning/error entries during the inspected desktop test sequence |

Screenshots: [phone reminder](evidence/Verity-mobile.jpg), [desktop preview](evidence/Verity-desktop.jpg).

## Automated verification and performance

- Syntax checks for `app.js`, `rules.js`, `data.js`, and `map.js` passed.
- All 13 Node tests passed, including five new restoration/report regression cases, alongside existing eligibility/deadline/phase tests.
- `git diff --check` passed.
- Used bundled Node v24.22.1 because Node/npm were not available on the shell's default PATH. These checks run the same syntax checks and test file specified by the package's `check` script.
- Five sequential local HTTP requests returned 200 in **28.97, 2.40, 1.17, 2.25, and 1.98 ms**. This measures local server response/body retrieval, not browser rendering, mobile-network performance, or a before/after speedup.
- Browser actions completed without observed stuck loading states. Reusing the formatter removes repeated setup work; no universal latency guarantee is claimed.

## Limits and follow-up

- This remains a simulated browser prototype. It has no live AI, occupancy feed, payment processing, automatic detection, or native background notifications.
- External Maps/official-source URLs were checked as links, not as verified real parking entrances or completed third-party flows.
- Physical touch-device behavior, screen-reader speech, slow/offline networks, all browser engines, and long-duration background operation were not verified.
- Malformed-state and report-expiry semantics have unit coverage; the full 15-minute report lifetime was not waited out in browser testing.
- No real public reports were submitted, no actual payments were made, and no production data was changed.
- Real parking rules and the satellite-map feature described in the separate handoff remain outside these fixes.
