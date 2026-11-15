import test from 'node:test';
import assert from 'node:assert/strict';
import { STREET_AREAS, PARKING_AREAS, mapStreetFeatures, parkingDisplay, fetchStreetFeatures } from '../src/street-model.js';
import { featureCenter } from '../src/map-model.js';
import { evaluateParking, createManualSession, isValidSession, headBackAt, MINUTE } from '../src/rules.js';

const now = Date.parse('2026-11-16T17:00:00Z');
const plan = { permit: 'commuter', arrivalAt: now, departureAt: now + 90 * MINUTE };
const street = STREET_AREAS[0];
const line = { type: 'LineString', coordinates: [[-120.661425, 35.293111], [-120.659217, 35.293098]] };
const record = { type: 'Feature', geometry: line, properties: { OBJECTID: street.sourceId, FULLNAME: street.gisName } };

test('chance preview never changes unconfirmed street eligibility or unknown occupancy', () => {
  for (const area of STREET_AREAS) {
    const eligibility = evaluateParking(area, plan);
    assert.equal(eligibility.status, 'unknown');
    assert.equal(eligibility.occupancy, 'unknown');
    assert.equal(area.policyComplete, false);
    const preview = parkingDisplay(area, eligibility);
    assert.equal(preview.illustrative, false);
    assert.ok(['rules', 'restricted'].includes(preview.chance));
    assert.notEqual(preview.color, '#55df78');
    assert.equal(parkingDisplay(area, eligibility, false).chance, preview.chance);

  }
});
test('known closure or permit exclusion overrides every demo chance', () => {
  for (const id of ['cal-poly-slo-k1', 'cal-poly-slo-g2', 'cal-poly-slo-structure-131']) {
    const area = PARKING_AREAS.find(a => a.id === id);
    const eligibility = evaluateParking(area, plan);
    assert.equal(eligibility.status, 'ineligible');
    const display = parkingDisplay(area, eligibility);
    assert.equal(display.locked, true);
    assert.equal(display.chance, 'restricted');
    assert.equal(display.illustrative, false);
  }
});
test('street source IDs AND exact names must match; polygons cannot masquerade as curbs', () => {
  const mapped = mapStreetFeatures({ features: [record] }).features;
  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].id, street.id);
  assert.deepEqual(mapped[0].geometry, line);
  assert.match(mapped[0].properties.geometryStatus, /approximate/);
  assert.equal(mapStreetFeatures({ features: [{ ...record, properties: { ...record.properties, FULLNAME: 'ANOTHER ST' } }] }).features.length, 0);
  assert.equal(mapStreetFeatures({ features: [{ ...record, properties: { ...record.properties, OBJECTID: -1 } }] }).features.length, 0);
  assert.equal(mapStreetFeatures({ features: [{ ...record, geometry: { type: 'Polygon', coordinates: [line.coordinates] } }] }).features.length, 0);
  assert.equal(mapStreetFeatures({ features: [] }).features.length, 0);
});
test('line geometry produces an area center, not a fabricated entrance', () => {
  assert.deepEqual(featureCenter(line), [35.2931045, -120.660321]);
  assert.deepEqual(featureCenter({ type: 'MultiLineString', coordinates: [line.coordinates] }), featureCenter(line));
  assert.equal(featureCenter({ type: 'LineString', coordinates: [] }), null);
  assert.equal(featureCenter({ type: 'LineString', coordinates: [[NaN, 35.3], [-120.6, 35.3]] }), null);
});
test('street reminders restore with stable source IDs and retain an absolute deadline', () => {
  const session = createManualSession({ area: street, permit: 'commuter', destinationId: 'library', now, deadlineAt: now + 90 * MINUTE, walkMinutes: 12, bufferMinutes: 5 });
  const restored = JSON.parse(JSON.stringify(session));
  assert.equal(isValidSession(restored, PARKING_AREAS.map(a => a.id), ['library']), true);
  assert.equal(restored.manual, true);
  assert.equal(restored.areaId, 'slo-street-1953');
  assert.equal(restored.deadlineAt, now + 90 * MINUTE);
  assert.equal(headBackAt(restored.deadlineAt, restored.walkMinutes, restored.bufferMinutes), now + 73 * MINUTE);
});
test('a City query error is not interpreted as an empty verified street layer', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ error: { code: 500 } }) }));
  await assert.rejects(fetchStreetFeatures(), /not valid/);
});
