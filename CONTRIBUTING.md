# Contributing to CampusCurb

Read [AGENTS.md](AGENTS.md), [current app status](docs/status/discovery.md), [architecture](docs/architecture.md), and [decisions](docs/decisions.md) before changing shared behavior. Use the [documentation index](docs/README.md) to find sources and handoffs.

## Development

1. Fetch the latest `origin/main` and preserve existing local work.
2. Start a short feature branch from updated `main`.
3. Keep the app runnable under `demo/`; put research tooling in `tools/parking-research/` and source records in `data/research/`.
4. Run checks appropriate to the change, update the relevant status document, and describe the resulting behavior and validation.
5. Push the feature branch for review and integrate into `main`. Check for newer remote commits before pushing; preserve teammates' changes and branch history.

```sh
npm --prefix demo start
npm --prefix demo run check
```

Research audit/count tests use Python. Detector preprocessing tests require the dependencies documented in [the research README](tools/parking-research/README.md):

```sh
python3 -m unittest discover -s tools/parking-research -p 'test_*.py' -v
```

## Shared behavior and evidence

Use `demo/src/rules.js` for parking decisions and absolute deadlines. Keep real geographic IDs separate from fictional walkthrough fixtures. Missing eligibility and actual occupancy stay unknown; chance colors and local reports remain explicitly illustrative. Preserve source links, dates, imagery credits, license evidence, and unresolved conflicts.

Maintain current code in `demo/` and `tools/`. Add dated screenshots or research handoffs under `artifacts/` with an index entry and provenance. Archived evidence and ZIPs retain their creation-time records; update current status separately instead of rewriting old results. Keep credentials, virtual environments, and scratch downloads outside Git.

## Publishing

Pushing to GitHub does not publish the hosted app. Follow [deployment instructions](docs/deployment.md) when an updated Site publication is requested. The [repository audit](docs/status/repository.md) records the latest branch integration check.

The original [team collaboration proposal](docs/plans/team-collaboration.md) preserves the Person A/B/C planning discussion. Those assignments remain proposed until the team adopts them.
