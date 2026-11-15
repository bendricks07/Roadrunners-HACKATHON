import { CAMPUS_CENTER, CAMPUS_AREAS, MAP_STATUS, featureCenter } from './map-model.js';

let googleLoad;
export function loadGoogleMaps(apiKey) {
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (googleLoad) return googleLoad;
  googleLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const finish = () => { clearTimeout(timer); delete window.campusCurbGoogleReady; };
    const fail = () => { finish(); script.remove(); googleLoad = null; reject(new Error('Google Maps could not load. Check the key, website restrictions, and Maps JavaScript API access.')); };
    const timer = setTimeout(fail, 18_000);
    window.campusCurbGoogleReady = () => { finish(); resolve(window.google.maps); };
    window.gm_authFailure = fail;
    script.src = `https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: apiKey, callback: 'campusCurbGoogleReady', loading: 'async', v: 'weekly' })}`;
    script.async = true;
    script.onerror = fail;
    document.head.append(script);
  });
  return googleLoad;
}

const tag = area => area.kind === 'garage' ? '▥' : 'P';
const labelText = (area, status) => `${area.name} · ${MAP_STATUS[status]?.label || MAP_STATUS.unknown.label}`;

export async function createGeographicMap(host, { apiKey, basemap = 'satellite', onSelect, onStatus, onError }) {
  if (apiKey) {
    try {
      const g = await loadGoogleMaps(apiKey);
      const map = new g.Map(host, { center: { lat: CAMPUS_CENTER[0], lng: CAMPUS_CENTER[1] }, zoom: 16, mapTypeId: basemap === 'terrain' ? 'terrain' : 'hybrid', disableDefaultUI: true, zoomControl: true, fullscreenControl: false, streetViewControl: false, tilt: 0, clickableIcons: false, gestureHandling: 'cooperative' });
      let pins = [], disposed = false;
      class ParkingPin extends g.OverlayView {
        constructor(center, area, status, selected) {
          super(); this.center = new g.LatLng(...center); this.el = document.createElement('button');
          this.el.className = `geo-pin ${selected ? 'selected' : ''}`;
          this.el.style.setProperty('--pin-color', MAP_STATUS[status]?.color || MAP_STATUS.unknown.color);
          this.el.setAttribute('aria-label', labelText(area, status));
          this.el.innerHTML = `<span class="geo-pin-icon">${tag(area)}</span><span>${area.shortName}</span>`;
          this.el.addEventListener('click', e => { e.stopPropagation(); onSelect(area.id); });
          this.setMap(map);
        }
        onAdd() { this.getPanes().overlayMouseTarget.append(this.el); g.OverlayView.preventMapHitsAndGesturesFrom(this.el); }
        draw() { const p = this.getProjection()?.fromLatLngToDivPixel(this.center); if (p) { this.el.style.left = `${p.x}px`; this.el.style.top = `${p.y}px`; } }
        onRemove() { this.el.remove(); }
      }
      const click = map.data.addListener('click', e => onSelect(e.feature.getId()));
      onStatus('Google Maps', false);
      // Authentication failures can arrive after the Maps constructor returns.
      window.gm_authFailure = () => { if (!disposed) onError('Google rejected the map key. Use Map settings to check your connection, or switch to the labeled USGS fallback.'); };
      return {
        provider: 'google',
        update(fc, statuses, selectedId) {
          pins.forEach(p => p.setMap(null)); pins = [];
          map.data.forEach(f => map.data.remove(f)); map.data.addGeoJson({ ...fc, features: fc.features.filter(f => f.geometry.type !== 'Point') });
          map.data.setStyle(f => ({ fillColor: MAP_STATUS[statuses[f.getId()]]?.color || MAP_STATUS.unknown.color, strokeColor: f.getId() === selectedId ? '#fff' : MAP_STATUS[statuses[f.getId()]]?.color || '#8794a4', fillOpacity: f.getId() === selectedId ? .48 : .28, strokeWeight: f.getId() === selectedId ? 4 : 2, zIndex: f.getId() === selectedId ? 3 : 1, clickable: true }));
          fc.features.forEach(f => { const area = CAMPUS_AREAS.find(a => a.id === f.id); if (area) pins.push(new ParkingPin(featureCenter(f.geometry), area, statuses[f.id], f.id === selectedId)); });
        },
        fit(fc) { if (!fc.features.length) return; const b = new g.LatLngBounds(); fc.features.forEach(f => { const p = featureCenter(f.geometry); if (p) b.extend({ lat: p[0], lng: p[1] }); }); map.fitBounds(b, window.innerWidth > 760 ? { left: 365, right: 70, top: 100, bottom: 90 } : { left: 25, right: 25, top: 65, bottom: 35 }); },
        focus(f) { const p = featureCenter(f?.geometry); if (p) map.panTo({ lat: p[0], lng: p[1] }); },
        setView(view) { map.setMapTypeId(view === 'terrain' ? 'terrain' : 'hybrid'); },
        resize() { g.event.trigger(map, 'resize'); },
        destroy() { disposed = true; click.remove(); pins.forEach(p => p.setMap(null)); g.event.clearInstanceListeners(map); host.replaceChildren(); },
      };
    } catch (e) { onError(e.message); }
  }
  const L = window.L;
  if (!L) throw new Error('The map library is unavailable. You can still use the parking list and saved session.');
  const map = L.map(host, { zoomControl: false, attributionControl: true, minZoom: 12, maxZoom: 20, scrollWheelZoom: false }).setView(CAMPUS_CENTER, 16);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
  let tiles, errors = 0;
  const setView = view => {
    if (tiles) map.removeLayer(tiles);
    errors = 0;
    tiles = L.tileLayer(`https://basemap.nationalmap.gov/arcgis/rest/services/${view === 'terrain' ? 'USGSTopo' : 'USGSImageryOnly'}/MapServer/tile/{z}/{y}/{x}`, { maxNativeZoom: 16, maxZoom: 20, attribution: view === 'terrain' ? 'USGS The National Map' : 'USDA / USGS The National Map · historical aerial imagery', crossOrigin: true });
    tiles.on('tileerror', () => { if (++errors === 4) onError('Some map tiles are unavailable. Parking records and saved reminders remain usable.'); });
    tiles.addTo(map);
  };
  setView(basemap);
  const shapes = L.geoJSON().addTo(map), pins = L.layerGroup().addTo(map);
  onStatus('USGS fallback', true);
  return {
    provider: 'usgs',
    update(fc, statuses, selectedId) {
      shapes.clearLayers(); pins.clearLayers();
      shapes.options.style = f => ({ fillColor: MAP_STATUS[statuses[f.id]]?.color || '#8794a4', color: f.id === selectedId ? '#fff' : MAP_STATUS[statuses[f.id]]?.color || '#8794a4', fillOpacity: f.id === selectedId ? .48 : .28, weight: f.id === selectedId ? 4 : 2 });
      shapes.options.onEachFeature = (f, layer) => layer.on('click', () => onSelect(f.id));
      shapes.addData({ ...fc, features: fc.features.filter(f => f.geometry.type !== 'Point') });
      fc.features.forEach(f => {
        const a = CAMPUS_AREAS.find(a => a.id === f.id); if (!a) return;
        const status = statuses[f.id] || 'unknown';
        const marker = L.marker(featureCenter(f.geometry), { keyboard: true, title: labelText(a, status), alt: labelText(a, status), icon: L.divIcon({ className: 'geo-marker-wrap', iconSize: [1, 1], html: `<span class="geo-pin ${f.id === selectedId ? 'selected' : ''}" style="--pin-color:${MAP_STATUS[status].color}"><span class="geo-pin-icon">${tag(a)}</span><span>${a.shortName}</span></span>` }) });
        marker.on('click', () => onSelect(f.id)); marker.addTo(pins);
        marker.getElement()?.setAttribute('aria-label', labelText(a, status));
      });
    },
    fit(fc) { if (!fc.features.length) return; map.fitBounds(L.geoJSON(fc).getBounds(), { paddingTopLeft: window.innerWidth > 760 ? [370, 100] : [25, 65], paddingBottomRight: window.innerWidth > 760 ? [80, 85] : [25, 35], maxZoom: 17 }); },
    focus(f) { const p = featureCenter(f?.geometry); if (p) map.panTo(p); },
    setView,
    resize() { map.invalidateSize({ pan: false }); },
    destroy() { map.remove(); },
  };
}
