export const MINUTE = 60_000;

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
  const relevant = activeReports(reports, now).filter(r => r.areaId === area.id);
  const nextRestrictionAt = now + area.maxStayMinutes * MINUTE;
  if (relevant.some(r => r.type === 'closure')) return { status: 'ineligible', reason: 'Entrance closure reported. Choose a backup.', nextRestrictionAt };
  if (!plan.permit || plan.permit === 'unknown') return { status: 'unknown', reason: 'Choose your permit to check this option.', nextRestrictionAt };
  if (!area.permits.includes(plan.permit)) return { status: 'ineligible', reason: 'Your selected permit does not cover this demo lot.', nextRestrictionAt };
  if (!Number.isFinite(plan.durationMinutes) || plan.durationMinutes <= 0) return { status: 'unknown', reason: 'Set a valid length of stay.', nextRestrictionAt };
  if (plan.durationMinutes > area.maxStayMinutes) return { status: 'ineligible', reason: `The demo time limit is ${area.maxStayMinutes / 60} hours.`, nextRestrictionAt };
  return { status: 'eligible', reason: plan.permit === 'visitor' ? 'Fits your stay · Payment required in demo' : 'Your permit covers this demo stay', nextRestrictionAt };
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
