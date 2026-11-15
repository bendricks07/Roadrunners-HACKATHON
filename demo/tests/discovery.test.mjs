import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPUS_AREAS, mapCampusFeatures, campusDateInput, parseCampusDateInput } from '../src/map-model.js';
import { evaluateParking, createManualSession, headBackAt, isValidSession, MINUTE } from '../src/rules.js';

const area = suffix => CAMPUS_AREAS.find(a => a.id === `cal-poly-slo-${suffix}`);
const now = Date.parse('2026-11-16T17:00:00Z');
const plan = { permit: 'commuter', arrivalAt: now, departureAt: now + 90 * MINUTE };

test('G2 GIS commuter classification cannot override the official commuter exclusion', () => {
  assert.equal(evaluateParking(area('g2'), plan).status, 'ineligible');
  assert.equal(evaluateParking(area('g2'), { ...plan, permit: 'unknown' }).status, 'unknown');
});
test('G2 visitor duration limit applies, but staff exception is preserved', () => {
  assert.equal(evaluateParking(area('g2'), { ...plan, permit: 'visitor', departureAt: now + 121 * MINUTE }).status, 'ineligible');
  assert.equal(evaluateParking(area('g2'), { ...plan, permit: 'staff', departureAt: now + 180 * MINUTE }).status, 'unknown');
  assert.equal(evaluateParking(area('g2'), { ...plan, permit: 'visitor', departureAt: now + 120 * MINUTE }).status, 'unknown');
});
test('Grand Avenue and Structure 131 retain separate identity and policy', () => {
  assert.equal(evaluateParking(area('grand-structure'), plan).status, 'unknown');
  assert.equal(evaluateParking(area('structure-131'), plan).status, 'ineligible');
  assert.equal(evaluateParking(area('structure-131'), { ...plan, permit: 'staff' }).status, 'ineligible');
  assert.notEqual(area('grand-structure').polygonId, area('structure-131').polygonId);
});
test('a permanent closure remains excluded even when the user plan is incomplete', () => {
  assert.equal(evaluateParking(area('k1'), {}).status, 'ineligible');
});
test('all researched locations default to unknown occupancy and incomplete permission', () => {
  for (const a of CAMPUS_AREAS) {
    const r = evaluateParking(a, { ...plan, permit: 'visitor' });
    assert.equal(r.occupancy, 'unknown');
    assert.notEqual(r.status, 'eligible');
    assert.notEqual(r.status, 'conditional');
  }
  assert.match(evaluateParking(area('h14'), plan).reason, /subarea/);
});
test('fictional closure reports never establish real campus restrictions', () => {
  const r = { areaId: area('h1').id, type: 'closure', simulated: true, expiresAt: now + MINUTE };
  assert.equal(evaluateParking(area('h1'), plan, [r], now).status, 'unknown');
});
test('reviewed rule windows must cover the entire stay before green or yellow', () => {
  const a = { ...area('h1'), policyComplete: true, rules: { reviewedAt: now, sourceUrl: 'https://example.test/approved-policy', allowedPermits: ['commuter'], validFrom: now, validUntil: now + 120 * MINUTE } };
  assert.equal(evaluateParking(a, plan).status, 'eligible');
  assert.equal(evaluateParking(a, { ...plan, departureAt: now + 121 * MINUTE }).status, 'unknown');
  assert.equal(evaluateParking({ ...a, rules: { ...a.rules, paymentRequired: true } }, plan).status, 'conditional');
});
test('future whole-area closure overlaps the stay; a partial closure is not generalized', () => {
  const a = { ...area('h1'), rules: { closures: [{ startsAt: now + 30 * MINUTE, endsAt: now + 120 * MINUTE, scope: 'whole-area' }] } };
  assert.equal(evaluateParking(a, plan).status, 'ineligible');
  assert.equal(evaluateParking({ ...a, rules: { closures: [{ ...a.rules.closures[0], scope: 'partial' }] } }, plan).status, 'unknown');
});
test('invalid or backwards trips cannot be evaluated as permitted', () => {
  assert.equal(evaluateParking(area('h1'), { ...plan, departureAt: now - MINUTE }).status, 'unknown');
  assert.equal(evaluateParking(area('h1'), { ...plan, arrivalAt: NaN }).status, 'unknown');
});
test('missing geometry is not fabricated and mismatched IDs cannot be attached', () => {
  const none = { features: [] };
  assert.deepEqual(mapCampusFeatures(none, none).features, []);
  const bad = { features: [{ properties: { FID: 26, Names: 'An unrelated lot' }, geometry: { type: 'Point', coordinates: [0, 0] } }] };
  assert.deepEqual(mapCampusFeatures(bad, none).features, []);
});
test('source-backed point fallback remains distinct from a polygon', () => {
  const points = { features: [{ properties: { OBJECTID: 20, Names: 'H-1 Parking Lot' }, geometry: { type: 'Point', coordinates: [-120.66, 35.30] } }] };
  const f = mapCampusFeatures({ features: [] }, points).features[0];
  assert.equal(f.id, area('h1').id);
  assert.equal(f.geometry.type, 'Point');
  assert.match(f.properties.geometryStatus, /boundary not available/);
});
test('campus time parsing uses Los Angeles rather than the device timezone', () => {
  assert.equal(parseCampusDateInput('2026-11-16T09:00'), now);
  assert.equal(campusDateInput(now), '2026-11-16T09:00');
  assert.ok(Number.isNaN(parseCampusDateInput('2026-03-08T02:30')));
  assert.ok(Number.isNaN(parseCampusDateInput('2026-11-01T01:30')));
  assert.ok(Number.isNaN(parseCampusDateInput('2026-02-30T09:00')));
  assert.ok(parseCampusDateInput('2026-11-17T00:30') > parseCampusDateInput('2026-11-16T23:30'));
});
test('manual reminders require the driver’s deadline and walk estimate', () => {
  const options = { area: area('h1'), permit: 'commuter', destinationId: 'library', now, deadlineAt: now + 120 * MINUTE, walkMinutes: 12, bufferMinutes: 5 };
  assert.throws(() => createManualSession({ ...options, walkMinutes: NaN }), /walk/);
  assert.throws(() => createManualSession({ ...options, deadlineAt: now }), /future/);
  assert.throws(() => createManualSession({ ...options, area: area('k1') }), /closed/);
  assert.throws(() => createManualSession({ ...options, area: area('g2'), permit: 'visitor', deadlineAt: now + 121 * MINUTE }), /allowed parking time is 2 hours/);
  const saved = JSON.parse(JSON.stringify(createManualSession(options)));
  assert.equal(saved.manual, true);
  assert.equal(saved.deadlineAt, now + 120 * MINUTE);
  assert.equal(headBackAt(saved.deadlineAt, saved.walkMinutes, saved.bufferMinutes), now + 103 * MINUTE);
  assert.equal(isValidSession(saved, CAMPUS_AREAS.map(a => a.id), ['library']), true);
});
