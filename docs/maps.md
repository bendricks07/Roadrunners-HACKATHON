# Geographic map configuration and sources

`geographic-map.js` prefers Google Maps JavaScript API when a browser key is configured. Otherwise it uses locally bundled MapLibre GL JS 5.14.0 with credited public raster/vector sources. Leaflet 1.9.4 remains an accessible non-WebGL fallback. The app retains its map host across searches and sheet changes.

## Google Maps

Open **Layers → Map connection** and connect a website-restricted Maps JavaScript API browser/demo key. It is saved in session storage by default, with an optional local-storage checkbox. This affects that browser only. No shared key has been supplied or live Google rendering verified in this revision.

The checked-in `demo/src/runtime-config.js` stays blank. A publisher can configure a public browser key only in the deployment copy; do not commit it to GitHub. Browser keys are visible to visitors, so restrict API and website origins. Never put server/service-account credentials in this file. Google's demo-key option is for eligible prototypes and has terms/quotas; account acceptance remains with its owner.

Google supports satellite/hybrid, dark/standard roadmap, and terrain. Real lot polygons, street lines, and parking symbols are independently overlaid. No Google imagery is scraped, traced, or mislabeled.

References: [API setup](https://developers.google.com/maps/documentation/javascript/get-api-key), [demo key](https://developers.google.com/maps/documentation/javascript/demo-key), [map types](https://developers.google.com/maps/documentation/javascript/maptypes), [directions links](https://developers.google.com/maps/documentation/urls/get-started).

## Imagery and vector fallbacks

| View | Source | Detail and attribution |
| --- | --- | --- |
| Satellite | [CDFW NAIP 2022 ImageServer](https://gis.wildlife.ca.gov/images/rest/services/Base_Remote_Sensing/NAIP_2022/ImageServer) | 2022 USDA NAIP aerial photography, 0.6 m native; closer zoom resamples it. Credit USDA NAIP (2022), California Department of Fish and Wildlife. |
| Dark / Standard | [OpenFreeMap](https://openfreemap.org/) | Crisp OpenMapTiles / OpenStreetMap vector geometry with original CampusCurb colors, subdued buildings/parks, and sparse labels. Retain OpenMapTiles and OpenStreetMap credits/links. |
| Terrain | [USGS The National Map](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer) | Genuine topographic map, native cache through z16. |
| Without WebGL | Leaflet | NAIP aerial or USGS topographic fallback; the displayed provider status reports the actual fallback. |

The previous USGSImageryOnly z16 cache has been replaced; zooming no longer simply enlarges that coarse source. Imagery is historical, never a live camera or vacancy measurement. The [official California catalog](https://publish.data.ca.gov/dataset/naip-2022-60cm-california) documents year, resolution, Creative Commons Attribution, and public-use terms. CDFW `exportImage` is requested in EPSG:3857 as 512-pixel JPEG tiles. No bulk offline imagery download is bundled.

OpenFreeMap permits public-instance use without a key, including commercial use, with attribution: [quick start](https://openfreemap.org/quick_start/). Our style JSON is original and uses its public vector source and font service. Locally vendored MapLibre and Leaflet retain their licenses. Running the app still needs no npm install. External map/GIS requests require a network connection.

## Campus and street geometry

Campus services from the [official map](https://maps.calpoly.edu/):

- [Parking Lots Outline, layer 42](https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/Parking_Lots_Outline/FeatureServer/42)
- [Parking Lot points, layer 41](https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/Parking_Lot/FeatureServer/41)

H1, Grand Structure 130, G2, separate Structure 131, H14, H12, H16, A1, and closed K1 retain exact GIS identity checks. Polygons take precedence over source points; missing geometry is not guessed. GIS `Types` never establishes parking permission.

Neighborhood streets use the official [City Streets layer 16](https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/16), queried at runtime by 42 exact OBJECTIDs and FULLNAMEs in `street-model.js`. Roads include Fredericks, Loomis, Slack, Murray **Ave**, Grand, California, Foothill, Hathway, College, and Abbott. No copied City geometry is committed. The [City GIS page](https://www.slocity.org/government/open-government/gis-mapping-division/maps) describes API/GeoJSON embedding; retain City/source credits.

These are street centerlines. MapLibre draws paired approximate curb display bands, while Google/Leaflet use street strokes. Neither is a surveyed block face or a verified parking entitlement. All selected source `RESTRC` values were null; this is not proof of unrestricted parking. Layer 31 mixes residential permit districts and timed zones and has restrictive redistribution wording. No district polygon snapshot is included. Reviewed zone attributes and explicitly uncertain nearby associations now inform street warnings; see [City rule coverage](research/city-street-rules-2026-11-15.md).

## Chance colors, rules, and reminders

An overlong trip overrides demo chance colors with red and a **Trip exceeds time limit** explanation containing planned and allowed duration. The shared evaluator checks elapsed arrival-to-departure time, including midnight/DST, and preserves explicit area-specific permit exceptions. Abbott's ten-hour zone is now supported by City layer 31; exact curb coverage and enforcement hours still require sign checks. Below-limit time fit never establishes legal eligibility or a vacancy. See [duration verification](../artifacts/trip-duration-limits/README.md).

**No permit** is an exclusive setting. Reviewed ordinary-space facilities now use published general enforcement hours (Mon-Thu 7 AM-10 PM; Friday 7 AM-5 PM), including the regular Friday 5 PM-Monday 7 AM exemption. Academic-break/holiday calendars and signed event/special stalls remain separate. Unreviewed areas retain conservative checks and unknown eligibility. Blue means a researched permit rule, not an open space. The ordinary Commuter Annual and Grand Annual products are distinguished using the current guide. See [reviewed scope and sources](research/permit-status-2026-11-15.md).

**Where are you headed?** is edited below map search alongside Trip date & time. Destination ordering remains illustrative, not verified walking navigation. Editors survive background geometry refreshes.

The renderer supports a separate red **No available spaces** reason only for fresh, verified, source-linked observations. No actual feed is connected. See [permit/destination verification](../artifacts/permit-destination-controls/README.md) for the observation contract and limits.

`parkingDisplay()` is separate from `evaluateParking()`. Green/yellow/red chance colors are fixed, explicitly labeled demo fixtures that demonstrate the requested interface, not measured availability or a validated forecast. **Layers → Parking chance preview** turns them off and restores unknown availability. No numeric vacancies or fabricated probabilities are shown.

Known ineligibility or closure overrides the preview with a red restriction marker. G2/131 exclusions, the G2 time limit/staff exception, H14 subarea uncertainty, and closed K1 remain intact in the shared evaluator. Missing legal policy and actual occupancy remain unknown. A green sample color cannot authorize parking or create a confident recommendation.

A place card opens external Google Maps directions to the source area center, not a verified entrance. Detailed rules disclose this distinction. Manual reminders require the driver's own future deadline, walk estimate, buffer, note, and signs/conditions acknowledgement. Source IDs restore reliably; deadlines remain absolute. Times are interpreted in America/Los_Angeles, with ambiguous/nonexistent DST times rejected. Notes stay local. The separate fictional walkthrough never supplies prices, rules, or walking times to real source IDs.
