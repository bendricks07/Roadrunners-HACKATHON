import { researchedPermitRule } from './campus-permit-policy.js';
export const MINUTE = 60_000;

export function formatParkingDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return 'Not set';
  const total = Math.ceil(minutes), hours = Math.floor(total / 60), rest = total % 60;
  return [hours ? `${hours} hour${hours === 1 ? '' : 's'}` : '', rest ? `${rest} minute${rest === 1 ? '' : 's'}` : ''].filter(Boolean).join(' ') || '0 minutes';
}

// Only the common weekday 7-17 window is used: academic-break evening hours
// and current holiday/event calendars are not supplied. Never infer free parking.
const daytimeCache = new Map();
const C_LOTS = new Set(['c1', 'c2', 'c2b', 'c2d', 'c2e', 'c3', 'c4', 'c5', 'c6', 'c7'].map(id => `cal-poly-slo-${id}`));
function overlapsCampusDaytime(start, end) {
  const key = `${start}:${end}`;
  if (!daytimeCache.has(key)) {
    if (daytimeCache.size > 16) daytimeCache.clear();
    daytimeCache.set(key, computeCampusDaytime(start, end));
  }
  return daytimeCache.get(key);
}
function computeCampusDaytime(start, end) {
  const format = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' });
  const daySeen = new Set();
  for (let t = start - 86400_000; t <= end + 86400_000; t += 12 * 60 * MINUTE) {
    const p = Object.fromEntries(format.formatToParts(t).map(x => [x.type, x.value]));
    const date = `${p.year}-${p.month}-${p.day}`;
    if (daySeen.has(date) || ['Sat', 'Sun'].includes(p.weekday)) continue;
    daySeen.add(date);
    // Probe both modern offsets and retain only the one belonging to this day.
    for (const offset of [7, 8]) {
      const open = Date.parse(`${date}T07:00:00Z`) + offset * 60 * MINUTE;
      const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: '2-digit', hourCycle: 'h23' }).format(open));
      if (hour === 7 && start < open + 10 * 60 * MINUTE && end > open) return true;
    }
    if (daySeen.size > 370) break;
  }
  return false;
}

export function parseSavedState(raw) {
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch { return {}; }
}

export function normalizeReports(reports, areaIds, types) {
  if (!Array.isArray(reports)) return [];
  const seen = new Set();
  return reports.filter(r => {
    if (!r || typeof r !== 'object' || typeof r.id !== 'string' || !r.id || seen.has(r.id) || !areaIds.includes(r.areaId) || !Object.hasOwn(types, r.type) || !Number.isFinite(r.createdAt) || !Number.isFinite(r.expiresAt) || r.expiresAt <= r.createdAt || typeof r.description !== 'string') return false;
    seen.add(r.id);
    return true;
  }).map(r => ({
    id: r.id, areaId: r.areaId, type: r.type, title: types[r.type],
    description: r.description.slice(0, 500), createdAt: r.createdAt, expiresAt: r.expiresAt,
    extraWalkMinutes: r.type === 'path' ? (Number.isFinite(r.extraWalkMinutes) && r.extraWalkMinutes >= 0 ? r.extraWalkMinutes : 3) : 0,
    active: r.active !== false, simulated: true, status: 'Community report · Unverified',
  }));
}

export function activeReports(reports, now = Date.now()) {
  return reports.filter(r => r.active !== false && Number(r.expiresAt) > now);
}

export function evaluateParking(area, plan, reports = [], now = Date.now()) {
  if (area.dataset === 'campus-research') return evaluateCampusParking(area, plan);
  const relevant = activeReports(reports, now).filter(r => r.areaId === area.id);
  const nextRestrictionAt = now + area.maxStayMinutes * MINUTE;
  if (relevant.some(r => r.type === 'closure')) return { status: 'ineligible', reason: 'Entrance closure reported. Choose a backup.', nextRestrictionAt };
  if (!plan.permit || plan.permit === 'unknown') return { status: 'unknown', reason: 'Choose your permit to check this option.', nextRestrictionAt };
  if (!area.permits.includes(plan.permit)) return { status: 'ineligible', reason: 'Your selected permit does not cover this demo lot.', nextRestrictionAt };
  if (!Number.isFinite(plan.durationMinutes) || plan.durationMinutes <= 0) return { status: 'unknown', reason: 'Set a valid length of stay.', nextRestrictionAt };
  if (plan.durationMinutes > area.maxStayMinutes) return { status: 'ineligible', reason: `The demo time limit is ${area.maxStayMinutes / 60} hours.`, nextRestrictionAt };
  return { status: 'eligible', reason: plan.permit === 'visitor' ? 'Fits your stay · Payment required in demo' : 'Your permit covers this demo stay', nextRestrictionAt };
}

export function bestParkingResult(area, plans) {
  const rank = { eligible: 0, conditional: 1, unknown: 2, ineligible: 3 };
  return plans.map(plan => evaluateParking(area, plan)).sort((a, b) => rank[a.status] - rank[b.status] || Number(!!a.permitConflict) - Number(!!b.permitConflict))[0] || evaluateParking(area, {});
}

export function evaluateCampusParking(area, plan) {
  const rules = area.rules || {};
  const limitApplies = Number.isFinite(rules.maxStayMinutes) && rules.maxStayMinutes > 0 && !rules.limitExemptPermits?.includes(plan.permit);
  const limit = limitApplies ? { maxStayMinutes: rules.maxStayMinutes, plannedStayMinutes: (plan.departureAt - plan.arrivalAt) / MINUTE, limitProvenance: rules.limitProvenance || 'published', limitScope: rules.limitScope || 'Spaces covered by the published time limit', limitReportedOn: rules.limitReportedOn || null } : {};
  const result = (status, reason, nextRestrictionAt = null) => ({ status, reason, nextRestrictionAt, occupancy: 'unknown', ...limit });
  if (rules.closed) return result('ineligible', 'Campus closure notice: this lot is permanently closed.');
  if (!Number.isFinite(plan.arrivalAt) || !Number.isFinite(plan.departureAt) || plan.departureAt <= plan.arrivalAt) return result('unknown', 'Choose a valid arrival and departure in campus time.');
  // Apply closures before any recurring permit exemption.
  for (const restriction of rules.closures || []) {
    if (restriction.scope === 'whole-area' && plan.arrivalAt < restriction.endsAt && plan.departureAt > restriction.startsAt) return result('ineligible', restriction.reason || 'A closure overlaps your planned stay.', restriction.startsAt);
  }
  // Time limits are independent of permit selection and apply before any
  // general permit-hours exemption. Elapsed time includes daylight-saving shifts.
  if (limitApplies && plan.departureAt - plan.arrivalAt > rules.maxStayMinutes * MINUTE) {
    const provenance = rules.limitProvenance === 'user-reported' ? 'Reported limit - check the signs for exact curbs, hours and exceptions.' : 'Published limit; check the signed space and applicable exceptions.';
    return { ...result('ineligible', `Trip too long: your planned stay is ${formatParkingDuration(limit.plannedStayMinutes)}; allowed parking time is ${formatParkingDuration(rules.maxStayMinutes)}. ${provenance}`, plan.arrivalAt + rules.maxStayMinutes * MINUTE), durationConflict: true };
  }
  const researched = researchedPermitRule(area, plan);
  if (researched && !C_LOTS.has(area.id)) return researched;
  if (researched?.permitExempt || researched?.permitConflict) return researched;
  if (!plan.permit || plan.permit === 'unknown') return result('unknown', 'Select your permit. Unconfirmed rules still need checking.');
  if (plan.permit === 'none' && area.kind !== 'street') {
    const residential = ['cal-poly-slo-r3', 'cal-poly-slo-r4', 'cal-poly-slo-structure-131'].includes(area.id);
    if (residential) return result('ineligible', `No permit: ${area.name} is a residential parking area with authorization required 24/7. Obtain the correct resident or visitor authorization before parking.`);
    if (overlapsCampusDaytime(plan.arrivalAt, plan.departureAt)) return { ...result('unknown', `No permit: ${area.name} has permit-controlled or paid spaces during standard weekday enforcement. Obtain the correct permit or pay for a designated space. Campus holidays and special signs must still be checked.`), permitConflict: true };
    return { ...result('unknown', 'No permit: general enforcement may be outside your trip, but event, reserved, residential and 24/7 spaces can still require authorization. Check the exact space and signs; parking permission is unconfirmed.'), suppressEstimate: true };
  }
  if (rules.deniedPermits?.includes(plan.permit)) return result('ineligible', 'The official lot directory excludes your selected permit here.');
  if (C_LOTS.has(area.id) && ['commuter', 'commuter-grand', 'r3', 'r4', 'ag-commuter'].includes(plan.permit) && overlapsCampusDaytime(plan.arrivalAt, plan.departureAt)) return { ...result('unknown', `Permit mismatch: ${area.name} has no general commuter spaces in the published C-lot directory. Your selected commuter permit does not cover general staff stalls during daytime enforcement. Separately signed special spaces and holiday exceptions need verification.`), permitConflict: true };
  if (researched) return researched;
  for (const restriction of rules.closures || []) {
    if (restriction.scope === 'whole-area' && plan.arrivalAt < restriction.endsAt && plan.departureAt > restriction.startsAt) return result('ineligible', restriction.reason || 'A closure overlaps your planned stay.', restriction.startsAt);
  }
  if (!area.policyComplete || !rules.reviewedAt || !rules.sourceUrl) return result('unknown', area.id.endsWith('-h14') ? 'Choose and verify the H14 subarea before applying its rules.' : 'The full permit, space, and time rules are not confirmed. Check the official source and posted signs.');
  if (!Number.isFinite(rules.validFrom) || !Number.isFinite(rules.validUntil) || plan.arrivalAt < rules.validFrom || plan.departureAt > rules.validUntil) return result('unknown', 'The reviewed policy does not cover this entire stay.');
  if (!Array.isArray(rules.allowedPermits)) return result('unknown', 'Eligibility for this permit has not been established.');
  if (!rules.allowedPermits.includes(plan.permit)) return result('ineligible', `Permit mismatch: the reviewed rules require ${rules.allowedPermits.join(' or ') || 'separate authorization'}. Your selected permit (${plan.permit}) does not cover this area.`);
  if (rules.paymentRequired) return result('conditional', 'Payment is required. Confirm the correct space, product, and paid-through time.');
  return result('eligible', 'The reviewed rules cover your permit and entire planned stay.');
}

export function createManualSession({ area, destinationId, permit = 'unknown', deadlineAt, walkMinutes, bufferMinutes = 5, note = '', now = Date.now() }) {
  if (!area || area.dataset !== 'campus-research') throw new Error('Choose a real campus parking record.');
  if (!Number.isFinite(deadlineAt) || deadlineAt <= now) throw new Error('Choose a future reminder time.');
  const eligibility = evaluateCampusParking(area, { permit, arrivalAt: now, departureAt: deadlineAt });
  if (eligibility.status === 'ineligible') throw new Error(eligibility.reason);
  if (!Number.isFinite(walkMinutes) || walkMinutes <= 0 || walkMinutes > 180) throw new Error('Enter your return-walk estimate (1–180 minutes).');
  if (!Number.isFinite(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 60) throw new Error('Choose a valid return buffer.');
  return { id: crypto.randomUUID(), areaId: area.id, destinationId, startedAt: now, deadlineAt, deadlineReason: 'Your manual reminder time', walkMinutes, bufferMinutes, note: String(note).slice(0, 240), demo: false, manual: true };
}

export function getWalkMinutes(area, destinationId, reports = [], now = Date.now()) {
  return (area.walk[destinationId] ?? area.walk.library) + activeReports(reports, now).filter(r => r.areaId === area.id && r.type === 'path').reduce((total, r) => total + Math.max(0, Number(r.extraWalkMinutes) || 0), 0);
}

export function calculateDeadline({ startedAt, paidThrough, maxStayMinutes, restrictionAt, permitExpiresAt }) {
  const candidates = [
    { label: 'Confirmed parking time', at: paidThrough },
    { label: 'Maximum stay', at: Number(startedAt) + Number(maxStayMinutes) * MINUTE },
    { label: 'Restriction change', at: restrictionAt },
    { label: 'Permit expiration', at: permitExpiresAt },
  ].filter(item => Number.isFinite(item.at));
  if (!candidates.length) throw new Error('A parking deadline is required.');
  return candidates.sort((a, b) => a.at - b.at)[0];
}

export function headBackAt(deadlineAt, walkMinutes, bufferMinutes) {
  return deadlineAt - (Math.max(0, Number(walkMinutes) || 0) + Math.max(0, Number(bufferMinutes) || 0)) * MINUTE;
}

export function sessionPhase(session, now = Date.now()) {
  if (now >= session.deadlineAt) return 'expired';
  if (now >= headBackAt(session.deadlineAt, session.walkMinutes, session.bufferMinutes)) return 'head-back';
  return 'active';
}

export function createSession({ area, destinationId, durationMinutes, bufferMinutes = 5, note = '', now = Date.now(), reports = [], demo = false }) {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('Choose a valid session duration.');
  const deadline = calculateDeadline({ startedAt: now, paidThrough: now + durationMinutes * MINUTE, maxStayMinutes: area.maxStayMinutes });
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${now}`,
    areaId: area.id, destinationId, startedAt: now, deadlineAt: deadline.at, deadlineReason: deadline.label,
    walkMinutes: getWalkMinutes(area, destinationId, reports, now), bufferMinutes, note: String(note).slice(0, 240), demo,
  };
}

export function isValidSession(value, areaIds, destinationIds) {
  return !!value && typeof value.id === 'string' && areaIds.includes(value.areaId) && destinationIds.includes(value.destinationId) && Number.isFinite(value.startedAt) && Number.isFinite(value.deadlineAt) && value.deadlineAt >= value.startedAt && Number.isFinite(value.walkMinutes) && value.walkMinutes >= 0 && Number.isFinite(value.bufferMinutes) && value.bufferMinutes >= 0 && typeof value.note === 'string';
}
