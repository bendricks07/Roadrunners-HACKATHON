# CampusCurb free-source evidence prototype

This is a working research/data-ingestion prototype, not a trained vehicle detector or parking forecast. It is separate from the public browser app. Auditing and count validation use Python 3.10+ and the standard library; no accounts or paid API are required. County cached-image assembly also requires Pillow (`python3 -m pip install Pillow`) or the Codex bundled Python, which already includes it. CDFW crops do not need Pillow.

From the repository root:

```sh
python3 prototype/research.py audit --out /tmp/campuscurb-research/audit --as-of 2026-11-14
python3 prototype/research.py samples --out /tmp/campuscurb-research/samples
python3 -m unittest discover -s tools/parking-research -p 'test_*.py' -v
```

Use `--area cal-poly-g2` with `samples` for a smaller two-image download. Area IDs and sample windows are in `areas.json`. Approximate windows are not verified parking curbs, legal capacity, navigation entrances, or full-lot boundaries.

Existing sample files are reused only when their saved checksum and requested bounds match. Use a fresh output directory to refetch everything. TLS verification remains enabled; if a Python runtime lacks the provider's issuer certificate, use a properly configured system/Python certificate bundle rather than disabling verification.

## What works

- Queries anonymous NAIP catalog metadata over the selected SLO bounding box and follows bounded pagination.
- Records source identities, acquisition dates, resolution, and polygon-based coverage of the four sample centers.
- Counts distinct acquisition dates separately from geographic tile counts; overlapping tiles do not create additional survey dates.
- Retains the raw catalog clock string but never treats it as a verified flight time.
- Queries the OpenAerialMap catalog. Empty results and source failures are separate states.
- Downloads bounded County 2014 and CDFW 2022 crops, retaining source URLs, attribution, rights references, source raster identities when available, output resolution, and SHA-256 checksums. The CDFW export locks the identified source rasters.
- Validates future human/model vehicle-count records and rejects duplicated samples. It never converts unvalidated counts into parking permission or a forecast probability.

`audit.json` and `samples/manifest.json` are the machine-readable evidence handoff. Results depend on the provider and date queried. The regional audit is not a guarantee of imagery coverage over every curb or time of day.

## Connecting image analysis next

Run a detector on a sample, retain its model/version, pixel boxes, confidence thresholds, and reviewed misses/false positives, and compare with independent human labels. A count record can then be assessed with:

```sh
python3 prototype/research.py assess --observations observations.json
```

The JSON file is a list. Every record needs `area_id`, `sample_id`, `source_url`, integer `visible_vehicle_count`, and `method` (`human` or `model`). A record claiming a verified capture clock also needs timezone-aware `captured_at` and `capture_time_evidence_url`. These fields are claims to review; their presence is not independent verification. No example counts are supplied as if they were real observations.

No detector weights, automated vehicle counts, legally usable capacity, or validated forecast are bundled. Training with sparse aerial snapshots cannot establish an hourly profile. Historic observation, current vacancy, and eligibility remain separate.

## Rights and evidence limits

- County 2014 imagery: the County's [public-domain statement](https://www.slocounty.ca.gov/departments/information-technology/services/gis-services/gis-aerial-imagery) and its [map service](https://gis.slocounty.ca.gov/arcgis/rest/services/AERIALS/2014_Combined_WGSWMAS/MapServer) document this source. Dynamic exports returned HTTP 503 during research; cached tiles worked. The prototype assembles a bounded level-19 cache crop without sharpening or upscaling. The service contains 6-inch and 1-foot sources; output/cache pixel size does not establish native resolution. The service gives June 2014, not a verified flight hour or day.
- CDFW 2022 imagery: the [California catalog](https://publish.data.ca.gov/dataset/naip-2022-60cm-california) supplies public-use/attribution information. Retain USDA NAIP/CDFW credits. Exported preview pixels can be resampled and are not extra native detail.
- Planetary Computer: public metadata access is documented, but its NAIP collection currently labels the license `proprietary`. This prototype downloads metadata only from that provider. Keep that discrepancy visible rather than assuming access means unrestricted asset reuse.
- No Google imagery, Esri World Imagery, private accounts, license-plate data, or City district snapshots are downloaded.
- HTTP errors, missing metadata, cloud/occlusion, closed lots, source changes, and lack of a current occupancy feed require explicit handling before production use.
