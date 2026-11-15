# Validation

- 28 Python research tests passed, with no skips in the Python 3.12 detector environment. Includes the original 15 ingestion/evidence tests and 13 detector tests.
- The 13 detector tests cover maximum one-to-one matching including a greedy failure case; undefined precision/recall; half-open border and uncertainty exclusions; duplicate suppression; tile coverage and image bounds; rejection of incorrect model bytes; RGB/NCHW/scaling/padding and coordinate translation; non-finite predictions; changed source bytes, dimensions and paths.
- Actual ONNX Runtime CPU inference completed for the documented positive control, both County 2014 windows and both NAIP 2022 windows, using both baseline and adapted configurations.
- Baseline: 0 candidates, 18 provisional reference centers in scoreable windows. The two 2022 windows have null reference counts.
- Adapted: 7 candidates matched 7 of 18 provisional reference centers; 11 missed. Approximately 62.6 seconds measured inference over 138 unique tiles in the recorded run. This followed exploratory scale checks on the same evidence; it is not held-out validation.
- Positive control: 36 candidates at score ≥0.3; no accuracy score. The relationship to training imagery is unknown.
- All 32 browser app checks passed with `npm --prefix demo run check`. Browser app source was not changed by this pilot.
- Annotated County and NAIP outputs and the positive-control image were visually inspected. No independent human label review occurred. Software tests do not validate detection accuracy.
- Image and frozen-reference hashes were checked during inference. Model SHA-256 and pinned revision are retained. Output bundle integrity is listed in `SHA256SUMS.txt`.

No detector-derived counts or forecast probabilities were connected to the browser app. No GitHub push or production deployment occurred. This report records a completed local experiment whose tested baseline is inadequate for occupancy estimates.
