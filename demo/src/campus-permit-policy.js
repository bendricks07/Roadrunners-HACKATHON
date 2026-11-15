import { campusDateInput, parseCampusDateInput, ENFORCEMENT_SOURCE, LOT_SOURCE } from './map-model.js';

export const POLICY_CHECKED_ON = '2026-11-15';
export const COMMUTER_SOURCE = 'https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/general';
export const WEEKEND_SOURCE = 'https://academic-personnel.calpoly.edu/content/handbook/emplinfo';
// Reviewed facilities containing ordinary commuter/staff spaces. This does not
// describe residential, timed, metered, reserved, construction or special stalls.
export const GENERAL_PARKING_IDS = new Set([
  'grand-structure', 'h1', 'h12', 'h16', 'h13', 'h15', 'h14a',
  'c1', 'c2', 'c5', 'c7', 'h2', 'h4', 'h10', 'dairy', 'crops', 'poultry', 'meat-processing',
].map(id => `cal-poly-slo-${id}`));
const COMMUTER_LOTS = new Set(['h1', 'h12', 'h13', 'h14a', 'h15', 'h16'].map(id => `cal-poly-slo-${id}`));
const GRAND_PRODUCT_LOTS = new Set(['h1', 'h12', 'h14a', 'h16', 'grand-structure'].map(id => `cal-poly-slo-${id}`));
const EXCEPTIONS = 'Ordinary spaces only: event parking, Staff 24/7, residential, reserved, accessible, loading and signed meter restrictions still apply. Space availability is unknown.';
const timelineCache = new Map();

function timeline(arrivalAt, departureAt) {
  const key = `${arrivalAt}:${departureAt}`;
  if (timelineCache.has(key)) return timelineCache.get(key);
  if (departureAt - arrivalAt > 31 * 86400_000) return null;
  const firstDate = campusDateInput(arrivalAt).slice(0, 10);
  const firstNoon = Date.parse(firstDate + 'T12:00:00Z');
  const days = Math.ceil((departureAt - arrivalAt) / 86400_000) + 9;
  const windows = [], daytime = [];
  for (let day = 0; day <= days; day++) {
    const noon = new Date(firstNoon + day * 86400_000);
    const weekday = noon.getUTCDay(), date = noon.toISOString().slice(0, 10);
    if (weekday === 0 || weekday === 6) continue;
    const opens = parseCampusDateInput(date + 'T07:00');
    const closes = parseCampusDateInput(date + (weekday === 5 ? 'T17:00' : 'T22:00'));
    windows.push([opens, closes]);
    daytime.push([opens, parseCampusDateInput(date + 'T17:00')]);
  }
  const overlaps = list => list.some(([open, close]) => arrivalAt < close && departureAt > open);
  const next = windows.find(([open]) => open >= arrivalAt)?.[0] ?? null;
  const result = { enforced: overlaps(windows), daytime: overlaps(daytime), next };
  if (timelineCache.size > 16) timelineCache.clear();
  timelineCache.set(key, result);
  return result;
}

export function researchedPermitRule(area, plan) {
  if (!GENERAL_PARKING_IDS.has(area.id) || area.rules?.closed || area.rules?.maxStayMinutes || area.rules?.deniedPermits?.length || area.policyComplete) return null;
  const schedule = timeline(plan.arrivalAt, plan.departureAt);
  if (!schedule) return null;
  const common = { status: 'unknown', occupancy: 'unknown', ruleReviewed: true, ruleSource: ENFORCEMENT_SOURCE, ruleCheckedOn: POLICY_CHECKED_ON, scope: 'ordinary spaces only', suppressEstimate: true };
  if (!schedule.enforced) return {
    ...common, permitExempt: true, ruleLabel: 'No general permit required', ruleTone: 'info', nextRestrictionAt: schedule.next,
    ruleSummary: 'No general permit required for ordinary spaces during this trip. The regular weekend window is Friday 5 PM to Monday 7 AM. Event, 24/7, reserved and signed restrictions still apply.',
    reason: `No general permit required for ordinary spaces throughout this trip under the published schedule: Mon-Thu 7 AM-10 PM; Fri 7 AM-5 PM. The regular weekend window runs Friday 5 PM to Monday 7 AM. ${EXCEPTIONS} Overnight vehicle storage is not confirmed by this rule.`,
  };
  if (plan.permit === 'none') return {
    ...common, permitConflict: true, ruleLabel: 'Permit or payment required',
    ruleSummary: 'No permit: your trip overlaps published permit hours. Obtain the correct permit or pay in a designated space. Academic breaks, campus holidays and special-space signs may change the requirement.',
    reason: `No permit: ${area.name} has permit-controlled or paid spaces and your trip overlaps published general enforcement (Mon-Thu 7 AM-10 PM; Fri 7 AM-5 PM). Obtain the right permit or pay for a designated space. Academic breaks and campus holidays may change hours; check signs. Space availability is unknown.`,
  };
  const withinGuide = plan.arrivalAt >= parseCampusDateInput('2026-08-24T00:00') && plan.departureAt <= parseCampusDateInput('2027-05-22T00:00');
  const grand = area.id === 'cal-poly-slo-grand-structure';
  if (grand && plan.permit === 'commuter' && schedule.daytime && withinGuide) return {
    ...common, permitConflict: true, ruleSource: COMMUTER_SOURCE,
    reason: 'Permit mismatch: ordinary Commuter Annual is valid in Grand Avenue Structure only after 5 PM. This trip overlaps daytime enforcement. Use the correct Grand product or another signed paid option; check special-space restrictions.',
  };
  const sameDay = campusDateInput(plan.arrivalAt).slice(0, 10) === campusDateInput(plan.departureAt).slice(0, 10);
  const matched = withinGuide && sameDay && (plan.permit === 'commuter' && (COMMUTER_LOTS.has(area.id) || grand && !schedule.daytime) || plan.permit === 'commuter-grand' && GRAND_PRODUCT_LOTS.has(area.id));
  if (matched) return {
    ...common, ruleLabel: 'Permit matches general spaces', ruleTone: 'info', ruleSource: COMMUTER_SOURCE,
    ruleSummary: 'The published guide lists this permit for designated general spaces during your trip. Confirm that the permit is active and the stall matches; special-space rules still apply.',
    reason: `The published 2026-27 guide lists your selected product for designated general spaces in ${area.name}${grand && plan.permit === 'commuter' ? ' after 5 PM' : ''}. Confirm that your permit is active and the stall matches. ${EXCEPTIONS} The product does not authorize overnight parking.`,
  };
  return { ...common, ruleLabel: 'Permit requirements published', ruleTone: 'caution', reason: `General enforcement applies to part of this trip: Mon-Thu 7 AM-10 PM; Fri 7 AM-5 PM. The exact permit or payment option still needs checking. Academic breaks and campus holidays may change hours. ${EXCEPTIONS}`, ruleSource: LOT_SOURCE };
}
