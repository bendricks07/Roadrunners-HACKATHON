export const MINUTE = 60_000;

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

export function evaluateCampusParking(area, plan) {
  const rules = area.rules || {};
  const result = (status, reason, nextRestrictionAt = null) => ({ status, reason, nextRestrictionAt, occupancy: 'unknown' });
  if (rules.closed) return result('ineligible', 'Campus closure notice: this lot is permanently closed.');
  if (!Number.isFinite(plan.arrivalAt) || !Number.isFinite(plan.departureAt) || plan.departureAt <= plan.arrivalAt) return result('unknown', 'Choose a valid arrival and departure in campus time.');
  if (!plan.permit || plan.permit === 'unknown') return result('unknown', 'Select your permit. Unconfirmed rules still need checking.');
  if (rules.deniedPermits?.includes(plan.permit)) return result('ineligible', 'The official lot directory excludes your selected permit here.');
  if (rules.maxStayMinutes && !rules.limitExemptPermits?.includes(plan.permit) && plan.departureAt - plan.arrivalAt > rules.maxStayMinutes * MINUTE) return result('ineligible', `Your stay exceeds the published ${rules.maxStayMinutes / 60}-hour limit.`, plan.arrivalAt + rules.maxStayMinutes * MINUTE);
  for (const restriction of rules.closures || []) {
    if (restriction.scope === 'whole-area' && plan.arrivalAt < restriction.endsAt && plan.departureAt > restriction.startsAt) return result('ineligible', restriction.reason || 'A closure overlaps your planned stay.', restriction.startsAt);
  }
  if (!area.policyComplete || !rules.reviewedAt || !rules.sourceUrl) return result('unknown', area.id.endsWith('-h14') ? 'Choose and verify the H14 subarea before applying its rules.' : 'The full permit, space, and time rules are not confirmed. Check the official source and posted signs.');
  if (!rules.allowedPermits?.includes(plan.permit)) return result('unknown', 'Eligibility for this permit has not been established.');
  if (!Number.isFinite(rules.validFrom) || !Number.isFinite(rules.validUntil) || plan.arrivalAt < rules.validFrom || plan.departureAt > rules.validUntil) return result('unknown', 'The reviewed policy does not cover this entire stay.');
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
