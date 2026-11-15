# Geographic map configuration and sources

The map adapter in `demo/src/geographic-map.js` prefers Google Maps JavaScript API. It supports satellite/hybrid and terrain views, independent GeoJSON parking layers, selectable lot/garage symbols, source details, and retained map state while filters and panels change. The app keeps the same map DOM node across renders to avoid creating a new Google map on every filter change.

## Google Maps

Open **Map settings** and connect a website-restricted Google Maps browser/demo key. The form saves it to session storage by default; the optional checkbox remembers it in local browser storage. It is never submitted to a CampusCurb backend or printed to logs. It is sent to Google to load the Maps JavaScript API. That connection affects the current browser, not every judge's device.

For a shared deployment, the publisher can configure the public browser key in `demo/src/runtime-config.js` before packaging; the checked-in value is blank. Keep the team GitHub copy key-free. Browser keys are necessarily visible to site visitors: restrict the key to Maps JavaScript API and the intended website origins, including the existing judge Site and localhost as needed. Never place a server/service-account credential in this file. A later server-backed configuration endpoint can separate deployment configuration from tracked app code.

Google's [demo-key option](https://developers.google.com/maps/documentation/javascript/demo-key), checked November 14, 2026, supports satellite/terrain maps and drawing for eligible personal accounts without billing setup. It is for prototyping, has quotas, and is not production access. Standard deployments require a suitably configured Maps Platform project and billing. Account creation and acceptance of Google's terms remain with the account owner.

References: [API setup](https://developers.google.com/maps/documentation/javascript/get-api-key), [map types](https://developers.google.com/maps/documentation/javascript/maptypes), [shapes](https://developers.google.com/maps/documentation/javascript/shapes).

## Explicit fallback

Without a Google key, the app uses vendored Leaflet 1.9.4 with public National Map services:

- [USGSImageryOnly](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer): USDA / USGS historical aerial imagery, not a live satellite camera. The service metadata reports a June 2024 refresh, not a capture date for every image.
- [USGSTopo](https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer): actual topographic context, not a street map relabeled terrain.

The view identifies this as **USGS fallback** and retains the service attribution. The library is bundled locally under `demo/src/vendor/leaflet/`, including its BSD license; running the app does not require npm installation or fetching a JS library from a CDN. The fallback overscales zoom levels above 16 rather than pretending to obtain higher-resolution imagery.

Missing keys, Google script/authentication errors, GIS failures, and tile errors have visible states. The parking list, saved notes, and manual reminders continue to work. No image-like placeholder is represented as a functioning Google map.

## Campus geometry

The official [campus map](https://maps.calpoly.edu/) redirects to Experience Builder item `5d3c7ce97866487eac63664dff9fb946`. Its configuration references these Cal Poly Facilities services:

- [Parking Lots Outline, layer 42](https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/Parking_Lots_Outline/FeatureServer/42)
- [Parking Lot points, layer 41](https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/Parking_Lot/FeatureServer/41)

These public services advertise Query capability and allow cross-origin display. The app queries a small selected inventory at runtime in EPSG:4326/GeoJSON, rather than committing copied geometry. It checks both source IDs and names before attaching geometry. Available polygons take precedence over points; a point-only record is labeled as lacking a boundary. Sources are credited in the details/source sheet. Public query availability does not establish unrestricted redistribution or analysis rights; check publisher terms before expanding reuse.

Included records: H1, Grand Avenue Structure 130, G2, Structure 131, H14, H12, H16, A1, and closed K1. K1 is a point-only legacy exclusion. These are not exact parking stalls or verified entrances. No street segments have been added because block-face permissions and endpoints remain unverified.

## Rules and reminders

`map-model.js` defines a separate research dataset; `rules.js` is still the shared evaluator. GIS `Types` is never treated as legal permission. For example, the GIS labels G2 and Structure 131 commuter while the official lot directory excludes ordinary commuter permits there. Known exclusions are red; incomplete policies remain gray. Green/yellow are supported only for a complete, sourced policy covering the entire selected trip. None of the current incomplete research records is automatically promoted to that state.

Colors refer to eligibility, not occupancy. Every current record has unknown occupancy. Geometry and rule confidence are independent. H14 requires subarea verification. Partial closures must not close an entire lot. Sources and existing research gaps remain in `docs/research/`.

Real-area reminders require the driver's own future deadline, positive walk estimate, return buffer, and acknowledgement that parking conditions were checked. They are labeled manual and do not claim to purchase parking or verify permission. Deadlines persist as absolute timestamps. The original 90-second walkthrough remains separate and uses fictional IDs, geometry, reports, and rules.

Campus date/time inputs are interpreted in America/Los_Angeles, regardless of the device timezone. Nonexistent or ambiguous daylight-saving times return unknown rather than being silently shifted.
