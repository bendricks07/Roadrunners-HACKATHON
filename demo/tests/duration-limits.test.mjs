import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateParking, bestParkingResult, createManualSession, MINUTE, formatParkingDuration } from '../src/rules.js';
import { STREET_AREAS, PARKING_AREAS, parkingDisplay } from '../src/street-model.js';
import { parseCampusDateInput } from '../src/map-model.js';
const abbott = STREET_AREAS.filter(a => a.gisName === 'ABBOTT ST');
const start = parseCampusDateInput('2026-11-16T08:00');
const plan = (minutes, permit = 'none') => ({ permit, arrivalAt: start, departureAt: start + minutes * MINUTE });

test('both Abbott segments flag an eleven-hour trip red with reported ten-hour maximum', () => {
  assert.equal(abbott.length, 2);
  for (const area of abbott) for (const permit of ['none', 'unknown', 'commuter', 'staff']) {
    const r = evaluateParking(area, plan(660, permit));
    assert.equal(r.status, 'ineligible');
    assert.equal(r.durationConflict, true);
    assert.equal(r.maxStayMinutes, 600);
    assert.equal(r.limitProvenance, 'user-reported');
    assert.equal(r.nextRestrictionAt, start + 600 * MINUTE);
    assert.match(r.reason, /planned stay is 11 hours; allowed parking time is 10 hours/);
    assert.match(r.reason, /Reported limit.*check the signs/);
    for (const estimates of [true, false]) {
      const d = parkingDisplay(area, r, estimates);
      assert.equal(d.color, '#ff626b');
      assert.equal(d.label, 'Trip exceeds time limit');
      assert.equal(d.illustrative, false);
    }
  }
});
test('exactly ten hours fits only the duration check; longer trips fail and shorter trips never grant permission', () => {
  for (const minutes of [1, 599, 600]) {
    const r = evaluateParking(abbott[0], plan(minutes));
    assert.equal(r.status, 'unknown');
    assert.notEqual(r.durationConflict, true);
    assert.equal(r.occupancy, 'unknown');
    assert.match(parkingDisplay(abbott[0], r).label, /Maximum 10 hours.*reported/);
  }
  assert.equal(evaluateParking(abbott[0], plan(601)).durationConflict, true);
  assert.equal(bestParkingResult(abbott[0], [plan(660, 'commuter'), plan(660, 'staff')]).durationConflict, true);
});
test('existing published limits check trip duration even without a selected permit; staff exception remains scoped', () => {
  const g2 = PARKING_AREAS.find(a => a.id === 'cal-poly-slo-g2');
  assert.equal(evaluateParking(g2, plan(120, 'visitor')).durationConflict, undefined);
  for (const permit of ['unknown', 'none', 'visitor']) {
    const r = evaluateParking(g2, plan(121, permit));
    assert.equal(r.durationConflict, true);
    assert.match(r.reason, /allowed parking time is 2 hours/);
  }
  assert.equal(evaluateParking(g2, plan(180, 'staff')).durationConflict, undefined);
  assert.equal(evaluateParking(abbott[0], plan(601, 'staff')).durationConflict, true);
});
test('elapsed duration crosses midnight and DST without silently resetting the limit', () => {
  const arrivalAt = parseCampusDateInput('2026-10-31T21:00');
  const departureAt = parseCampusDateInput('2026-11-01T07:00'); // Eleven elapsed hours on fall-back night.
  const r = evaluateParking(abbott[0], { permit: 'none', arrivalAt, departureAt });
  assert.equal(r.plannedStayMinutes, 660);
  assert.equal(r.durationConflict, true);
  assert.equal(evaluateParking(abbott[0], { permit: 'none', arrivalAt, departureAt: arrivalAt - MINUTE }).status, 'unknown');
});
test('overlong manual sessions are rejected and missing time limits never become unrestricted parking', () => {
  assert.throws(() => createManualSession({ area: abbott[0], permit: 'none', now: start, deadlineAt: start + 601 * MINUTE, walkMinutes: 10 }), /Trip too long/);
  const noLimit = { ...abbott[0], rules: {} };
  const r = evaluateParking(noLimit, plan(660));
  assert.equal(r.status, 'unknown');
  assert.equal(r.maxStayMinutes, undefined);
  assert.equal(formatParkingDuration(90), '1 hour 30 minutes');
  assert.equal(formatParkingDuration(NaN), 'Not set');
});
