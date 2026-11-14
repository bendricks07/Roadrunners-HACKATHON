# Browser demo architecture

## Implemented scope

`demo/` is a standalone, dependency-free ES-module browser app. The repository root remains free for a teammate's chosen framework. The Node server exposes only the app on loopback, not the repository or a data API.

| File | Responsibility |
| --- | --- |
| `demo/src/data.js` | Explicitly simulated parking areas, destinations, permits, and report fixtures |
| `demo/src/rules.js` | Eligibility, active reports, walking adjustments, earliest deadlines, sessions, and reminder phases |
| `demo/src/map.js` | Original SVG map, selected parking markers, and illustrative routes |
| `demo/src/app.js` | Four-tab UI, dialogs, browser persistence, guide, reminders, and appearance |
| `demo/src/styles.css` | Responsive light/dark design system |
| `demo/server.mjs` | Built-in Node HTTP server restricted to app assets |
| `demo/tests/rules.test.mjs` | Deadline, eligibility, report expiry, and restored-session checks |

## Shared session contract

```js
{
  id, areaId, destinationId,
  startedAt,           // epoch milliseconds
  deadlineAt,          // epoch milliseconds; earliest applicable deadline
  deadlineReason,
  walkMinutes, bufferMinutes, note,
  demo                // true for accelerated presentation timing
}
```

Use `createSession`, `calculateDeadline`, `headBackAt`, and `sessionPhase` from `rules.js`. Remaining time is `deadlineAt - Date.now()`; refresh cannot grant more time. Expired sessions remain visible until explicitly ended.

Active walkway reports add return time. Entrance closures exclude recommendations and warn parked drivers without ending their sessions. Observations remain unverified and do not establish official rules.

The browser key is `campuscurb.demo.v1`. Reports and notes are not sent to a service or shared between devices. Sessions are validated on restoration; a second browser tab receives storage updates.

## Integration seams

- Replace `data.js` with verified records while retaining stable area IDs.
- Import the pure `rules.js` helpers into another app without the DOM UI.
- Replace `answerQuestion` in `app.js` with a configured service; currently it is explicitly a rule-based guide.
- Replace `campusMap` with a real maps adapter. The current original SVG is illustrative, not geographic navigation data.
- Connect tested background/native reminders separately. The current browser demo provides in-app feedback only.

Production authentication, a shared database, automatic detection, payments, and live occupancy are outside this branch.
