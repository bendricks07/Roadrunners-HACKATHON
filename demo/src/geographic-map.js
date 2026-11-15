import { CAMPUS_CENTER, featureCenter } from './map-model.js';
import { PARKING_AREAS } from './street-model.js';
import { mapStyle, parkingLayers, NEIGHBORHOOD_VIEW, PHONE_VIEW, PARKING_CREDIT, NAIP_SERVICE } from './map-style.js';

const EMPTY = { type: 'FeatureCollection', features: [] };
const overviewBounds = () => window.innerWidth < 761 ? PHONE_VIEW : NEIGHBORHOOD_VIEW;
const areas = new Map(PARKING_AREAS.map(a => [a.id, a]));
const parkingIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 19V5h5a4 4 0 0 1 0 8H8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const garageIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21V7l8-4 8 4v14M8 21V11h8v10M8 15h8M8 18h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const lockIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="2.3"/><path d="M12 14v3" stroke="var(--pin-surface,#fff)" stroke-width="2" stroke-linecap="round"/></svg>';

function pinElement(area, display, selected) {
  const el = document.createElement('button');
  el.type = 'button'; el.className = `geo-pin ${area.kind} ${selected ? 'selected' : ''} ${display?.locked ? 'locked' : ''}`;
  el.style.setProperty('--pin-color', display?.color || '#8a98a9');
  el.setAttribute('aria-label', `${area.name} · ${display?.label || 'Availability unknown'}${display?.illustrative ? ' · demo estimate' : ''}`);
  el.innerHTML = `<span class="geo-pin-symbol">${display?.locked ? lockIcon : area.kind === 'garage' ? garageIcon : parkingIcon}</span>${area.kind !== 'street' ? `<span class="geo-pin-name">${area.shortName}</span>` : ''}`;
  return el;
}
function paintFeatures(fc, displays, selectedId) {
  return { ...fc, features: fc.features.map(f => ({ ...f, properties: { ...f.properties, color: displays[f.id]?.color || '#8a98a9', selected: f.id === selectedId, locked: displays[f.id]?.locked || false } })) };
}

let googleLoad;
export function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (googleLoad) return googleLoad;
  googleLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const finish = () => { clearTimeout(timer); delete window.campusCurbGoogleReady; };
    const fail = () => { finish(); script.remove(); googleLoad = null; reject(new Error('Google Maps could not load. Check the browser key and website restrictions in Map connection.')); };
    const timer = setTimeout(fail, 18_000);
    window.campusCurbGoogleReady = () => { finish(); resolve(window.google.maps); };
    window.gm_authFailure = fail;
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: apiKey, callback: 'campusCurbGoogleReady', loading: 'async', v: 'weekly' })}`;
    script.async = true; script.onerror = fail; document.head.append(script);
  });
  return googleLoad;
}
const googleDark = [
  { elementType: 'geometry', stylers: [{ color: '#1e2a39' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c1cbd9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1b2735' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#213a31' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#244635' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#46576b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#172331' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#142f46' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

async function googleMap(host, opts) {
  const g = await loadGoogleMaps(opts.apiKey);
  const map = new g.Map(host, { center: { lat: CAMPUS_CENTER[0], lng: CAMPUS_CENTER[1] }, zoom: 15, disableDefaultUI: true, tilt: 0, clickableIcons: false, gestureHandling: 'greedy', keyboardShortcuts: true });
  let pins = [], disposed = false;
  const setView = view => { map.setMapTypeId(view === 'satellite' ? 'hybrid' : view === 'terrain' ? 'terrain' : 'roadmap'); map.setOptions({ styles: view === 'dark' ? googleDark : view === 'standard' ? [{ featureType: 'poi.business', stylers: [{ visibility: 'off' }] }] : null }); };
  setView(opts.basemap);
  const credit = document.createElement('div'); credit.className = 'geo-data-credit'; credit.innerHTML = PARKING_CREDIT;
  map.controls[g.ControlPosition.LEFT_BOTTOM].push(credit);
  class Pin extends g.OverlayView {
    constructor(center, area, display, selected) {
      super(); this.center = new g.LatLng(...center); this.el = pinElement(area, display, selected);
      this.el.addEventListener('click', e => { e.stopPropagation(); opts.onSelect(area.id); }); this.setMap(map);
    }
    onAdd() { this.getPanes().overlayMouseTarget.append(this.el); g.OverlayView.preventMapHitsAndGesturesFrom(this.el); }
    draw() { const p = this.getProjection()?.fromLatLngToDivPixel(this.center); if (p) { this.el.style.left = `${p.x}px`; this.el.style.top = `${p.y}px`; } }
    onRemove() { this.el.remove(); }
  }
  const click = map.data.addListener('click', e => opts.onSelect(e.feature.getId()));
  const clear = map.addListener('click', () => opts.onDeselect?.());
  opts.onStatus('Google Maps', false);
  window.gm_authFailure = () => { if (!disposed) opts.onError('Google rejected the map key. Open Layers → Map connection to check it or use the aerial fallback.'); };
  return {
    provider: 'google',
    update(fc, displays, selectedId) {
      pins.forEach(p => p.setMap(null)); pins = [];
      map.data.forEach(f => map.data.remove(f)); map.data.addGeoJson(paintFeatures(fc, displays, selectedId));
      map.data.setStyle(f => ({ visible: f.getGeometry().getType() !== 'Point', fillColor: f.getProperty('color'), strokeColor: f.getProperty('selected') ? '#5da9ff' : f.getProperty('color'), fillOpacity: .24, strokeOpacity: .96, strokeWeight: f.getProperty('kind') === 'street' ? f.getProperty('selected') ? 8 : 5 : 2, zIndex: f.getProperty('selected') ? 3 : 1, clickable: true }));
      fc.features.forEach(f => { const a = areas.get(f.id); if (a && (a.kind !== 'street' || f.id === selectedId)) pins.push(new Pin(featureCenter(f.geometry), a, displays[f.id], f.id === selectedId)); });
    },
    fit() { const [sw, ne] = overviewBounds(); map.fitBounds({ west: sw[0], south: sw[1], east: ne[0], north: ne[1] }, { left: 30, right: 30, top: 40, bottom: window.innerWidth < 761 ? 125 : 65 }); },
    focus(f) { const p = featureCenter(f?.geometry); if (p) { map.panTo({ lat: p[0], lng: p[1] }); if (map.getZoom() < 16) map.setZoom(16); } },
    locate(p) { map.panTo({ lat: p[0], lng: p[1] }); map.setZoom(16); },
    setView, resize() { g.event.trigger(map, 'resize'); },
    destroy() { disposed = true; click.remove(); clear.remove(); pins.forEach(p => p.setMap(null)); g.event.clearInstanceListeners(map); host.replaceChildren(); },
  };
}

function vectorMap(host, opts) {
  const gl = window.maplibregl;
  if (!gl) throw new Error('Vector map library unavailable.');
  // Use the bundled worker rather than a blob URL, including on hosted CSPs.
  gl.setWorkerUrl('/src/vendor/maplibre/maplibre-gl-csp-worker.js');
  const map = new gl.Map({ container: host, style: mapStyle(opts.basemap), center: [-120.6598, 35.2978], zoom: 14.6, minZoom: 10, maxZoom: 19.5, attributionControl: false, dragRotate: false, pitchWithRotate: false, touchPitch: false, fadeDuration: 180, maxTileCacheSize: 120, renderWorldCopies: false });
  map.addControl(new gl.AttributionControl({ compact: true }), 'bottom-right');
  map.touchZoomRotate.disableRotation();
  let current = EMPTY, displays = {}, selectedId = null, pins = [], view = opts.basemap, failures = 0, locationPin;
  function addLayers() {
    if (!map.getSource('parking')) map.addSource('parking', { type: 'geojson', data: current, attribution: PARKING_CREDIT });
    const before = map.getLayer('street-labels') ? 'street-labels' : undefined;
    const add = layer => { if (!map.getLayer(layer.id)) map.addLayer(layer, before); };
    parkingLayers().forEach(add);
  }
  function updatePins() {
    pins.forEach(p => p.remove()); pins = [];
    current.features.forEach(f => {
      const a = areas.get(f.id); if (!a || (a.kind === 'street' && f.id !== selectedId)) return;
      const center = featureCenter(f.geometry); if (!center) return;
      const el = pinElement(a, displays[f.id], f.id === selectedId);
      el.addEventListener('click', e => { e.stopPropagation(); opts.onSelect(f.id); });
      const pin = new gl.Marker({ element: el, anchor: 'center' }).setLngLat([center[1], center[0]]).addTo(map);
      pins.push(pin);
    });
  }
  map.on('style.load', () => { addLayers(); updatePins(); });
  map.on('click', event => {
    const layers = ['street-hit', 'parking-fill', 'parking-outline'].filter(id => map.getLayer(id));
    const hit = layers.length ? map.queryRenderedFeatures(event.point, { layers })[0] : null;
    if (hit) opts.onSelect(hit.properties.areaId); else opts.onDeselect?.();
  });
  map.on('mousemove', e => { if (!map.getLayer('street-hit')) return; map.getCanvas().style.cursor = map.queryRenderedFeatures(e.point, { layers: ['street-hit', 'parking-fill'] }).length ? 'pointer' : ''; });
  map.on('error', e => {
    if (++failures === 3 || (!e.sourceId && !e.tile)) opts.onError('Some map detail could not load. Your search and saved reminder still work. Try another view in Layers.');
  });
  const status = () => opts.onStatus(view === 'satellite' ? 'NAIP aerial fallback · 2022' : view === 'terrain' ? 'USGS terrain fallback' : 'OpenFreeMap vector fallback', true);
  status();
  return {
    provider: 'maplibre',
    update(fc, nextDisplays, nextSelectedId) { displays = nextDisplays; selectedId = nextSelectedId; current = paintFeatures(fc, displays, selectedId); map.getSource('parking')?.setData(current); updatePins(); },
    fit() { map.fitBounds(overviewBounds(), { padding: { top: 45, left: 25, right: 25, bottom: window.innerWidth < 761 ? 125 : 75 }, duration: 650, essential: false }); },
    focus(f) { const p = featureCenter(f?.geometry); if (p) map.easeTo({ center: [p[1], p[0]], zoom: Math.max(map.getZoom(), 16.2), duration: 700, essential: false }); },
    locate(p) { if (locationPin) locationPin.remove(); const el = document.createElement('div'); el.className = 'geo-my-location'; locationPin = new gl.Marker({ element: el }).setLngLat([p[1], p[0]]).addTo(map); map.easeTo({ center: [p[1], p[0]], zoom: 16, duration: 700 }); },
    setView(next) { if (next === view) return; view = next; failures = 0; map.setStyle(mapStyle(view)); status(); },
    resize() { map.resize(); },
    destroy() { pins.forEach(p => p.remove()); locationPin?.remove(); map.remove(); },
  };
}

// Accessible, non-WebGL fallback. No generated image is ever used as a map.
function leafletMap(host, opts) {
  const L = window.L;
  if (!L) throw new Error('The map could not start. Search and saved reminders remain available.');
  const map = L.map(host, { zoomControl: false, attributionControl: true, minZoom: 10, maxZoom: 20 }).setView(CAMPUS_CENTER, 15);
  map.attributionControl.addAttribution(PARKING_CREDIT);
  const shapes = L.geoJSON().addTo(map), pins = L.layerGroup().addTo(map);
  let tiles, view = opts.basemap, errors = 0;
  const setView = next => {
    view = next; if (tiles) map.removeLayer(tiles); errors = 0;
    if (view === 'satellite') {
      const Aerial = L.TileLayer.extend({ getTileUrl(coords) {
        const span = 40075016.68557849 / 2 ** coords.z, minX = -20037508.342789244 + coords.x * span, maxY = 20037508.342789244 - coords.y * span;
        return NAIP_SERVICE + '/exportImage?' + new URLSearchParams({ bbox: [minX, maxY - span, minX + span, maxY].join(','), bboxSR: '3857', imageSR: '3857', size: '512,512', format: 'jpg', f: 'image', interpolation: 'RSP_BilinearInterpolation', compressionQuality: '90' });
      } });
      tiles = new Aerial('', { maxNativeZoom: 18, tileSize: 256, attribution: 'Imagery: USDA NAIP (2022), CDFW · historical aerial' });
    } else tiles = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}', { maxNativeZoom: 16, attribution: 'USGS The National Map · terrain fallback' });
    tiles.on('tileerror', () => { if (++errors === 4) opts.onError('Some aerial tiles are unavailable. Search and reminders still work.'); }); tiles.addTo(map); tiles.bringToBack();
    opts.onStatus(view === 'satellite' ? 'NAIP aerial fallback · 2022' : 'USGS terrain · WebGL unavailable', true);
  };
  setView(view);
  map.on('click', () => opts.onDeselect?.());
  return {
    provider: 'leaflet',
    update(fc, displays, selectedId) {
      shapes.clearLayers(); pins.clearLayers();
      shapes.options.style = f => ({ fillColor: displays[f.id]?.color || '#8a98a9', color: f.id === selectedId ? '#5da9ff' : displays[f.id]?.color || '#8a98a9', fillOpacity: .25, weight: f.properties.kind === 'street' ? f.id === selectedId ? 7 : 4 : f.id === selectedId ? 3 : 1.5 });
      shapes.options.onEachFeature = (f, layer) => layer.on('click', e => { L.DomEvent.stopPropagation(e); opts.onSelect(f.id); });
      shapes.addData({ ...fc, features: fc.features.filter(f => f.geometry.type !== 'Point') });
      fc.features.forEach(f => { const a = areas.get(f.id); if (!a || (a.kind === 'street' && f.id !== selectedId)) return; const el = pinElement(a, displays[f.id], f.id === selectedId);
        const marker = L.marker(featureCenter(f.geometry), { keyboard: true, title: el.getAttribute('aria-label'), icon: L.divIcon({ className: 'geo-marker-wrap', iconSize: [1, 1], html: el.outerHTML }) });
        marker.on('click', () => opts.onSelect(f.id)); marker.addTo(pins); marker.getElement()?.setAttribute('aria-label', el.getAttribute('aria-label'));
      });
    },
    fit() { map.fitBounds(overviewBounds().map(p => [p[1], p[0]]), { paddingTopLeft: [25, 40], paddingBottomRight: [25, 110] }); },
    focus(f) { const p = featureCenter(f?.geometry); if (p) map.flyTo(p, Math.max(map.getZoom(), 17), { duration: .7 }); },
    locate(p) { L.circleMarker(p, { radius: 7, color: '#fff', weight: 3, fillColor: '#1685ff', fillOpacity: 1 }).addTo(map); map.setView(p, 17); },
    setView, resize() { map.invalidateSize({ pan: false }); }, destroy() { map.remove(); },
  };
}
export async function createGeographicMap(host, opts) {
  if (opts.apiKey) { try { return await googleMap(host, opts); } catch (e) { opts.onError(e.message); host.replaceChildren(); } }
  try { return vectorMap(host, opts); }
  catch { host.replaceChildren(); return leafletMap(host, opts); }
}
