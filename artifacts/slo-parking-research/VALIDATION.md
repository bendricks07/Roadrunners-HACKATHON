# Verification

- Free NAIP and OpenAerialMap catalog queries completed with no source errors in the delivered audit.
- Regional NAIP result: 63 geographic tiles, seven acquisition dates, seven dates at each of four sample centers, zero verified flight-clock times.
- Eight image samples are recorded in the final manifest with no source errors: four County 2014 cached crops and four CDFW 2022 exports.
- All eight images opened and passed PNG decoding, size, content-variance, and SHA-256 checks. A contact sheet was visually inspected for expected locations and visible image content.
- 15 offline prototype checks passed, covering acquisition versus processing dates, tile/date distinction, pagination, unverified clocks, polygon holes, source failures, count validation, cache integrity and subset provenance.
- The existing app's syntax checks and all 32 tests passed.
- `git diff --check` passed. Source committed on the research feature branch; no app UI, deployment or GitHub push was performed.

County dynamic export returned HTTP 503, so the working route uses its published cache. A bundled Python runtime lacked the CDFW issuer certificate; system Python with its trusted CA bundle completed the CDFW requests. TLS verification was preserved throughout.

Detector accuracy, vehicle counts, current legal capacity, hourly forecast quality and a live occupancy feed remain unestablished.
