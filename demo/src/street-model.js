import { CAMPUS_AREAS, featureCenter, CHECKED_ON } from './map-model.js';

export const CITY_STREETS = 'https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/16';
export const CITY_PARKING = 'https://www.slocity.org/government/department-directory/public-works/parking-services/residential-permits';
// Source IDs and exact names only; street geometry is queried from the City at runtime.
// The last column is an explicit UI demonstration fixture, NOT a measured forecast.
const STREET_RECORDS = [
  [1953, 'FREDERICKS ST', 'Fredericks St', 'good'],
  [2146, 'FREDERICKS ST', 'Fredericks St', 'limited'],
  [1966, 'FREDERICKS ST', 'Fredericks St', 'low'],
  [2147, 'FREDERICKS ST', 'Fredericks St', 'good'],
  [2149, 'FREDERICKS ST', 'Fredericks St', 'limited'],
  [2290, 'LOOMIS ST', 'Loomis St', 'good'],
  [2291, 'LOOMIS ST', 'Loomis St', 'limited'],
  [2032, 'LOOMIS ST', 'Loomis St', 'low'],
  [2151, 'LOOMIS ST', 'Loomis St', 'good'],
  [2152, 'LOOMIS ST', 'Loomis St', 'limited'],
  [3347, 'SLACK ST', 'Slack St', 'good'],
  [3379, 'SLACK ST', 'Slack St', 'limited'],
  [3383, 'SLACK ST', 'Slack St', 'low'],
  [3375, 'SLACK ST', 'Slack St', 'good'],
  [3348, 'SLACK ST', 'Slack St', 'limited'],
  [1401, 'MURRAY AVE', 'Murray Ave', 'good'],
  [1480, 'MURRAY AVE', 'Murray Ave', 'limited'],
  [2244, 'MURRAY AVE', 'Murray Ave', 'low'],
  [1746, 'MURRAY AVE', 'Murray Ave', 'good'],
  [2142, 'MURRAY AVE', 'Murray Ave', 'limited'],
  [2002, 'GRAND AVE', 'Grand Ave', 'good'],
  [1903, 'GRAND AVE', 'Grand Ave', 'limited'],
  [2122, 'GRAND AVE', 'Grand Ave', 'low'],
  [1686, 'GRAND AVE', 'Grand Ave', 'good'],
  [2344, 'GRAND AVE', 'Grand Ave', 'limited'],
  [2322, 'GRAND AVE', 'Grand Ave', 'good'],
  [2323, 'GRAND AVE', 'Grand Ave', 'limited'],
  [2326, 'GRAND AVE', 'Grand Ave', 'low'],
  [2001, 'CALIFORNIA BLVD', 'California Blvd', 'good'],
  [2271, 'CALIFORNIA BLVD', 'California Blvd', 'limited'],
  [2270, 'CALIFORNIA BLVD', 'California Blvd', 'good'],
  [3378, 'CALIFORNIA BLVD', 'California Blvd', 'limited'],
  [1420, 'FOOTHILL BLVD', 'Foothill Blvd', 'low'],
  [2222, 'FOOTHILL BLVD', 'Foothill Blvd', 'good'],
  [2233, 'FOOTHILL BLVD', 'Foothill Blvd', 'limited'],
  [1639, 'HATHWAY AVE', 'Hathway Ave', 'good'],
  [1843, 'HATHWAY AVE', 'Hathway Ave', 'limited'],
  [1749, 'HATHWAY AVE', 'Hathway Ave', 'low'],
  [2296, 'COLLEGE AVE', 'College Ave', 'good'],
  [815, 'COLLEGE AVE', 'College Ave', 'limited'],
  [2173, 'ABBOTT ST', 'Abbott St', 'limited'],
  [2333, 'ABBOTT ST', 'Abbott St', 'low']
];
export const STREET_AREAS = STREET_RECORDS.map(([sourceId, gisName, name, demoChance]) => ({
  id: 'slo-street-' + sourceId, sourceId, gisName, name, shortName: name, kind: 'street',
  dataset: 'campus-research', categories: ['Street parking', 'Check signs'],
  policyComplete: false, occupancy: 'unknown', entrance: null, walkMinutes: null,
  sourceUrl: CITY_PARKING, checkedOn: CHECKED_ON, rules: {}, demoChance,
  note: 'City street geometry only. Parking on either side, permit requirements, curb markings, and temporary signs have not been verified. The chance color is an illustrative demo estimate.',
}));
export const PARKING_AREAS = [...CAMPUS_AREAS, ...STREET_AREAS];

export const CHANCE = Object.freeze({
  good: { color: '#55df78', label: 'Good chance', short: 'Good' },
  limited: { color: '#ffc34a', label: 'Fair chance', short: 'Limited' },
  low: { color: '#ff626b', label: 'Low chance', short: 'Low' },
  unknown: { color: '#8a98a9', label: 'Availability unknown', short: 'Unknown' },
  restricted: { color: '#8995a3', label: 'Check restrictions', short: 'Restricted' },
});
const LOT_DEMO_CHANCES = {
  'cal-poly-slo-h1': 'good', 'cal-poly-slo-grand-structure': 'limited',
  'cal-poly-slo-g2': 'limited', 'cal-poly-slo-structure-131': 'low',
  'cal-poly-slo-h14': 'low', 'cal-poly-slo-h12': 'good',
  'cal-poly-slo-h16': 'limited', 'cal-poly-slo-a1': 'low',
};
export function parkingDisplay(area, eligibility, showEstimates = true) {
  if (area.rules.closed || eligibility?.status === 'ineligible') return { ...CHANCE.restricted, color: CHANCE.low.color, label: area.rules.closed ? 'Closed to parking' : 'Not eligible for this trip', reason: eligibility?.reason || 'This location is closed to parking.', chance: 'restricted', locked: true, illustrative: false };
  const chance = showEstimates ? area.demoChance || LOT_DEMO_CHANCES[area.id] || 'unknown' : 'unknown';
  const reason = { good: 'Green: good parking chance in the demo preview. An open space is not confirmed.', limited: 'Yellow: limited parking chance in the demo preview. Availability is unknown; this is not a measured occupancy report.', low: 'Red: low parking chance in the demo preview. This does not mean the location is confirmed full.', unknown: 'Actual space availability is unknown. No live occupancy feed is connected.' }[chance];
  return { ...CHANCE[chance], reason, chance, locked: false, illustrative: chance !== 'unknown' };
}
export function mapStreetFeatures(data) {
  return { type: 'FeatureCollection', features: STREET_AREAS.flatMap(a => {
    const f = data?.features?.find(x => x.properties?.OBJECTID === a.sourceId && x.properties?.FULLNAME === a.gisName);
    if (!f || !['LineString', 'MultiLineString'].includes(f.geometry?.type) || !featureCenter(f.geometry)) return [];
    return [{ type: 'Feature', id: a.id, geometry: f.geometry, properties: { areaId: a.id, name: a.name, kind: 'street', sourceId: a.sourceId, geometrySource: CITY_STREETS, geometryStatus: 'City street centerline · display bands are approximate, not verified curbs' } }];
  }) };
}
export async function fetchStreetFeatures(signal) {
  const url = CITY_STREETS + '/query?' + new URLSearchParams({ objectIds: STREET_AREAS.map(a => a.sourceId).join(','), outFields: 'OBJECTID,FULLNAME', outSR: '4326', f: 'geojson' });
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error('Neighborhood street geometry is unavailable.');
  const data = await response.json();
  if (data.error || !Array.isArray(data.features)) throw new Error('The City street response was not valid.');
  return mapStreetFeatures(data);
}
