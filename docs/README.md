# CampusCurb documentation

Start with the [repository README](../README.md) for setup and the [current app status](status/discovery.md) for implemented behavior. Planning documents and archived handoffs describe their own dates and scope.

## Current implementation and workflow

| Document | Purpose |
| --- | --- |
| [App status](status/discovery.md) | Integrated features, current checks, and remaining work |
| [Repository and branch audit](status/repository.md) | Which GitHub/local branches are included in `main` |
| [Architecture](architecture.md) | Module boundaries, map adapters, and session data |
| [Implementation decisions](decisions.md) | Recorded demo design and behavior choices |
| [Map configuration and sources](maps.md) | Providers, geometry, attribution, and availability limits |
| [Deployment status and instructions](deployment.md) | Hosted version versus GitHub source and how to update the existing Site |
| [Contributing](../CONTRIBUTING.md) | Development, validation, evidence, and integration workflow |
| [Coding-agent instructions](../AGENTS.md) | Repository requirements for coding agents |

## Research and evidence

- [Cal Poly/SLO official-source findings](research/cal-poly-slo-parking-2026-11-14.md) and [inventory JSON](../data/research/cal-poly-slo-parking-seed.json).
- [Field survey and acceptance checklist](research/parking-field-and-demo-checklist.md).
- [Free parking-data feasibility study](research/free-parking-data-feasibility.md).
- [G2 detector pilot and limitations](research/g2-vehicle-detector-pilot.md).
- [Runnable research tools](../tools/parking-research/README.md).
- [Design concepts, screenshots, raw evidence, and ZIP handoffs](../artifacts/README.md).
- [Trip-entry and map-highlight verification](../artifacts/trip-map-fixes/README.md).

Research inventories, assistant-generated reference labels, demo availability colors, and current parking permission are separate kinds of evidence. None of the imagery pilot results establishes live vacancy or a validated forecast.

## Plans and historical handoffs

- [Original product plan](plans/product-plan.md): intended features, roadmap, and example journey.
- [Original team collaboration proposal](plans/team-collaboration.md): proposed roles, interfaces, and coordination.
- [Earlier geographic implementation notes](status/discovery-history-2026-11-14.md).
- [Original browser walkthrough handoff](status/demo.md).
- [Satellite-map implementation brief](handoffs/satellite-parking-map.md).
- [Supplied November 14 GPT handoff snapshot](handoffs/CampusCurb-GPT-Agent-Handoff-2026-11-14.md).
- [Verity reliability/accessibility report](verity/Verity.md).

Historical documents retain old branch names, test totals, publication versions, and pending-work notes. Current status and verified source take precedence when deciding what is implemented now.
