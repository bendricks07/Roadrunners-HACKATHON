// Campus records are deliberately separate from the fictional walkthrough in data.js.
export const CAMPUS_CENTER = [35.3027, -120.6598];
export const CAMPUS_TIMEZONE = 'America/Los_Angeles';
export const CHECKED_ON = '2026-11-14';
export const LOT_SOURCE = 'https://afd.calpoly.edu/parking/slo/parking-on-campus/parking-lots/';
export const ENFORCEMENT_SOURCE = 'https://afd.calpoly.edu/parking/slo/parking-on-campus/enforcement-hours';
const CLOSURES = 'https://afd.calpoly.edu/parking/slo/lot-closures/';
const closed = { closed: true, sourceUrl: CLOSURES };
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
const lot = (id, name, outline, point, gisName, categories, note, rules) =>
  record(id, name, id.toUpperCase(), 'lot', outline, point, gisName, categories, note, rules);
const staffOnly = ['Staff permit', 'Accessible', 'Motorcycle'];
const mixedStaff = ['Staff permit', 'Metered', 'Sponsored guest', 'Accessible'];
const staffSection = ['Staff spaces'];
const staffSectionNote = 'Part of a mixed facility. Use a space marked for the permit or authorization on the sign. The published directory lists parking types for the facility as a whole.';
export const CAMPUS_AREAS = [
  lot('h1', 'H1 Parking', 26, 20, 'H-1 Parking Lot', ['Commuter', 'Daily or weekly paid permit', 'Accessible'], 'Cal Poly lists daily and weekly commuter products here. Use the paid-through time and posted space limit. Commuter permits do not cover overnight parking.'),
  record('grand-structure', 'Grand Avenue Garage', 'Grand', 'garage', 9, 30, '130 G-S Grand Parking', ['Commuter', 'Staff permit', 'Metered', 'EV', 'Accessible', 'Motorcycle'], 'Commuter Grand Annual covers designated commuter stalls before 5 PM. The regular Commuter Annual guide lists Grand after 5 PM. Follow staff, meter, EV and accessible stall signs.'),
  record('g2', 'G2 Limited-Time Parking', 'G2', 'lot', 2, 31, 'G-2 Parking Lot', ['2-hour limit', 'Paid parking'], 'The lot directory excludes commuter permits and lists a two-hour limit, with a staff exception.', { deniedPermits: ['commuter', 'commuter-grand', 'r3', 'r4', 'ag-commuter'], maxStayMinutes: 120, limitExemptPermits: ['staff'] }),
  record('structure-131', 'Structure 131', '131', 'garage', 7, 29, '131 Parking Structure', ['Visitor / resident', 'EV', 'Accessible'], 'A separate structure from Grand Avenue Garage. Ordinary commuter and staff permits are excluded seven days a week.', { deniedPermits: ['commuter', 'commuter-grand', 'r3', 'r4', 'ag-commuter', 'staff'] }),
  lot('h14', 'H14 Parking', 31, 14, 'H-14 Parking Lot', ['Commuter', 'Limited-time B/C', 'Accessible', 'Motorcycle'], 'H14A has designated commuter parking. B/C has paid limited-time spaces; follow the posted maximum. Cal Poly lists short-term permits after 5 PM. Confirm the subarea and exact stall.'),
  lot('h14a', 'H14A Commuter Parking', 34, 15, 'H-14a Parking Lot', ['Commuter'], 'H14A is listed for commuter parking. Paid limited-time B/C spaces follow separate signs.'),
  lot('h12', 'H12 Parking', 27, 12, 'H-12 Parking Lot', ['Commuter', 'Staff permit'], 'Designated commuter and staff stalls. The lot directory lists a commuter permit window of 7 AM–5 PM and short-term permits after 5 PM.'),
  lot('h16', 'H16 Parking', 30, 13, 'H-16 Parking Lot', ['Commuter', 'Staff permit'], 'Designated commuter and staff stalls. The lot directory lists a commuter permit window of 7 AM–5 PM and short-term permits after 5 PM.'),
  lot('a1', 'A1 Administration Lot', 13, 4, 'A-1 Parking Lot', ['Metered', 'Sponsored guest', 'Accessible', 'Motorcycle', 'Zipcar'], 'Pay at designated metered spaces and read the posted maximum. Sponsored guest stalls require guest authorization; accessible and reserved spaces have separate signs.'),
  record('k1', 'K1 · Closed', 'K1', 'lot', null, 1, 'K-1 Parking Lot', ['Permanently closed'], 'The dedicated campus closure notice excludes K1. Older map listings are not permission to park.', { closed: true, sourceUrl: 'https://afd.calpoly.edu/parking/slo/lot-closures/' }),
  lot('c1', 'C1 Parking', 1, 28, 'C-1 Parking Lot', staffOnly, 'General stalls are for faculty and staff. Accessible and motorcycle spaces are designated separately.'),
  lot('c2', 'C2 Parking', null, null, null, ['Staff permit', 'Sponsored guest', 'Accessible', 'Vanpool', 'Motorcycle'], 'Faculty/staff parking with separately signed guest, accessible, vanpool, and motorcycle spaces. The official map shows C2B, C2D and C2E separately.'),
  lot('c2b', 'C2B Parking', 8, 25, 'C-2b Parking Lot', staffSection, staffSectionNote),
  lot('c2d', 'C2D Parking', 5, 26, 'C-2d Parking Lot', staffSection, staffSectionNote),
  lot('c2e', 'C2E Parking', 6, 27, 'C-2e Parking Lot', staffSection, staffSectionNote),
  lot('c3', 'C3 · Closed', null, 43, 'C-3 Parking Lot', ['Permanently closed'], 'The former C3 lot is permanently closed according to Cal Poly’s closure list.', closed),
  lot('c4', 'C4 · Closed', null, null, null, ['Permanently closed'], 'Cal Poly lists this former lot as permanently closed.', closed),
  lot('c5', 'C5 Parking', 38, 38, 'C-5 Parking Lot', ['Staff permit', 'Accessible', 'Metered', 'Motorcycle'], 'The directory lists one metered stall. Staff and other designated stalls have separate requirements.'),
  lot('c6', 'C6 Restricted Parking', 10, 35, 'C-6 Parking Lot', ['State vehicle', 'Loading', 'Accessible'], 'The directory lists yellow/state vehicle and accessible spaces. Follow the designation at the stall.'),
  lot('c7', 'C7 Parking', 12, 33, 'C-7 Parking Lot', ['Staff permit', 'Sponsored guest', 'Accessible', 'Vanpool', 'Motorcycle'], 'General stalls are for faculty and staff. Guest, vanpool, accessible, and motorcycle spaces are separately designated.'),
  lot('south-perimeter', 'South Perimeter Parking', null, null, null, ['Metered', 'Accessible'], 'Pay in signed metered spaces and follow the posted maximum.'),
  lot('college-avenue', 'College Avenue Campus Parking', null, null, null, ['Metered', 'Accessible', 'Motorcycle'], 'Cal Poly campus spaces are separate from the City street record. Pay in signed metered spaces and follow the posted maximum.'),
  lot('grand-avenue', 'Grand Avenue Campus Curb', null, null, null, ['Metered', 'Passenger pickup'], 'The campus directory distinguishes two metered spaces from the rideshare/taxi pickup spaces. Check the curb signs.'),
  lot('h2', 'H2 Parking', null, null, null, mixedStaff, 'Staff, sponsored-guest, metered, and accessible stalls. The directory also lists EV charging, motorcycle parking and Zipcar. Check the exact section.'),
  lot('h2a', 'H2A Parking', 21, 10, 'H-2a Parking Lot', [], 'See H2 for facility-wide parking types. Confirm the rules at the exact stall.'),
  lot('h2b', 'H2B Parking', 25, 11, 'H-2b Parking Lot', staffSection, 'See H2 for facility-wide parking types. Check campus facilities notices for work affecting the eastern portion.'),
  lot('h2c', 'H2C Parking', 18, 32, 'H-2c Parking Lot', staffSection, staffSectionNote),
  lot('h4', 'H4 Parking', null, null, null, mixedStaff, 'Staff, sponsored-guest, metered, accessible, vanpool, and motorcycle parking are listed across H4. H4F is permanently offline.'),
  lot('h4a', 'H4A Parking', 16, 9, 'H-4a Parking Lot', staffSection, staffSectionNote),
  lot('h4b', 'H4B Parking', 19, 7, 'H-4b Parking Lot', staffSection, staffSectionNote),
  lot('h4c', 'H4C Parking', 24, 8, 'H-4c Parking Lot', staffSection, staffSectionNote),
  lot('h4d', 'H4D Parking', 22, 6, 'H-4d Parking Lot', staffSection, staffSectionNote),
  lot('h4f', 'H4F · Closed', null, 5, 'H-4f Parking Lot', ['Permanently offline'], 'The H4 directory lists this section as permanently offline.', { closed: true, sourceUrl: LOT_SOURCE }),
  lot('h10', 'H10 Parking', 11, 34, 'H-10 Parking Lot', mixedStaff, 'Staff and authorized guest stalls are separate from metered and accessible stalls. Check the meter for the maximum stay.'),
  lot('h11', 'H11 · Check construction status', 14, 36, 'H-11 Parking Lot', ['Closure status unconfirmed'], 'The lot directory labels H11 closed for construction in its index and lists former staff, guest and accessible stalls below. Verify with Cal Poly before using this lot.'),
  lot('h13', 'H13 Parking', 28, 37, 'H-13 Parking Lot', ['Commuter', 'Staff permit', 'Accessible', 'Motorcycle'], 'Use the stall marked for your permit type. Cal Poly lists H13 among the outlying areas.'),
  lot('h15', 'H15 Sports Complex Parking', 33, 22, 'H-15 Parking Lot', ['Commuter', 'Accessible', 'Motorcycle'], 'The commuter guide mentions short-term permits here, while the fees page directs daily and weekly parking to H1. Confirm short-term access before paying.'),
  lot('dairy', 'Dairy Science Parking', 32, 21, 'Dairy Science Parking', ['Commuter', 'Staff permit', 'Metered', 'Accessible', 'Motorcycle'], 'Use the designated stall for your permit or pay at the signed meter.'),
  lot('crops', 'Crop Science Parking', 39, 39, 'CS Crop Science Parking', ['Commuter', 'Staff permit', 'Accessible', 'Motorcycle'], 'The campus lot directory lists both commuter and staff spaces. Check which type is signed at your stall.'),
  lot('poultry', 'H3 Poultry Science Parking', 40, 40, 'H3 Poultry Science Parking', ['Commuter', 'Metered', 'Accessible'], 'Commuter, metered and accessible spaces are designated separately. Follow the meter’s posted maximum.'),
  lot('mountain-lane', 'Mountain Lane Parking', null, null, null, ['Metered', 'Accessible', 'Passenger pickup'], 'Use designated meters for general paid parking. The rideshare space is for pickup.'),
  lot('ornamental', 'Ornamental Horticulture / Poly Plant Shop', 35, 16, 'Ornamental Horticulture and Equine Parking', ['Staff permit', 'Metered', 'Accessible'], 'The lot directory lists staff, accessible, and metered stalls around the plant shop.'),
  lot('ornamental-east', 'Ornamental Horticulture / Equine Area', 36, 17, 'Ornamental Horticulture and Equine Parking', [], 'Second mapped area for the facility. Check the exact stall; published parking categories describe the facility as a whole.'),
  lot('meat-processing', 'Meat Processing Parking', 41, 41, 'Meat Processing Parking', ['Commuter', 'Metered', 'Accessible'], 'Use the designated commuter, metered or accessible stall. Follow the meter’s posted maximum.'),
  lot('village-drive', 'Village Drive Campus Parking', null, null, null, ['Staff permit', 'Metered', 'Accessible', 'Vanpool', 'Motorcycle'], 'Use signed staff, metered, accessible, vanpool or motorcycle spaces. This record is separate from the R3 garage.'),
  lot('k2', 'K2 · Closed', null, 2, 'K-2 Parking Lot', ['Permanently closed'], 'Cal Poly lists this former lot as permanently closed.', closed),
  lot('r1', 'R1 · Closed', null, 3, 'R-1 Parking Lot', ['Permanently closed'], 'Cal Poly lists this former lot as permanently closed.', closed),
  record('r3', 'R3 Village Drive Structure', 'R3', 'garage', 29, 18, 'R-3 271 Village Dr Parking Structure', ['Resident R3', 'Commuter R3', 'Accessible', 'Motorcycle'], 'Residential permit enforcement runs 24/7. Use the assigned R3 product and stall. Commuter R3 does not allow overnight parking.'),
  record('r4', 'R4 Canyon Circle Structure', 'R4', 'garage', 37, 19, 'R-4 371 Canyon Circle Parking Structure', ['Resident R4', 'Commuter R4', 'Limited time', 'Staff permit', 'Accessible', 'Motorcycle'], 'Residential permit enforcement runs 24/7. R4 commuter and resident products are distinct. Limited-time and other designated stalls follow their own signs; check the posted maximum.'),
  lot('cerro-vista', 'Cerro Vista Circle', null, null, null, ['Staff permit', 'Sponsored guest', 'Accessible', 'Limited time', 'Zipcar'], 'Use a stall matching your authorization. The directory lists limited-time spaces without specifying one maximum; read the space sign.'),
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
