import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPUS_AREAS, parseCampusDateInput } from '../src/map-model.js';
import { GENERAL_PARKING_IDS } from '../src/campus-permit-policy.js';
import { STREET_AREAS, parkingDisplay } from '../src/street-model.js';
import { evaluateParking } from '../src/rules.js';
const area = id => CAMPUS_AREAS.find(a => a.id === `cal-poly-slo-${id}`);
const plan = (from, to, permit = 'none') => ({ permit, arrivalAt: parseCampusDateInput(from), departureAt: parseCampusDateInput(to) });

test('Grand ordinary spaces have no general permit requirement for the exact Friday-Monday window', () => {
  const r = evaluateParking(area('grand-structure'), plan('2026-11-13T17:00', '2026-11-16T07:00'));
  assert.equal(r.permitExempt, true);
  assert.equal(r.status, 'unknown'); // Full stall eligibility and occupancy remain distinct.
  assert.equal(r.occupancy, 'unknown');
  assert.equal(r.nextRestrictionAt, parseCampusDateInput('2026-11-16T07:00'));
  assert.match(r.reason, /event parking.*Staff 24\/7.*residential/);
  for (const preview of [true, false]) {
    const d = parkingDisplay(area('grand-structure'), r, preview);
    assert.equal(d.label, 'No general permit required');
    assert.equal(d.illustrative, false);
    assert.equal(d.color, '#258cff');
  }
});
test('Friday 5 PM and Monday 7 AM boundaries check the entire stay', () => {
  const grand = area('grand-structure');
  for (const p of [plan('2026-11-13T16:59', '2026-11-13T18:00'), plan('2026-11-15T18:00', '2026-11-16T07:01'), plan('2026-11-16T07:00', '2026-11-16T08:00')]) assert.equal(evaluateParking(grand, p).permitConflict, true);
  assert.equal(evaluateParking(grand, plan('2026-11-15T06:00', '2026-11-15T08:00')).permitExempt, true);
});
test('weekday night exemptions and Mon-Thu evening enforcement use campus time', () => {
  const h1 = area('h1');
  assert.equal(evaluateParking(h1, plan('2026-11-16T22:00', '2026-11-17T07:00')).permitExempt, true);
  assert.equal(evaluateParking(h1, plan('2026-11-16T21:59', '2026-11-16T22:30')).permitConflict, true);
  assert.equal(evaluateParking(h1, plan('2026-11-16T18:00', '2026-11-16T19:00')).permitConflict, true);
});
test('reviewed scope excludes residential, timed, mixed H14, restricted, construction and City streets', () => {
  const p = plan('2026-11-15T09:00', '2026-11-15T10:00');
  for (const id of ['r3', 'r4', 'structure-131', 'g2', 'h14', 'c6', 'h11', 'k1']) assert.notEqual(evaluateParking(area(id), p).permitExempt, true, id);
  assert.notEqual(evaluateParking(STREET_AREAS[0], p).permitExempt, true);
  for (const id of GENERAL_PARKING_IDS) assert.equal(evaluateParking(CAMPUS_AREAS.find(a => a.id === id), p).permitExempt, true, id);
});
test('closures override exemptions and special G2 limits remain enforced on weekends', () => {
  const p = plan('2026-11-15T09:00', '2026-11-15T12:00');
  const closure = { ...area('grand-structure'), rules: { closures: [{ startsAt: p.arrivalAt, endsAt: p.departureAt, scope: 'whole-area', reason: 'Verified event closure' }] } };
  assert.equal(evaluateParking(closure, p).status, 'ineligible');
  assert.notEqual(evaluateParking({ ...area('grand-structure'), rules: { maxStayMinutes: 60 } }, p).permitExempt, true);
  assert.equal(evaluateParking(area('g2'), { ...p, permit: 'visitor' }).status, 'ineligible');
});
test('DST weekends retain the Monday deadline without a 24-hour assumption', () => {
  for (const [friday, monday] of [['2026-10-30T17:00', '2026-11-02T07:00'], ['2027-03-12T17:00', '2027-03-15T07:00']]) {
    const p = plan(friday, monday);
    const r = evaluateParking(area('grand-structure'), p);
    assert.equal(r.permitExempt, true);
    assert.equal(r.nextRestrictionAt, p.departureAt);
  }
});
test('Grand Commuter Annual requires after-5 access while Grand Annual matches daytime', () => {
  const grand = area('grand-structure');
  assert.equal(evaluateParking(grand, plan('2026-11-16T09:00', '2026-11-16T10:00', 'commuter')).permitConflict, true);
  assert.equal(evaluateParking(grand, plan('2026-11-16T17:00', '2026-11-16T19:00', 'commuter')).ruleLabel, 'Permit matches general spaces');
  assert.equal(evaluateParking(grand, plan('2026-11-16T09:00', '2026-11-16T10:00', 'commuter-grand')).ruleLabel, 'Permit matches general spaces');
  assert.notEqual(evaluateParking(grand, plan('2027-11-15T09:00', '2027-11-15T10:00', 'commuter-grand')).ruleLabel, 'Permit matches general spaces');
  assert.notEqual(evaluateParking(grand, plan('2026-11-16T17:00', '2026-11-17T08:00', 'commuter-grand')).ruleLabel, 'Permit matches general spaces');
});
