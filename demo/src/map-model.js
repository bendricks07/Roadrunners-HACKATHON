// Campus records are deliberately separate from the fictional walkthrough in data.js.
export const CAMPUS_CENTER = [35.3027, -120.6598];
export const CAMPUS_TIMEZONE = 'America/Los_Angeles';
export const CHECKED_ON = '2026-11-14';
export const LOT_SOURCE = 'https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/';
export const GIS_ROOT = 'https://services6.arcgis.com/2p89s65aBU4qN9v4/arcgis/rest/services/';
export const GIS_POLYGONS = GIS_ROOT + 'Parking_Lots_Outline/FeatureServer/42';
export const GIS_POINTS = GIS_ROOT + 'Parking_Lot/FeatureServer/41';
export const MAP_STATUS = {
  eligible: { color: '#259b6c', label: 'Fits your stay', short: 'Fits' },
  conditional: { color: '#dba12c', label: 'Action needed', short: 'Conditional' },
  ineligible: { color: '#df6269', label: 'Doesn’t fit', short: 'Restricted' },
  unknown: { color: '#8794a4', label: 'Check rules', short: 'Unconfirmed' },
};

const record = (suffix, name, shortName, kind, polygonId, pointId, gisName, categories, note, rules = {}) => ({
  id: `cal-poly-slo-${suffix}`, name, shortName, kind, polygonId, pointId, gisName,
  dataset: 'campus-research', categories, note, rules, checkedOn: CHECKED_ON,
  sourceUrl: LOT_SOURCE, occupancy: 'unknown', entrance: null, walkMinutes: null,
  // The inventory does not establish a complete current legal parking policy.
  policyComplete: false,
});
export const CAMPUS_AREAS = [
  record('h1', 'H1 Parking', 'H1', 'lot', 26, 20, 'H-1 Parking Lot', ['Commuter', 'Pay station'], 'Short-term commuter parking is listed. Confirm the current product, stall signs, and access.'),
  record('grand-structure', 'Grand Avenue Garage', 'Grand', 'garage', 9, 30, '130 G-S Grand Parking', ['Mixed permits', 'EV', 'Accessible'], 'Grand Avenue Structure (130). Staff, commuter, and special spaces have different requirements.'),
  record('g2', 'G2 Limited-Time Parking', 'G2', 'lot', 2, 31, 'G-2 Parking Lot', ['2-hour limit', 'Paid parking'], 'The lot directory excludes commuter permits and lists a two-hour limit, with a staff exception.', { deniedPermits: ['commuter', 'commuter-grand', 'r3', 'r4', 'ag-commuter'], maxStayMinutes: 120, limitExemptPermits: ['staff'] }),
  record('structure-131', 'Structure 131', '131', 'garage', 7, 29, '131 Parking Structure', ['Visitor / resident', 'EV', 'Accessible'], 'A separate structure from Grand Avenue Garage. Ordinary commuter and staff permits are excluded seven days a week.', { deniedPermits: ['commuter', 'commuter-grand', 'r3', 'r4', 'ag-commuter', 'staff'] }),
  record('h14', 'H14 Parking', 'H14', 'lot', 31, 14, 'H-14 Parking Lot', ['Mixed subareas', 'Accessible'], 'Commuter and limited-time B/C subareas must be checked separately. An entire-lot permit color would be misleading.'),
  record('h12', 'H12 Parking', 'H12', 'lot', 27, 12, 'H-12 Parking Lot', ['Commuter', 'Pay station'], 'The long-term commuter designation does not establish eligibility for every space or time.'),
  record('h16', 'H16 Parking', 'H16', 'lot', 30, 13, 'H-16 Parking Lot', ['Commuter / staff', 'Pay station'], 'Confirm the correct staff or commuter space and current enforcement conditions.'),
  record('a1', 'A1 Administration Lot', 'A1', 'lot', 13, 4, 'A-1 Parking Lot', ['Metered', 'Sponsored guest', 'Accessible'], 'Metered, sponsored-guest, and accessible spaces have separate conditions. Not every stall is public hourly parking.'),
  record('k1', 'K1 · Closed', 'K1', 'lot', null, 1, 'K-1 Parking Lot', ['Permanently closed'], 'The dedicated campus closure notice excludes K1. Older map listings are not permission to park.', { closed: true, sourceUrl: 'https://afd.calpoly.edu/parking/slo/lot-closures/' }),
];

const dateFormat = new Intl.DateTimeFormat('en-CA', { timeZone: CAMPUS_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export function campusDateInput(epoch = Date.now()) {
  const p = Object.fromEntries(dateFormat.formatToParts(epoch).map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
export function parseCampusDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return NaN;
  const nominal = Date.parse(value + 'Z');
  if (!Number.isFinite(nominal)) return NaN;
  // Modern Los Angeles offsets. Reject both nonexistent and ambiguous DST times.
  const matches = [7, 8].map(h => nominal + h * 3_600_000).filter(t => campusDateInput(t) === value);
  return matches.length === 1 ? matches[0] : NaN;
}
export function featureCenter(geometry) {
  if (!geometry || !['Point', 'Polygon', 'MultiPolygon', 'LineString', 'MultiLineString'].includes(geometry.type) || !Array.isArray(geometry.coordinates)) return null;
  if (geometry.type === 'Point') return geometry.coordinates.length >= 2 && geometry.coordinates.every(Number.isFinite) ? [geometry.coordinates[1], geometry.coordinates[0]] : null;
  const points = geometry.type === 'LineString' ? geometry.coordinates : geometry.coordinates.flat(geometry.type === 'MultiPolygon' ? 2 : 1);
  if (!points.length || points.some(p => !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) return null;
  return [(Math.min(...points.map(p => p[1])) + Math.max(...points.map(p => p[1]))) / 2, (Math.min(...points.map(p => p[0])) + Math.max(...points.map(p => p[0]))) / 2];
}
export function mapCampusFeatures(polygons, points) {
  return { type: 'FeatureCollection', features: CAMPUS_AREAS.flatMap(area => {
    const outline = polygons.features?.find(f => f.properties.FID === area.polygonId && f.properties.Names === area.gisName);
    const point = points.features?.find(f => f.properties.OBJECTID === area.pointId && f.properties.Names === area.gisName);
    const f = outline || point;
    if (!f?.geometry || !featureCenter(f.geometry)) return [];
    return [{ type: 'Feature', id: area.id, geometry: f.geometry, properties: { areaId: area.id, name: area.name, kind: area.kind, geometrySource: outline ? GIS_POLYGONS : GIS_POINTS, geometryStatus: outline ? 'Campus GIS outline · not field checked' : 'Campus GIS location · boundary not available' } }];
  }) };
}
export async function fetchCampusFeatures(signal) {
  const query = (url, field, ids) => `${url}/query?${new URLSearchParams({ where: `${field} IN (${ids.filter(x => x !== null).join(',')})`, outFields: '*', outSR: '4326', f: 'geojson' })}`;
  const urls = [query(GIS_POLYGONS, 'FID', CAMPUS_AREAS.map(a => a.polygonId)), query(GIS_POINTS, 'OBJECTID', CAMPUS_AREAS.map(a => a.pointId))];
  const result = await Promise.allSettled(urls.map(async url => {
    const r = await fetch(url, { signal });
    if (!r.ok) throw new Error('Campus GIS is temporarily unavailable.');
    const data = await r.json();
    if (data.error || !Array.isArray(data.features)) throw new Error('Campus GIS returned an unexpected response.');
    return data;
  }));
  if (result.every(r => r.status === 'rejected')) throw new Error('Campus GIS is unavailable. Parking records remain in the list; no boundaries have been guessed.');
  return mapCampusFeatures(...result.map(r => r.status === 'fulfilled' ? r.value : { features: [] }));
}
