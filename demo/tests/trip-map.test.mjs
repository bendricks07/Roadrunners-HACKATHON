import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTrip } from '../src/trip-model.js';
import { createGeographicMap } from '../src/geographic-map.js';
import { parkingDisplay, STREET_AREAS, PARKING_AREAS } from '../src/street-model.js';
import { evaluateParking } from '../src/rules.js';

test('trip requires ordered valid campus times, including DST transitions', () => {
  assert.equal(validateTrip('2026-11-16T09:00', '2026-11-16T10:30'), '');
  for (const [start, end] of [['', ''], ['2026-11-16T10:30', '2026-11-16T09:00'], ['2026-11-16T10:30', '2026-11-16T10:30'], ['2026-03-08T02:30', '2026-03-08T04:00'], ['2026-11-01T01:30', '2026-11-01T04:00']]) assert.ok(validateTrip(start, end));
});

test('colors explain estimates and preserve the actual permit conflict', () => {
  const plan = { permit: 'commuter', arrivalAt: Date.parse('2026-11-16T17:00Z'), departureAt: Date.parse('2026-11-16T18:00Z') };
  const area = PARKING_AREAS.find(a => a.id === 'cal-poly-slo-g2');
  const eligibility = evaluateParking(area, plan), display = parkingDisplay(area, eligibility);
  assert.equal(display.reason, eligibility.reason);
  assert.equal(display.color, '#ff626b');
  assert.equal(display.illustrative, false);
  assert.match(parkingDisplay(STREET_AREAS.find(a => a.demoChance === 'limited'), {}).reason, /Yellow.*not a measured/);
  assert.match(parkingDisplay(STREET_AREAS.find(a => a.demoChance === 'low'), {}).reason, /not.*confirmed full/);
  assert.match(parkingDisplay(area, { status: 'unknown' }, false).reason, /unknown/);
});

test('Abbott uses both exact City identities without asserting parking permission', () => {
  const abbott = STREET_AREAS.filter(a => a.gisName === 'ABBOTT ST');
  assert.deepEqual(abbott.map(a => a.sourceId), [2173, 2333]);
  assert.ok(abbott.every(a => !a.policyComplete && a.occupancy === 'unknown'));
});

test('style changes restore parking overlays with the latest data and selection', async t => {
  let map;
  class FakeMap {
    constructor() { map = this; this.events = {}; this.sources = new Map(); this.layers = new Map(); this.touchZoomRotate = { disableRotation() {} }; }
    addControl() {}
    on(name, fn) { this.events[name] = fn; }
    getSource(id) { return this.sources.get(id); }
    addSource(id, source) { this.sources.set(id, { ...source, setData(data) { this.data = data; } }); }
    getLayer(id) { return this.layers.get(id); }
    addLayer(layer) { this.layers.set(layer.id, layer); }
    setStyle(style, options) { this.sources.clear(); this.layers.clear(); this.style = style; assert.equal(options.diff, false); }
    remove() {}
  }
  const element = () => ({ style: { setProperty() {} }, setAttribute() {}, addEventListener() {} });
  class Marker { setLngLat() { return this; } addTo() { return this; } remove() {} }
  Object.defineProperty(globalThis, 'window', { value: { maplibregl: { Map: FakeMap, Marker, AttributionControl: class {}, setWorkerUrl() {} } }, configurable: true });
  Object.defineProperty(globalThis, 'document', { value: { createElement: element }, configurable: true });
  t.after(() => { delete globalThis.window; delete globalThis.document; });
  const adapter = await createGeographicMap({}, { basemap: 'satellite', onStatus() {}, onError() {} });
  const street = STREET_AREAS[0];
  const fc = { type: 'FeatureCollection', features: [{ type: 'Feature', id: street.id, properties: { areaId: street.id }, geometry: { type: 'LineString', coordinates: [[-120.65, 35.29], [-120.66, 35.29]] } }] };
  const displays = { [street.id]: { color: '#ffc34a', recommended: true } };
  adapter.update(fc, displays, street.id);
  map.events['style.load']();
  for (const view of ['dark', 'standard', 'terrain', 'satellite', 'dark']) {
    adapter.setView(view);
    // A selection/permit change while the replacement style is loading must win.
    adapter.update(fc, displays, street.id);
    map.events['style.load']();
    assert.equal(map.getSource('parking').data.features[0].properties.selected, true);
    assert.equal(map.getSource('parking').data.features[0].properties.color, '#ffc34a');
    for (const id of ['parking-fill', 'parking-outline', 'curb--1', 'curb-1', 'street-hit', 'street-selection']) assert.ok(map.getLayer(id), `${view}: ${id}`);
  }
  adapter.destroy();
});
