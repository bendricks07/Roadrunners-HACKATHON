# G2 vehicle detector pilot

Run November 14, 2026, America/Los_Angeles. Free local research; no paid inference, new accounts, or production deployment.

## Finding

A pretrained aerial vehicle detector runs locally, but this baseline is not reliable enough to supply CampusCurb occupancy estimates. On two small windows from the clearer County 2014 G2 image, an exploratory scale adjustment recovered **7 of 18 provisional reference vehicles and missed 11**. The initial 512-pixel context baseline found none. Both configurations returned no candidates in the selected 2022 NAIP windows; that means detection failed to provide useful evidence, not that those areas were empty.

The reference was made by the assistant before inspecting predictions. It has **not been independently verified by a human**. These are exploratory agreement counts, not validated accuracy, whole-lot counts, or parking availability. No probabilities or counts were connected to the browser app.

## Model and runtime

The [Geobase model card](https://huggingface.co/geobase/car-detection) identifies a quantized Mask R-CNN derived from the [OpenGeoAI car detector](https://opengeoai.org/examples/car_detection/) and declares MIT licensing. The [upstream weights repository](https://huggingface.co/giswqs/geoai) also declares MIT. Publisher declarations and the upstream code license were retained; the complete training-data lineage was not independently audited.

- Model revision: `a3706aca0bce126fce8fa86061c09582a6562f62`.
- Artifact: `onnx/model_quantized.onnx`, 45,456,423 bytes.
- SHA-256: `fc850ef4fbc16dfbe6272b69699ef91945aa0855e36d0f705cf475429d3eca04`.
- Python 3.12.14, ONNX Runtime 1.32.0, NumPy 2.3.5, Pillow 13.0.0; CPU, two intra-op threads.
- RGB float32 NCHW input divided by 255. The model handles its internal resize and normalization. No generative enhancement, sharpening, or additional model training was used.

A 512×512 crop from the publisher's `cars_test_7cm.tif` example produced 36 candidate boxes at score ≥0.3, visually covering cars in the example. This confirms the runtime can produce useful boxes. It is a smoke test, not an independent accuracy benchmark; the example's relationship to the training data is unknown. The [example dataset](https://huggingface.co/datasets/giswqs/geospatial) declares MIT. Its revision, original image hash, crop rectangle, and crop hash are recorded in the deliverable.

## Reference and evaluation

Two fixed windows were selected from each G2 image: County June 2014 and CDFW/USDA NAIP 2022-05-19. These are partial research windows, not a verified full-lot boundary. Vehicles are counted by visible center, without determining whether they are moving, legally parked, or eligible for the driver's permit.

The frozen reference contains 11 and 7 provisional centers in the two County windows. Ambiguous tree/shadow regions were explicitly excluded before inference. The two 2022 windows were marked unscoreable before inference because individual vehicles could not be labeled defensibly by this review; their reference counts are null, not zero.

The reference file SHA-256 is `1a75b4eec06a1ffaba8bf2d7b8bebba3c89806c65e2ba6b2e8b11304409de6aa`. Original sample hashes and dimensions are bound to it. Reference coordinates, threshold, margins, and matching radius were not changed after predictions were inspected.

Fixed scoring settings: score ≥0.3, class 1, 8-source-pixel evaluation border, and maximum one-to-one center matching within approximately 2.5 ground metres. This radius is tolerant and can include adjacent vehicles; it does not measure bounding-box intersection-over-union or precise localization. Model scores are not calibrated parking probabilities.

## Results

| Window | Provisional reference | Initial 512px candidates | Scale-adjusted candidates | Scale-adjusted matches |
| --- | ---: | ---: | ---: | ---: |
| County 2014 north | 11 | 0 | 3 | 3 |
| County 2014 south | 7 | 0 | 4 | 4 |
| NAIP 2022 north | Not scoreable | 0 | 0 | Not scored |
| NAIP 2022 south | Not scoreable | 0 | 0 | Not scored |

The scale adjustment uses overlapping crops of approximately 36×36 ground metres: 148×148 source pixels for County and 77×77 for NAIP. This approximates the field of view of the high-resolution control. Each crop keeps its original source pixels; the model's internal resize enlarges their representation but cannot restore missing detail. Tile overlap is approximately 50%; candidates centered in the outer 8% of a tile are discarded, and duplicate boxes are suppressed at IoU >0.3.

This adjustment followed inspection of the failed baseline and several diagnostic crop sizes. It is an exploratory adaptation using the same sample, not held-out validation or a fair model-selection benchmark. All earlier results remain included. There was no threshold search or reference editing to improve the reported match count.

The adjusted result matched about 39% of the provisional reference centers. All seven retained candidates matched a reference center under the tolerant rule, but the sample and reference quality do not justify a claim of 100% precision. Shadows/occlusion, small vehicle footprints, source compression/resampling, and model domain differences remain plausible causes of misses; their separate effects were not isolated.

The initial baseline used three unique context tiles and approximately 1.8 seconds of measured inference. The adapted run used 138 unique tiles and approximately 62.6 seconds, including overlap shared between windows. Timings exclude downloads and session setup and are one local run, not a performance guarantee.

## Product decision and next evidence

Keep actual availability unknown. A historical vehicle detection is not an empty-stall observation, a usable-capacity measurement, a legal-parking decision, or an hourly forecast. G2 capacity discrepancies and permit exclusions remain unresolved by this work. The sparse archive and unverified flight clocks still cannot establish when parking is likely to work.

The most useful next free work is independent human review of these images, followed by a larger evaluation across H1, neighborhood streets, downtown, and multiple image vintages. Keep an evaluation set separate before further model or scale selection. Human reviewers should record ambiguous/occluded areas and vehicle centers without seeing predictions first. If adequate native imagery cannot separate cars, record that limit rather than inventing a reference count. A different baseline or local training should then be compared on the same held-out set.

For useful current demand estimates, repeat timestamped aggregate counts across relevant arrival times, weekdays, terms, and events, and continue pursuing published City survey tables. Verify usable stalls and curb restrictions separately. No external outreach was sent.

## Delivered and checked

The source includes a pinned/checksummed model downloader, local inference CLI, baseline and scale-adaptation modes, source/reference hash checks, overlap handling, duplicate suppression, one-to-one matching, annotated outputs, and positive-control mode. The handoff includes original G2 samples, provenance, frozen labels, raw detections, overlays, requirements, and instructions. Large model weights are downloaded on demand rather than bundled.

All 28 research tests passed, including preprocessing/coordinate conversion, source identity, one-to-one matching, region exclusion, tile coverage, and duplicate suppression. The model also ran on the actual control and all four G2 windows. All 32 browser app checks passed. These software checks do not validate the reference labels or detector accuracy.
