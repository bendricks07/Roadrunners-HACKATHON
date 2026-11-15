import { campusDateInput, parseCampusDateInput } from './map-model.js';

export const CITY_ZONE_SOURCE = 'https://mapsa.slocity.org/hosting/rest/services/sloGISlayers/slogisLandManagement/FeatureServer/31';
export const CITY_PERMIT_SOURCE = 'https://www.slocity.org/government/department-directory/public-works/parking-services/residential-permits';
export const CITY_CEILING_SOURCE = 'https://www.slocity.org/services/how-do-i/faqs';
export const ASI_PARKING_SOURCE = 'https://www.asi.calpoly.edu/facilities/recreation-center/';
export const CITY_REVIEWED_ON = '2026-11-15';
export const CITY_PERMITS = [
  { id: 'alta-vista', label: 'Alta Vista residential permit' },
  { id: 'monterey-heights', label: 'Monterey Heights residential permit' },
  { id: 'murray', label: 'Murray residential permit' },
];
// Facts from the City's current zone attributes. Polygon geometry is NOT bundled.
export const CITY_DISTRICTS = {
  1: { name: 'Monterey Heights', permitId: 'monterey-heights', hours: 'Mon-Fri 2 AM-10 PM', days: [1,2,3,4,5], start: 120, end: 1320 },
  6: { name: 'Murray', permitId: 'murray', hours: 'Mon-Fri 8 AM-5 PM', days: [1,2,3,4,5], start: 480, end: 1020 },
  8: { name: 'Alta Vista', permitId: 'alta-vista', hours: 'Mon-Fri 2 AM-10 PM', days: [1,2,3,4,5], start: 120, end: 1320 },
  9: { name: 'Alta Vista', permitId: 'alta-vista', hours: 'Mon-Fri 2 AM-5 PM', days: [1,2,3,4,5], start: 120, end: 1020 },
};
// Exact street IDs, address ranges, adjacent zone IDs and mapped timed zones.
// Adjacency was checked within 30 m of centerlines; it is a boundary warning,
// NOT a surveyed curb assignment. Timed zones apply to signed portions only.
const SEGMENTS = {
  1953: [1200,1299,[]], 2146: [1300,1499,[9]], 1966: [1500,1599,[9]],
  2147: [1600,1619,[9]], 2149: [1620,1765,[9]],
  2290: [1800,1899,[1]], 2291: [1900,1999,[1],120,30], 2032: [2000,2093,[1],120,30],
  2151: [2094,2099,[1]], 2152: [2100,2199,[1]],
  3347: [1400,1599,[8],120,29], 3379: [1600,1799,[],120,27],
  3383: [1820,1899,[1]], 3375: [1900,1999,[1]], 3348: [2000,2103,[1]],
  1401: [800,899,[6]], 1480: [1000,1099,[]], 2244: [1100,1199,[]],
  1746: [1200,1289,[]], 2142: [1290,1299,[]],
  2002: [411,499,[1]], 1903: [400,410,[1,9]], 2122: [300,399,[1,9]],
  1686: [200,299,[1,9]], 2344: [110,199,[1]],
  // Tiny junction segments are not assigned an adjacent timed-zone maximum.
  2322: [106,109,[]], 2323: [104,105,[]], 2326: [102,103,[]],
  2001: [200,299,[]], 2271: [190,199,[]], 2270: [132,189,[]], 3378: [120,129,[]],
  1420: [1000,1099,[]], 2222: [1100,1179,[]], 2233: [1180,1199,[]],
  1639: [300,399,[9]], 1843: [200,299,[8,9]], 1749: [150,199,[8,9]],
  2296: [110,189,[]], 815: [100,109,[]],
  2173: [1900,1999,[],600,38], 2333: [1800,1899,[],600,38],
};
const CAMPUS_ROADS = new Set([815,2296,2326,3378]);
const MIXED_JURISDICTION = new Set([3347,3379,3383,3375,3348]);

export function streetPolicyEvidence(sourceId) {
  const record = SEGMENTS[sourceId];
  if (!record) return null;
  const [first,last,districtIds,maxStayMinutes,zoneId] = record;
  return { blockLabel: `${first}-${last} address range`, districtIds, maxStayMinutes: maxStayMinutes || null, zoneId: zoneId || null,
    cityPublicStreet: !CAMPUS_ROADS.has(sourceId) && !MIXED_JURISDICTION.has(sourceId),
    jurisdiction: CAMPUS_ROADS.has(sourceId) ? 'Cal Poly-maintained; campus rules need checking' : MIXED_JURISDICTION.has(sourceId) ? 'City/campus boundary; check the exact side' : 'City-maintained public street',
    checkedOn: CITY_REVIEWED_ON, sourceUrl: CITY_ZONE_SOURCE, boundaryVerified: false };
}

export function streetRules(evidence) {
  if (!evidence) return {};
  if (evidence.maxStayMinutes) return { maxStayMinutes: evidence.maxStayMinutes, limitProvenance: 'city-gis', sourceUrl: CITY_ZONE_SOURCE,
    limitScope: 'City-mapped timed zone: signed portions only; exact curb and enforcement hours need checking', limitReviewedOn: CITY_REVIEWED_ON };
  if (evidence.cityPublicStreet) return { maxStayMinutes: 72*60, limitProvenance: 'city-general-ceiling', limitIsCeiling: true,
    limitScope: 'City public-street same-space ceiling; shorter signed limits can apply', sourceUrl: CITY_CEILING_SOURCE };
  return {};
}

const windowCache = new Map();
export function districtWindowOverlaps(district, arrivalAt, departureAt) {
  if (!Number.isFinite(arrivalAt) || !Number.isFinite(departureAt) || departureAt <= arrivalAt) return false;
  const key = `${district.permitId}:${district.days.join(',')}:${district.start}:${district.end}:${arrivalAt}:${departureAt}`;
  if (windowCache.has(key)) return windowCache.get(key);
  if (departureAt-arrivalAt > 31*86400_000) return true; // Conservative for unusually long trips.
  const noon = Date.parse(campusDateInput(arrivalAt).slice(0,10)+'T12:00:00Z');
  const time = m => `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
  let overlaps = false;
  for (let day=-1; day<=Math.ceil((departureAt-arrivalAt)/86400_000)+1; day++) {
    const date = new Date(noon+day*86400_000);
    if (!district.days.includes(date.getUTCDay())) continue;
    const next = new Date(date.getTime()+(district.end<=district.start?86400_000:0));
    const open = parseCampusDateInput(date.toISOString().slice(0,10)+'T'+time(district.start));
    const close = parseCampusDateInput(next.toISOString().slice(0,10)+'T'+time(district.end));
    if (!Number.isFinite(open) || !Number.isFinite(close) || arrivalAt<close && departureAt>open) { overlaps=true; break; }
  }
  if (windowCache.size>64) windowCache.clear();
  windowCache.set(key,overlaps); return overlaps;
}

export function evaluateCityStreet(area, plan) {
  const evidence = area.cityPolicy;
  const base = { status: 'unknown', occupancy: 'unknown', streetRule: true, ruleSource: CITY_ZONE_SOURCE, ruleCheckedOn: CITY_REVIEWED_ON, suppressEstimate: true, scope: 'Mapped street section; exact signs and side need checking' };
  if (!evidence) return { ...base, ruleLabel: 'Street rules unverified', reason: 'No reviewed block-specific rules are available. Check signs; a campus permit does not authorize City residential parking.', reviewCandidate: false };
  const districts = evidence.districtIds.map(id=>CITY_DISTRICTS[id]).filter(Boolean);
  const active = districts.filter(d=>districtWindowOverlaps(d,plan.arrivalAt,plan.departureAt));
  const held = Array.isArray(plan.cityPermits)?plan.cityPermits:[];
  const missing = active.filter(d=>!held.includes(d.permitId));
  const matching = active.filter(d=>held.includes(d.permitId));
  const districtNames = [...new Set(districts.map(d=>d.name))].join(' / ');
  const windows = [...new Set(districts.map(d=>`${d.name}: ${d.hours}`))].join('; ');
  if (missing.length && !matching.length) return { ...base, permitConflict: true, ruleLabel: 'Check City permit requirement', reviewCandidate: false,
    reason: `City permit warning: ${area.name}, ${evidence.blockLabel}, adjoins ${[...new Set(missing.map(d=>d.name))].join(' / ')} permit zones. Your trip overlaps ${[...new Set(missing.map(d=>d.hours))].join(' or ')} and no matching City permit is selected. A Cal Poly permit does not substitute. Coverage varies by side/part of this block; confirm the signs.`,
    ruleSummary: `No matching City permit selected for nearby ${[...new Set(missing.map(d=>d.name))].join(' / ')} restrictions during this trip. Check the exact curb: ${[...new Set(missing.map(d=>d.hours))].join(' or ')}. Campus permits do not cover City districts.` };
  const timed = evidence.maxStayMinutes;
  const districtStatus = missing.length ? `Your City permit covers one adjacent district, but not ${[...new Set(missing.map(d=>d.name))].join(' / ')}. Select the correct signed side; this block is not uniformly covered.` : districts.length ? active.length ? `Selected City permit matches ${districtNames}; exact side and authorization still need checking.` : `No overlap with the mapped ${districtNames} permit window (${windows}). Other rules still apply.` : 'No district restriction was established for this section; this is not proof that none applies.';
  return { ...base, ruleLabel: timed ? `Signed ${timed/60}-hour zone - check signs` : districts.length ? active.length ? 'City permit selected - check curb' : 'District window inactive - check signs' : 'Local signs need checking',
    reason: `${timed ? `The City maps a ${timed/60}-hour maximum on signed portions of this section. ` : evidence.cityPublicStreet ? 'The City public-street same-space ceiling is 72 hours, but shorter local limits and no-parking signs may apply. ' : evidence.jurisdiction+'. '}${districtStatus} Empty-space availability is unknown.`,
    reviewCandidate: !!timed, cityWindowClear: !active.length, cityPermitMatched: !!matching.length, mixedDistrictPermit: !!missing.length,
    ruleTone: timed && !districts.length ? 'info' : 'caution' };
}
