# CampusCurb G2 vehicle detector pilot

Start with [pilot-report.md](pilot-report.md). The detector matched only **7 of 18 provisional assistant reference centers** after an exploratory scale adjustment. This is not human-validated accuracy or usable parking occupancy. The 2022 windows returned no candidates and remain unscored, not empty.

## Contents

- `baseline/`: initial 512px context run, source chips, annotated overlays, raw context detections and comparisons.
- `scale-adapted/`: exploratory approximately 36m overlapping crops, retained misses and candidate boxes.
- `control/`: known high-resolution example crop and runtime smoke-test results. Training overlap is unknown.
- `inputs/samples/`: the two original G2 images and a selected-record provenance manifest. Other areas are in the earlier feasibility handoff.
- `prototype/`: runnable Python, frozen reference, tests and dependency pins.
- `provenance/`: pinned model/image identities, publisher cards, license declarations, upstream code license and source metadata.
- `diagnostics/`: exploratory scale checks that informed the adapted run; these are not held-out tests.
- `VALIDATION.md`: checks and limits; `SOURCE.json`: local repository revision.

Cyan boxes are model candidates. Green numbered circles are provisional assistant reference points made before predictions. Amber regions were excluded as ambiguous before inference. Original source pixels are enlarged only for viewing. These overlays are analytical evidence, not app designs or current parking guidance.

## Reproduce locally

From this extracted folder, use Python 3.12. Installation and inference are local; no API key is needed. The model download is about 45.5 MB. Keep generated files outside this handoff so its saved evidence stays intact.

```sh
python3.12 -m venv /tmp/campuscurb-detector-env
/tmp/campuscurb-detector-env/bin/python -m pip install -r prototype/requirements-detect.txt
/tmp/campuscurb-detector-env/bin/python prototype/detect.py --download-model --model /tmp/campuscurb-research/model.onnx --manifest inputs/samples/manifest.json --out /tmp/campuscurb-research/baseline
/tmp/campuscurb-detector-env/bin/python prototype/detect.py --model /tmp/campuscurb-research/model.onnx --manifest inputs/samples/manifest.json --ground-tile-m 36 --out /tmp/campuscurb-research/scale-adapted
/tmp/campuscurb-detector-env/bin/python prototype/detect.py --model /tmp/campuscurb-research/model.onnx --control-image control/control-positive.png --out /tmp/campuscurb-research/control
/tmp/campuscurb-detector-env/bin/python -m unittest discover -s prototype -p 'test_*.py' -v
```

Retain TLS verification. A runtime missing the source's issuer certificate needs a properly configured certificate bundle; do not turn verification off. The model and frozen image hashes are checked before evaluation. New imagery bytes or a new crop require a new independently reviewed reference. Do not modify this frozen reference after looking at model predictions.

To fetch fresh imagery/catalog metadata, use `prototype/research.py` and `prototype/areas.json`; see `research.py --help`. Historical metadata notes saying no detector had run describe the earlier image-download milestone. Later detector outputs are explicitly separate; whole-lot count and legal-capacity fields remain null.

## Credits and reuse evidence

County 2014: San Luis Obispo County / SLOCOG / Sanborn; [County public-domain statement](https://www.slocounty.ca.gov/departments/information-technology/services/gis-services/gis-aerial-imagery). CDFW 2022: USDA NAIP / California Department of Fish and Wildlife; [California public-use/attribution catalog](https://publish.data.ca.gov/dataset/naip-2022-60cm-california). Source URLs, bounds, dimensions and checksums are in the input manifest.

Model: [Geobase car detection](https://huggingface.co/geobase/car-detection), declared MIT; [OpenGeoAI weights](https://huggingface.co/giswqs/geoai), declared MIT. Positive control: [giswqs/geospatial](https://huggingface.co/datasets/giswqs/geospatial), declared MIT. Preserve the cards and notices in `provenance/`. Publisher declarations were checked; complete training-data lineage was not independently audited. No weights are bundled.

This pilot uses no scraped Google imagery, vehicle identities, plates, private cameras or paid services. It does not establish current vacancy, legal parking permission, capacity, hourly patterns, detector generalization or a calibrated forecast.
