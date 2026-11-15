import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePermitSelection, togglePermitSelection } from '../src/data.js';
import { CAMPUS_AREAS, parseCampusDateInput } from '../src/map-model.js';
import { STREET_AREAS, parkingDisplay } from '../src/street-model.js';
import { evaluateParking, bestParkingResult } from '../src/rules.js';
const area = id => CAMPUS_AREAS.find(a => a.id === `cal-poly-slo-${id}`);
const plan = (permit, from = '2026-11-16T09:00', to = '2026-11-16T10:30') => ({ permit, arrivalAt: parseCampusDateInput(from), departureAt: parseCampusDateInput(to) });

test('no permit and not sure are exclusive, and deselecting the final permit means none', () => {
  assert.deepEqual(normalizePermitSelection([]), ['none']);
  assert.deepEqual(normalizePermitSelection(['none', 'staff']), ['none']);
  assert.deepEqual(togglePermitSelection(['commuter', 'staff'], 'none'), ['none']);
  assert.deepEqual(togglePermitSelection(['none'], 'staff'), ['staff']);
  assert.deepEqual(togglePermitSelection(['commuter'], 'commuter'), ['none']);
  assert.deepEqual(togglePermitSelection(['unknown'], 'commuter'), ['commuter']);
});
test('missing permit warns in red during the common weekday window without inventing complete policy', () => {
  const r = evaluateParking(area('h1'), plan('none'));
  assert.equal(r.status, 'unknown');
  assert.equal(r.permitConflict, true);
  for (const estimates of [true, false]) {
    const d = parkingDisplay(area('h1'), r, estimates);
    assert.equal(d.color, '#ff626b');
    assert.match(d.reason, /No permit.*permit-controlled or paid/);
  }
  const street = evaluateParking(STREET_AREAS[0], plan('none'));
  assert.equal(street.permitConflict, undefined);
});
test('weekends, cross-day trips, and residential 24/7 rules stay distinct', () => {
  const weekend = plan('none', '2026-11-15T09:00', '2026-11-15T10:30');
  assert.equal(evaluateParking(area('h1'), weekend).suppressEstimate, true);
  assert.equal(evaluateParking(area('r3'), weekend).status, 'ineligible');
  assert.match(evaluateParking(area('r3'), weekend).reason, /24\/7/);
  assert.equal(evaluateParking(area('h1'), plan('none', '2026-11-15T23:00', '2026-11-16T07:01')).permitConflict, true);
  assert.equal(evaluateParking(area('h1'), plan('none', '2026-11-16T06:00', '2026-11-16T07:00')).permitConflict, undefined);
  assert.equal(evaluateParking(area('h1'), plan('none', '2026-11-16T17:00', '2026-11-16T18:00')).suppressEstimate, true);
});
test('known commuter exclusions and verified allowed-permit lists show the specific conflict', () => {
  assert.match(parkingDisplay(area('c1'), evaluateParking(area('c1'), plan('commuter'))).reason, /no general commuter spaces/);
  const p = plan('commuter');
  const verified = { ...area('h1'), policyComplete: true, rules: { reviewedAt: p.arrivalAt, sourceUrl: 'https://example.test/policy', allowedPermits: ['staff'], validFrom: p.arrivalAt, validUntil: p.departureAt } };
  const r = evaluateParking(verified, p);
  assert.equal(r.status, 'ineligible');
  assert.match(r.reason, /require staff.*commuter/);
  assert.equal(evaluateParking({ ...verified, policyComplete: false }, p).status, 'unknown');
});
test('confirmed full requires a fresh verified source and remains separate from demo estimates', () => {
  const now = Date.now(), h1 = area('h1');
  const availability = { status: 'full', verified: true, sourceUrl: 'https://example.test/feed', observedAt: now - 1000, expiresAt: now + 1000 };
  const full = parkingDisplay({ ...h1, availability }, {}, false, now);
  assert.equal(full.full, true);
  assert.match(full.reason, /No available spaces/);
  for (const change of [{ verified: false }, { expiresAt: now }, { observedAt: now + 1 }, { sourceUrl: '' }]) assert.notEqual(parkingDisplay({ ...h1, availability: { ...availability, ...change } }, {}, true, now).full, true);
  const conflict = evaluateParking(h1, plan('none'));
  assert.match(parkingDisplay({ ...h1, availability }, conflict, false, now).reason, /No permit.*No available spaces/);
});

test('a matching second permit avoids a false red warning without granting unverified eligibility', () => {
  const r = bestParkingResult(area('c1'), [plan('commuter'), plan('staff')]);
  assert.equal(r.status, 'unknown');
  assert.equal(r.permitConflict, undefined);
  assert.equal(bestParkingResult(area('g2'), [plan('commuter'), plan('staff')]).status, 'unknown');
});
