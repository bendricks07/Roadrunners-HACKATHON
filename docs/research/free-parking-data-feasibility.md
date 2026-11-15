# Free parking-data feasibility: Cal Poly, neighborhoods, downtown SLO

Research checked November 14, 2026, America/Los_Angeles. Scope: free/open sources first, a reproducible feasibility prototype, no paid imagery or new accounts.

## Decision

Proceed with an imagery/geometry and observation-labeling pilot. Do not claim an hourly parking forecast from the free aerial archive alone. The strongest free demand evidence identified is the City's historical parking surveys; fresh repeated observations are still needed to establish current behavior and validate predictions.

The working prototype is in [`tools/parking-research`](../../tools/parking-research/README.md). It queries real catalogs, distinguishes map tiles from capture dates, downloads source-backed research samples, and validates future count records. At this study's initial milestone, no detector had run. The subsequent [G2 vehicle detector pilot](g2-vehicle-detector-pilot.md) records actual local inference and its poor provisional recall; no vacancy forecast is validated. The browser app's illustrative colors and existing parking rules are unchanged.

## Verified results

The anonymous [Planetary Computer NAIP catalog](https://planetarycomputer.microsoft.com/api/stac/v1/collections/naip) returned **63 tiles, seven distinct acquisition dates**, over WGS84 bounds `[-120.70, 35.25, -120.62, 35.34]`. All four sample centers have seven dates:

| Acquisition date | Tiles in the regional query | Catalog ground sampling distance |
| --- | ---: | ---: |
| 2012-05-19 | 9 | 1.0 m |
| 2014-06-04 | 9 | 1.0 m |
| 2016-06-16 | 9 | 0.6 m |
| 2018-09-13 | 9 | 0.6 m |
| 2020-06-07 | 9 | 0.6 m |
| 2022-05-19 | 9 | 0.6 m |
| 2024-06-04 | 9 | 0.6 m |

These are geographic tiles, not 63 independent demand observations. The four targets are H1, G2, a Fredericks/Grand neighborhood window, and a downtown window. Only H1/G2 sample centers come from exact campus GIS identities; the other two are approximate research windows. Neither street window establishes a surveyed block face or legal parking capacity.

The catalog's `datetime` strings include midnight or 16:00 UTC. Flight-clock precision was not independently established. Retain acquisition dates from source filenames and treat the clock as unverified, rather than learning a midnight/9 AM demand pattern from those strings. [USGS documents acquisition-date and filename semantics](https://www.usgs.gov/centers/eros/science/national-agriculture-imagery-program-naip-data-dictionary).

The [County explicitly places its 2014 imagery in the public domain](https://www.slocounty.ca.gov/departments/information-technology/services/gis-services/gis-aerial-imagery). Its [map-service metadata](https://gis.slocounty.ca.gov/arcgis/rest/services/AERIALS/2014_Combined_WGSWMAS/MapServer) describes June 2014 photography and contains 6-inch and 1-foot source layers. Dynamic exports returned HTTP 503, but the published tile cache worked. Four bounded crops were assembled without sharpening or upscaling; source clock/day and exact native resolution of each cached sample remain unverified.

Four [CDFW 2022](https://publish.data.ca.gov/dataset/naip-2022-60cm-california) crops were also downloaded. Their source-raster names identify 2022-05-19 at these targets. Each export locks the queried raster IDs, records its credited source, bounds, output dimensions, and checksum. County and CDFW crops visibly resolve cars in the G2 example; this is a qualitative inspection, not a detector accuracy measurement. Output pixels do not create additional native detail.

## Source choices

| Source | Verified access / evidence | Best use now | Limitation |
| --- | --- | --- | --- |
| CDFW NAIP | Metadata, spatial raster query, four image exports succeeded | Visibility tests, manual labels, historical geography | Sparse collection; 0.6 m native detail; unverified clock |
| County 2014 aerials | Public-domain statement, metadata and cached tiles succeeded | A sharper-looking historical labeling reference | Old geography; mixed source resolution; dynamic export failed |
| Planetary Computer NAIP | Anonymous STAC query, 63 items | Reproducible archive/date/coverage audit | Collection labels license `proprietary`; asset-level rights need reconciliation before downloading its imagery |
| OpenAerialMap | Catalog query succeeded, zero results in the chosen bbox | Check again if new local data is uploaded | This finding describes this catalog/query only, not every possible open image source |
| Sentinel-2 / Landsat | Published specifications | Regional context, not individual parked cars | 10 m / 30 m optical pixels are too coarse for direct individual-car counting; an inference from the published resolution |
| Cal Poly GIS | Exact H1/G2 point identities retrieved | Stable place identities, geographic sample selection | GIS inventory text conflicts with the directory; not an authoritative eligibility policy |
| Official campus parking pages | Lot directory and closure page retrieved | Source-linked partial restrictions | Posted signs, stall categories and temporary conditions still matter |
| City parking studies | Published report and indexed methodology identified | Historical demand baseline and survey design | Direct PDF download/visual table review blocked by HTTP 403; no chart values imported |
| City street/district GIS | Current request returned HTTP 403; prior repository research exists | Retry documented API later; retain existing identities | No new curb permissions or district snapshots inferred/copied |
| New downtown garage guidance | Official indexed announcement describes a real-time guidance system | Ask about an authorized public aggregate feed later | No public occupancy API or reuse license verified |

CDFW also advertises 2005–2022 NAIP services on its [map-service page](https://wildlife.ca.gov/Data/GIS/Map-Services). Those older collections were not all individually audited over the selected targets; the seven-date result is specifically for the tested STAC archive.

## Historical occupancy evidence

The City's [2024 parking rate study](https://www.slocity.org/home/showpublisheddocument/38031/638931011019430000), Appendix B methodology, identifies public on/off-street collection on February 28 and March 2, 2024, at 9 AM, 11 AM, 1 PM, 3 PM, 5 PM and 7 PM. It also distinguishes private-lot collection and aggregates multi-level structures. This is a useful lead for actual demand measurements, not a current forecast. The direct PDF download and page rendering returned HTTP 403 during this pass, so chart/table values were not digitized. A [2023 planning packet](https://opengov.slocity.org/WebLink/DocView.aspx?dbid=0&id=218657&repo=CityClerk) and [2022 utilization report](https://www.slocity.org/home/showpublisheddocument/33889/638138640670130000) identify additional historical research. Changes to rates, events, supply and campus use prevent treating those surveys as timeless behavior.

## Rules and capacity must remain independent

The current [lot directory](https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/) retains G2's ordinary commuter exclusion and staff time-limit exception, and separates Structure 131 from Grand Avenue Structure. The [closure page](https://afd.calpoly.edu/parking/slo/lot-closures/) takes precedence over old suggestions for closed K1. Existing app behavior already preserves these restrictions.

Newly retrieved GIS descriptions list G2 with 102 limited-time and 2 disabled spaces, while the directory lists 110 and 2. H1 GIS text lists 341 short-term and 13 disabled, while the directory lists 364 and 2. These differences may reflect dates or categories; they were not resolved by assuming one is correct. A vehicle count divided by a mismatched capacity is not a defensible occupancy estimate. GIS `Types: Commuter` also cannot override G2's directory exclusion.

For each rule, retain its exact place/subarea, permit category, applicable window, exceptions, source URL, retrieval date, and unresolved conflicts. A rule extractor should propose structured records for review; the shared parking evaluator should check the full intended stay. Do not turn missing restrictions into permission or an observed car into proof of legality.

## Free-first prototype and next experiment

1. Use the eight delivered historical crops to create independent human labels, including trees/shadows and ambiguous/moving vehicles. Count only a defined image mask. No vehicle identities are needed.
2. Benchmark an openly licensed aerial vehicle detector against those labels before integrating it. Check weights and training-data licenses separately, keep model/version and detection boxes, and report false positives and missed vehicles. No model/license was selected in this milestone.
3. Obtain usable aggregate tables from the City studies, or repeat free in-person counts over fixed block faces and surface lots, covering relevant weekdays, arrival hours, terms and events. Keep old survey dates visible and distinguish ordinary days from Farmers' Market/event periods and 2020 conditions.
4. Establish currently usable capacity, exact curb sides and policy intervals separately. Prefer surface lots before covered garages.
5. Compare a simple time/day baseline with a candidate model on held-out dates. Decide accuracy and calibration requirements before allowing forecast colors. With inadequate evidence, return unknown instead of a fabricated probability.

The useful free product path is source-linked rules plus clearly dated historical evidence first, then validated demand estimates as repeated observations become available. An imagery-only hourly forecast is a **no-go with the tested archive**; an imagery analysis/labeling and evidence-ingestion pilot is a **go**.

## Reproduction and remaining limits

Run commands and offline checks from the [prototype README](../../tools/parking-research/README.md). Keep downloaded imagery/results outside the repository; the handoff pack includes raw metadata, eight credited images, manifests and the audit. Cache reuse requires matching checksums and bounds. No paid request, account creation, outreach, private camera feed, plate collection or production deployment occurred.

This study did not establish a complete local imagery inventory, detector accuracy, exact legal street capacity, current city-wide occupancy, a real-time feed, or production rights for every catalog asset. Sample windows are research locations, not parking recommendations.

Additional primary references: [USDA imagery rights](https://www.fpacbc.usda.gov/geospatial-services/customer-services), [Planetary Computer anonymous access](https://planetarycomputer.microsoft.com/docs/), [OpenAerialMap API](https://docs.openaerialmap.org/api/api/), [Sentinel-2 resolution](https://docs.sentinel-hub.com/api/latest/data/sentinel-2-l2a/), [USGS NAIP archive](https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip), [City garage announcement](https://www.slocity.org/Home/Components/News/News/11707/2367).
