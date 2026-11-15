import { CAMPUS_AREAS, MAP_STATUS, CHECKED_ON, GIS_POLYGONS, GIS_POINTS, campusDateInput, parseCampusDateInput, fetchCampusFeatures } from './map-model.js';
import { createGeographicMap } from './geographic-map.js';
import { MAP_CONFIG } from './runtime-config.js';
import { evaluateParking, createManualSession, headBackAt, sessionPhase } from './rules.js';
import { DESTINATIONS, PERMITS } from './data.js';

const PREFS = 'campuscurb.discovery.v1', GOOGLE_KEY = 'campuscurb.googleMaps.browserKey';
const read = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
export function createDiscovery({ icon, escape: esc, time, onRefresh, onToast, onSession, showModal, modalHeader, getSession }) {
  let saved = {}; try { saved = JSON.parse(read(localStorage, PREFS)) || {}; } catch { /* Invalid preferences are optional. */ }
  const start = Math.ceil(Date.now() / 900_000) * 900_000;
  const s = { selectedId: CAMPUS_AREAS.some(a => a.id === saved.selectedId) ? saved.selectedId : CAMPUS_AREAS[0].id, permit: PERMITS.some(p => p.id === saved.permit) ? saved.permit : 'commuter', destinationId: DESTINATIONS.some(d => d.id === saved.destinationId) ? saved.destinationId : 'library', arrival: campusDateInput(start), departure: campusDateInput(start + 90 * 60_000), kind: 'all', query: '', detail: false, expanded: false, basemap: saved.basemap === 'terrain' ? 'terrain' : 'satellite', forceFallback: saved.forceFallback === true };
  let features = { type: 'FeatureCollection', features: [] }, dataState = 'loading', dataError = '', provider = 'Connecting map…', mapError = '', adapter, host, startingMap = false, dataStarted = false, fitted = false;
  const selected = () => CAMPUS_AREAS.find(a => a.id === s.selectedId) || CAMPUS_AREAS[0];
  const plan = () => ({ permit: s.permit, arrivalAt: parseCampusDateInput(s.arrival), departureAt: parseCampusDateInput(s.departure) });
  const result = a => evaluateParking(a, plan());
  const feature = id => features.features.find(f => f.id === id);
  const apiKey = () => s.forceFallback ? '' : read(sessionStorage, GOOGLE_KEY) || read(localStorage, GOOGLE_KEY) || MAP_CONFIG.googleMapsApiKey;
  const persist = () => { try { localStorage.setItem(PREFS, JSON.stringify({ selectedId: s.selectedId, permit: s.permit, destinationId: s.destinationId, basemap: s.basemap, forceFallback: s.forceFallback })); } catch { /* The current view still works without persistence. */ } };
  const refresh = () => { persist(); onRefresh(); };
  const statusTag = a => `<span class="geo-status ${result(a).status}"><i></i>${MAP_STATUS[result(a).status].label}</span>`;
  const visible = () => CAMPUS_AREAS.filter(a => (s.kind === 'all' || a.kind === s.kind) && `${a.name} ${a.shortName} ${a.categories.join(' ')}`.toLowerCase().includes(s.query.toLowerCase()));
  const badges = a => a.categories.map(c => `<span>${esc(c)}</span>`).join('');
  function cards() {
    const areas = visible();
    return areas.length ? areas.map(a => `<button class="geo-parking-card ${a.id === s.selectedId ? 'selected' : ''}" data-geo-action="select" data-id="${a.id}" aria-label="${esc(a.name)}: ${MAP_STATUS[result(a).status].label}"><span class="geo-lot-symbol ${a.kind}">${icon(a.kind === 'garage' ? 'building' : 'car')}</span><span class="geo-card-copy"><strong>${a.name}</strong><small>${a.kind === 'garage' ? 'Parking garage' : 'Surface lot'} · ${a.categories[0]}</small>${statusTag(a)}</span>${icon('chevron')}</button>`).join('') : `<div class="geo-empty">${icon('search')}<h3>${s.kind === 'street' ? 'Street parking needs a closer look.' : 'No matching parking areas.'}</h3><p>${s.kind === 'street' ? 'Exact block faces, curb restrictions, and current signs must be verified before street segments appear here.' : 'Try another lot name or parking type.'}</p></div>`;
  }
  function panel() {
    if (s.detail) return details();
    return `<div id="geo-panel"><div class="geo-panel-title"><div><div class="eyebrow">A LITTLE LESS CIRCLING</div><h1>Find your place.</h1><p>Your campus. A clearer view.</p></div><button class="icon-button geo-sheet-toggle" data-geo-action="expand" aria-label="${s.expanded ? 'Collapse' : 'Expand'} parking list" aria-expanded="${s.expanded}">${icon(s.expanded ? 'minus' : 'plus')}</button></div>
      <label class="geo-search">${icon('search')}<input id="geo-search" type="search" placeholder="Search lots, garages, permits…" value="${esc(s.query)}" aria-label="Search campus parking"></label>
      <div class="geo-plan"><label>Heading to<select id="geo-destination">${DESTINATIONS.map(d => `<option value="${d.id}" ${d.id === s.destinationId ? 'selected' : ''}>${d.name}</option>`).join('')}</select></label><label>Your permit<select id="geo-permit">${PERMITS.map(p => `<option value="${p.id}" ${p.id === s.permit ? 'selected' : ''}>${p.label}</option>`).join('')}</select></label><div class="geo-dates"><label>Arrive<input id="geo-arrival" type="datetime-local" value="${s.arrival}" aria-label="Arrival in Los Angeles time"></label><label>Leave<input id="geo-departure" type="datetime-local" value="${s.departure}" aria-label="Departure in Los Angeles time"></label></div><span class="geo-timezone">${icon('clock')}All times in Los Angeles</span></div>
      <div class="geo-kind-filter" aria-label="Parking type">${[['all', 'All parking'], ['lot', 'Lots'], ['garage', 'Garages'], ['street', 'Streets']].map(([id, name]) => `<button data-geo-kind="${id}" class="${id === s.kind ? 'active' : ''}" aria-pressed="${id === s.kind}">${name}</button>`).join('')}</div>
      <div class="geo-results-title"><h2>Campus parking</h2><span id="geo-count">${visible().length} areas</span></div><div id="geo-results" class="geo-results">${cards()}</div>
      <div class="geo-trust-note">${icon('info')}<p>Colors check permit and stay conditions. <strong>Space availability is unknown.</strong></p></div>
      <div class="geo-panel-links"><button data-geo-action="sources">Sources & confidence${icon('external')}</button><button data-geo-action="walkthrough">Try the sample walkthrough${icon('play')}</button></div></div>`;
  }
  function details() {
    const a = selected(), r = result(a), f = feature(a.id);
    return `<div id="geo-panel" class="geo-detail"><button class="text-button" data-geo-action="back">${icon('back')}All parking</button><div class="geo-detail-header"><span class="geo-detail-symbol ${a.kind}">${icon(a.kind === 'garage' ? 'building' : 'car')}</span><div class="eyebrow">${a.kind === 'garage' ? 'PARKING GARAGE' : 'CAMPUS PARKING'}</div><h1 tabindex="-1">${a.name}</h1><p>Cal Poly, San Luis Obispo</p></div><div class="geo-badges">${badges(a)}</div>
      <div class="geo-decision ${r.status}">${icon(r.status === 'eligible' ? 'checkCircle' : 'info')}<div><strong>${MAP_STATUS[r.status].label}</strong><p>${esc(r.reason)}</p></div></div>
      <div class="geo-detail-grid"><div><span>Space availability</span><strong>Unknown</strong></div><div><span>Your permit</span><strong>${PERMITS.find(p => p.id === s.permit).label}</strong></div><div><span>Return walk</span><strong>Not yet verified</strong></div><div><span>Parking price</span><strong>Check the official source</strong></div></div>
      <p class="geo-detail-note">${esc(a.note)}</p><div class="geo-source-label">${icon('layers')}<span>${f ? f.properties.geometryStatus : dataState === 'loading' ? 'Loading campus GIS geometry…' : 'Boundary unavailable · no outline guessed'}</span></div>
      <button class="primary-button" data-geo-action="reminder" ${r.status === 'ineligible' ? 'disabled' : ''}>${icon('car')}Save parking & set reminder</button><p class="geo-action-caption">For when you’ve checked the signs and parked. Saving a reminder does not confirm permission.</p>
      <a class="secondary-button" href="${a.rules.sourceUrl || a.sourceUrl}" target="_blank" rel="noopener noreferrer">Official parking information${icon('external')}</a><button class="disclosure-row" data-geo-action="sources">${icon('info')}<span>Sources & what still needs checking</span>${icon('chevron')}</button><div class="geo-panel-links"><button data-geo-action="back">Change permit or stay${icon('arrow')}</button></div></div>`;
  }
  function mapMarkup() {
    return `<section class="geo-map-pane" aria-label="Geographic campus parking map"><div id="geo-map" class="geo-map" role="region" aria-label="Interactive satellite or terrain map"></div><div class="geo-map-toolbar"><span class="geo-campus-chip">${icon('building')}<span>Cal Poly <small>San Luis Obispo</small></span></span><div class="geo-map-actions"><div class="geo-basemaps" aria-label="Map appearance"><button data-geo-basemap="satellite" class="${s.basemap === 'satellite' ? 'active' : ''}" aria-pressed="${s.basemap === 'satellite'}">${icon('layers')}Satellite</button><button data-geo-basemap="terrain" class="${s.basemap === 'terrain' ? 'active' : ''}" aria-pressed="${s.basemap === 'terrain'}">${icon('leaf')}Terrain</button></div><button class="geo-map-settings" data-geo-action="settings" aria-label="Map provider settings">${icon('layers')}Map settings</button></div></div>
      <button class="geo-recenter" data-geo-action="recenter" aria-label="Show all mapped campus parking">${icon('locate')}</button><div class="geo-map-bottom"><div class="geo-map-legend"><div><strong>Does it fit your stay?</strong><span>Not a live space count</span></div><div class="geo-legend-colors">${Object.entries(MAP_STATUS).map(([id, v]) => `<span><i style="background:${v.color}"></i>${v.short}</span>`).join('')}</div></div><div class="geo-map-source"><span id="geo-provider-status">${esc(provider)}${!apiKey() ? ' · Google not connected' : ''}</span><button data-geo-action="sources">Campus GIS${icon('info')}</button></div></div><div class="geo-map-alert" id="geo-map-alert" role="status" ${!mapError && !dataError ? 'hidden' : ''}>${esc(mapError || dataError)}</div></section>`;
  }
  function updateMap() {
    const ids = new Set(visible().map(a => a.id));
    const fc = { ...features, features: features.features.filter(f => ids.has(f.id)) };
    const statuses = Object.fromEntries(CAMPUS_AREAS.map(a => [a.id, result(a).status]));
    adapter?.update(fc, statuses, s.selectedId);
    return fc;
  }
  async function loadData() {
    dataStarted = true; dataState = 'loading'; dataError = '';
    const c = new AbortController(), timer = setTimeout(() => c.abort(), 20_000);
    try { features = await fetchCampusFeatures(c.signal); dataState = 'ready'; }
    catch { dataState = 'error'; dataError = 'Campus GIS could not load. The list still works; no parking outlines were guessed.'; }
    finally { clearTimeout(timer); onRefresh(); if (adapter && !fitted && features.features.length) { adapter.fit(updateMap()); fitted = true; } }
  }
  function showError(message) {
    mapError = message;
    const el = document.getElementById('geo-map-alert'); if (el) { el.textContent = message; el.hidden = false; }
  }
  async function mount(session) {
    const placeholder = document.getElementById('geo-map'); if (!placeholder) return;
    if (session?.manual && CAMPUS_AREAS.some(a => a.id === session.areaId)) s.selectedId = session.areaId;
    if (!host) host = placeholder; else if (host !== placeholder) placeholder.replaceWith(host);
    if (!dataStarted) void loadData();
    if (!adapter && !startingMap) {
      startingMap = true;
      try {
        adapter = await createGeographicMap(host, { apiKey: apiKey(), basemap: s.basemap, onSelect: selectArea, onStatus: name => { provider = name; const el = document.getElementById('geo-provider-status'); if (el) el.textContent = name + (name === 'USGS fallback' ? ' · Google not connected' : ''); }, onError: showError });
        if (features.features.length) { adapter.fit(updateMap()); fitted = true; }
      } catch (e) { showError(e.message); }
      finally { startingMap = false; }
    }
    updateMap(); requestAnimationFrame(() => adapter?.resize());
  }
  function selectArea(id) {
    if (!CAMPUS_AREAS.some(a => a.id === id)) return;
    s.selectedId = id; s.detail = true; s.expanded = true; refresh(); adapter?.focus(feature(id));
  }
  function sources() {
    showModal(`${modalHeader('A clearer view of the facts.', 'Real map data. Honest uncertainty.')}<p class="modal-copy">Parking outlines and location points are queried directly from Cal Poly Facilities’ public campus GIS. These are area boundaries, not verified entrances or exact parking stalls.</p><p class="modal-copy">Rules were researched ${CHECKED_ON}. The GIS classification is not used as permission: for example, G2 is labeled commuter in the GIS but the lot directory excludes commuter permits. Unresolved eligibility stays gray. All space availability remains unknown.</p><div class="geo-source-links"><a href="https://maps.calpoly.edu/" target="_blank" rel="noopener noreferrer">Official campus map${icon('external')}</a><a href="${GIS_POLYGONS}" target="_blank" rel="noopener noreferrer">Campus parking outlines${icon('external')}</a><a href="${GIS_POINTS}" target="_blank" rel="noopener noreferrer">Campus parking locations${icon('external')}</a><a href="${selected().sourceUrl}" target="_blank" rel="noopener noreferrer">Parking rules & space categories${icon('external')}</a><a href="https://afd.calpoly.edu/parking/slo/lot-closures/" target="_blank" rel="noopener noreferrer">Official lot closures${icon('external')}</a></div><p class="modal-copy">Imagery is not live. No vacancy feed, verified walking routes, or street-side rule dataset is connected. The sample walkthrough uses separate fictional data.</p><button class="secondary-button" data-geo-action="retry-data">Reload campus GIS${icon('layers')}</button>`);
  }
  function settings() {
    showModal(`${modalHeader('Your map. Your view.', 'Connect Google Maps for satellite and terrain.')}<p class="modal-copy">Google Maps is the preferred provider. Until connected, this preview uses the clearly labeled USDA / USGS aerial and topographic maps.</p><form id="geo-google-form"><label class="form-label" for="geo-google-key">Google Maps browser or demo key</label><input type="password" id="geo-google-key" name="key" autocomplete="off" required placeholder="Paste your restricted browser key"><label class="geo-checkbox"><input type="checkbox" name="remember">Remember in this browser</label><button class="primary-button" type="submit">Connect Google Maps${icon('arrow')}</button></form><p class="modal-copy">This connects this browser only. Use a website-restricted browser key with Maps JavaScript API access. Google also offers a free, quota-limited demo key for prototypes.</p><a class="secondary-button" href="https://developers.google.com/maps/documentation/javascript/demo-key" target="_blank" rel="noopener noreferrer">Get a Google Maps demo key${icon('external')}</a><button class="text-button" data-geo-action="fallback">Use USGS fallback</button>`);
  }
  function reminder() {
    const a = selected(); if (result(a).status === 'ineligible') { onToast(result(a).reason); return; }
    showModal(`${modalHeader('We’ll help you head back.', a.name)}<div class="inline-warning">Eligibility is not confirmed. Check the signs and your payment or permit before saving a reminder.</div><form id="geo-session-form"><label class="form-label" for="geo-reminder-at">Your confirmed return deadline · Los Angeles time</label><input id="geo-reminder-at" name="deadline" type="datetime-local" value="${s.departure}" required><label class="form-label" for="geo-walk">Your estimated walk back · minutes</label><input id="geo-walk" type="number" name="walk" min="1" max="180" required placeholder="Enter your own estimate"><label class="form-label" for="geo-buffer">Extra breathing room</label><select id="geo-buffer" name="buffer"><option value="5">5-minute buffer</option><option value="10">10-minute buffer</option><option value="0">No extra buffer</option></select><label class="form-label" for="geo-note">Remember your spot</label><input id="geo-note" name="note" maxlength="240" placeholder="Level, row, or a landmark…"><label class="geo-checkbox"><input name="confirmed" type="checkbox" required>I checked my parking conditions. This is a manual reminder.</label>${getSession() ? '<p class="modal-copy">Saving this replaces your current session.</p>' : ''}<button class="primary-button" type="submit">Save my reminder${icon('check')}</button></form>`);
  }
  function sessionPanel(session) {
    const a = CAMPUS_AREAS.find(a => a.id === session.areaId), phase = sessionPhase(session), left = Math.max(0, Math.ceil((session.deadlineAt - Date.now()) / 60_000));
    return `<div class="panel-heading"><div class="eyebrow">A LITTLE PEACE OF PARK</div><h1>My Parking</h1><p>Manual reminder · saved in this browser</p></div><div class="session-location"><span class="lot-icon">P</span><div><h2>${a?.name || 'Saved parking area'}</h2><p>${esc(session.note || 'Area saved · exact car position not recorded')}</p></div><button class="icon-button" data-action="edit-note" aria-label="Edit parking note">${icon('pin')}</button></div><div class="session-countdown"><div class="countdown-number" data-countdown>${left}<span>m</span></div><span>${phase === 'expired' ? 'Your reminder time has arrived' : 'Until your manual deadline'}</span><div class="session-progress"><div data-session-progress></div></div></div>${phase !== 'active' ? `<div class="inline-warning">${icon('bell')}${phase === 'expired' ? 'Your reminder time has arrived. Check the parking conditions and move your car as needed.' : 'Time to head back. Your walk and buffer are included.'}</div>` : ''}<div class="timing-card"><div><span>${icon('clock')}Your reminder deadline</span><strong>${time(session.deadlineAt)}</strong></div><div class="headback-row"><span>${icon('walk')}Head back by</span><strong>${time(headBackAt(session.deadlineAt, session.walkMinutes, session.bufferMinutes))}</strong></div></div><p class="buffer-caption">Your estimate: ${session.walkMinutes} min walk + ${session.bufferMinutes} min buffer</p><p class="geo-detail-note">This is your manually entered reminder time. It does not verify permission, payment, or a legal maximum stay. Reminders appear while the app is open.</p><div class="detail-actions"><button class="primary-button" data-geo-action="show-saved" data-id="${session.areaId}">${icon('pin')}View saved parking area</button><button class="secondary-button" data-action="end">End session</button></div>`;
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-geo-action],[data-geo-kind],[data-geo-basemap]'); if (!target) return;
    if (target.dataset.geoKind) { s.kind = target.dataset.geoKind; s.detail = false; refresh(); return; }
    if (target.dataset.geoBasemap) { s.basemap = target.dataset.geoBasemap; adapter?.setView(s.basemap); refresh(); return; }
    switch (target.dataset.geoAction) {
      case 'select': selectArea(target.dataset.id); break;
      case 'back': s.detail = false; refresh(); break;
      case 'expand': s.expanded = !s.expanded; refresh(); break;
      case 'recenter': adapter?.fit(updateMap()); break;
      case 'sources': sources(); break;
      case 'settings': settings(); break;
      case 'reminder': reminder(); break;
      case 'retry-data': document.getElementById('modal').close(); void loadData(); break;
      case 'fallback': s.forceFallback = true; persist(); location.reload(); break;
      case 'show-saved': selectArea(target.dataset.id); document.dispatchEvent(new CustomEvent('campuscurb:explore-real')); break;
      case 'walkthrough': document.dispatchEvent(new CustomEvent('campuscurb:walkthrough')); break;
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id !== 'geo-search') return;
    s.query = e.target.value; const el = document.getElementById('geo-results'); if (el) el.innerHTML = cards();
    const count = document.getElementById('geo-count'); if (count) count.textContent = `${visible().length} areas`; updateMap();
  });
  document.addEventListener('change', e => {
    const fields = { 'geo-permit': 'permit', 'geo-destination': 'destinationId', 'geo-arrival': 'arrival', 'geo-departure': 'departure' };
    if (fields[e.target.id]) { s[fields[e.target.id]] = e.target.value; refresh(); }
  });
  document.addEventListener('submit', e => {
    if (!['geo-session-form', 'geo-google-form'].includes(e.target.id)) return;
    e.preventDefault(); const f = new FormData(e.target);
    if (e.target.id === 'geo-google-form') {
      const key = String(f.get('key')).trim();
      if (!/^[A-Za-z0-9_-]{20,200}$/.test(key)) { onToast('Enter a valid Google Maps browser key.'); return; }
      try { localStorage.removeItem(GOOGLE_KEY); sessionStorage.removeItem(GOOGLE_KEY); (f.get('remember') ? localStorage : sessionStorage).setItem(GOOGLE_KEY, key); s.forceFallback = false; persist(); location.reload(); } catch { onToast('Browser storage is unavailable. Google Maps could not be connected.'); }
    } else {
      try { if (selected().rules.closed) throw new Error('This area is closed.'); if (!f.get('confirmed')) throw new Error('Check and confirm your parking conditions before saving a reminder.'); const session = createManualSession({ area: selected(), permit: s.permit, destinationId: s.destinationId, deadlineAt: parseCampusDateInput(String(f.get('deadline'))), walkMinutes: Number(f.get('walk')), bufferMinutes: Number(f.get('buffer')), note: f.get('note') }); document.getElementById('modal').close(); onSession(session); }
      catch (error) { onToast(error.message); }
    }
  });
  return { panel, mapMarkup, mount, sessionPanel, detach() { host?.remove(); }, expanded: () => s.expanded || s.detail, answer(question, session) {
    if (session && /head|back|expire|deadline|time|when/i.test(question)) return `${session.manual ? 'Your manual reminder' : 'Your demo session'} ends at ${time(session.deadlineAt)}. Head back by ${time(headBackAt(session.deadlineAt, session.walkMinutes, session.bufferMinutes))}. Your entered walk and buffer are included; payment and parking permission are not verified.`;
    if (/update|clos|full|report/i.test(question)) return 'No live occupancy or shared community feed is connected to this geographic preview. A missing report does not confirm that a lot is open or has spaces. Check current official notices: https://afd.calpoly.edu/parking/slo/lot-closures/ and https://afd.calpoly.edu/facilities/about/news/. Sample walkthrough reports remain separate.';
    const a = selected(); return `${a.name}: ${result(a).reason}\n\n${a.note}\n\nSpace availability and walking time are not verified. Check posted signs. Source: ${a.rules.sourceUrl || a.sourceUrl} (research checked ${a.checkedOn}). This guide uses source records, not a live AI model.`;
  } };
}
