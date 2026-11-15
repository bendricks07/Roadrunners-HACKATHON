# SLO parking research pack

Start with [the feasibility study](feasibility-study.md).

The working prototype is a command-line research tool. It audits free imagery archives, prepares source-backed crops, and checks observation records. It does not run a vehicle detector or forecast vacancies.

From this folder, using Python 3.10+:

```sh
python3 prototype/research.py audit --out fresh-audit --as-of 2026-11-14
python3 -m unittest discover -s prototype -p 'test_*.py' -v
python3 prototype/research.py assess --observations evidence/observations.json
```

For new imagery downloads, install Pillow if needed and run:

```sh
python3 -m pip install Pillow
python3 prototype/research.py samples --out fresh-samples --area cal-poly-g2
```

[Prototype details](prototype/README.md) describe limits and data contracts.

- `evidence/audit/audit.json`: verified archive inventory, dates, target coverage, and errors.
- `evidence/audit/raw/`: captured public catalog responses.
- `evidence/samples/`: eight historical crops plus their source/rights/checksum manifest.
- `evidence/observations.json`: intentionally empty. No car counts have been invented.
- `evidence/assessment.json`: current observation readiness, with forecast and permission unknown.
- `SOURCE.json`: exact local repository revision and scope.
- `VALIDATION.md`: completed verification.

Keep imagery attribution with any reused samples. The research windows are not surveyed legal parking areas. The existing public CampusCurb app was not changed or deployed in this milestone.
