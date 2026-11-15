# CampusCurb

A parking companion for Cal Poly San Luis Obispo and nearby neighborhoods. The browser prototype combines a geographic map, campus parking inventory, trip and permit settings, source-linked restrictions, directions, and saved-car reminders.

**[Open the hosted demo](https://campuscurb-cal-poly-current.jammyhoneydew6.chatgpt.site)** · [Current app status](docs/status/discovery.md) · [Documentation](docs/README.md) · [Design and research evidence](artifacts/README.md)

GitHub `main` is the integrated source. The hosted demo is published separately and can lag behind it; see [deployment status](docs/deployment.md). The [branch audit](docs/status/repository.md) records which branches are included in `main`.

Edit **Where are you headed?** and **Trip date & time** directly below map search. **Layers > Permits & preferences** includes **No permit**. Red areas explain missing permit/payment, supported permit conflicts or closures; low demo chance is not confirmed full parking. See [verification and limitations](artifacts/permit-destination-controls/README.md).

## Run and check

Requires Node.js 20 or newer. No npm install, backend, or API key is required for the credited map fallbacks.

```sh
npm --prefix demo start
```

Open **http://localhost:5173**. To validate the app:

```sh
npm --prefix demo run check
```

The integrated source passes 37 app tests. The separate research tools pass 28 Python tests; dependency and reproduction instructions are in [tools/parking-research](tools/parking-research/README.md).

## What is implemented

- A full-screen Satellite, Dark, Standard, or Terrain map with floating search and compact place cards.
- An expanded campus lot/garage inventory and 42 source-matched City street segments on ten nearby roads, including Abbott Street.
- Arrival and departure entry below search in Los Angeles time; permits and preferences under Layers and the parking planner.
- Separate explanations for illustrative parking-chance colors, known permit conflicts, and closures.
- Directions to mapped areas, source details, manual saved-car reminders, and absolute return deadlines.
- A separate fictional walkthrough for presenting parking sessions, reports, and reminders.

Google Maps is preferred when a restricted browser key is supplied through **Layers → Map connection**. Otherwise the app uses credited CDFW/USDA NAIP, OpenFreeMap, and USGS fallbacks. No shared Google key is committed. See [map configuration](docs/maps.md).

**Availability remains unknown.** Chance colors are labeled demo fixtures, not measured vacancies or a validated forecast. Incomplete policies require verification; street bands are approximate displays around source centerlines, not surveyed legal parking curbs. Notes stay in the browser. Live AI, shared reports, payments, automatic parking detection, and background notifications are not connected.

## Repository map

| Location | Contents |
| --- | --- |
| [demo/](demo/) | Runnable browser app, vendored map libraries, and tests |
| [docs/](docs/README.md) | Current status, architecture, sources, deployment notes, and planning documents |
| [data/research/](data/research/) | Source-backed research inventory with unresolved fields left explicit |
| [tools/parking-research/](tools/parking-research/README.md) | Free-source audit, imagery ingestion, detector pilot, and Python tests |
| [artifacts/](artifacts/README.md) | Design concepts, app screenshots, original evidence, provenance, and ZIP handoffs |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Current development and integration workflow |
| [AGENTS.md](AGENTS.md) | Instructions for coding agents working in this repository |

## Research and planning

Start with the [free-data feasibility study](docs/research/free-parking-data-feasibility.md), [G2 detector pilot](docs/research/g2-vehicle-detector-pilot.md), and [official-source parking research](docs/research/cal-poly-slo-parking-2026-11-14.md). The detector matched only 7 of 18 provisional assistant reference centers after exploratory scale adaptation; it does not supply app occupancy estimates.

The original long-form proposals are preserved in the [product plan](docs/plans/product-plan.md) and [team collaboration proposal](docs/plans/team-collaboration.md). They describe intended features and proposed ownership, separate from the implemented app. Historical handoffs and evidence retain the state recorded when they were created.
