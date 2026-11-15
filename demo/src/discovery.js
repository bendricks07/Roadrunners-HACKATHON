import { MAP_STATUS, CHECKED_ON, GIS_POLYGONS, GIS_POINTS, ENFORCEMENT_SOURCE, campusDateInput, parseCampusDateInput, fetchCampusFeatures, featureCenter } from './map-model.js';
import { RESIDENTIAL_DISTRICTS } from './neighborhood-parking.js';
import { PARKING_AREAS, STREET_AREAS, CITY_STREETS, CITY_PARKING, CHANCE, fetchStreetFeatures, parkingDisplay } from './street-model.js';
import { createGeographicMap } from './geographic-map.js';
import { validateTrip } from './trip-model.js';
import { MAP_CONFIG } from './runtime-config.js';
import { bestParkingResult, formatParkingDuration, createManualSession, headBackAt, sessionPhase } from './rules.js';
import { DESTINATIONS, PERMITS, permitPolicyId, normalizePermitSelection, togglePermitSelection } from './data.js';

const PREFS = 'campuscurb.discovery.v1', GOOGLE_KEY = 'campuscurb.googleMaps.browserKey';
const read = (storage, key) => { try { return storage.getItem(key); } catch { return null; } };
const typeName = a => a.kind === 'street' ? 'Street parking' : a.kind === 'garage' ? 'Parking garage' : 'Parking lot';
// These groupings only drive an illustrative destination-first ordering. They are
// intentionally not walking directions or a statement that a permit is valid.
const DESTINATION_AREAS = {
  library: ['cal-poly-slo-h1', 'cal-poly-slo-h12', 'cal-poly-slo-h14'],
  engineering: ['cal-poly-slo-h12', 'cal-poly-slo-h16', 'cal-poly-slo-h1'],
  dorms: ['cal-poly-slo-structure-131', 'cal-poly-slo-grand-structure', 'cal-poly-slo-h14'],
  union: ['cal-poly-slo-grand-structure', 'cal-poly-slo-h14', 'cal-poly-slo-h1'],
  rec: ['cal-poly-slo-h14', 'cal-poly-slo-grand-structure', 'cal-poly-slo-h16'],
  pac: ['cal-poly-slo-grand-structure', 'cal-poly-slo-structure-131', 'cal-poly-slo-h14'],
};
export function createDiscovery({ icon, escape: esc, time, onRefresh, onToast, onSession, onAppearance, showModal, modalHeader, getSession }) {
  let saved = {}; try { saved = JSON.parse(read(localStorage, PREFS)) || {}; } catch { /* Preferences are optional. */ }
  const start = Math.ceil(Date.now() / 900_000) * 900_000;
  const s = {
    selectedId: PARKING_AREAS.some(a => a.id === saved.selectedId) ? saved.selectedId : PARKING_AREAS[0].id,
    permits: Array.isArray(saved.permits) && saved.permits.every(id => PERMITS.some(p => p.id === id))
      ? normalizePermitSelection(saved.permits)
      : [PERMITS.some(p => p.id === saved.permit) ? saved.permit : 'commuter'],
    destinationId: DESTINATIONS.some(d => d.id === saved.destinationId) ? saved.destinationId : 'library',
    arrival: campusDateInput(start), departure: campusDateInput(start + 90 * 60_000),
    openEntry: null, draftArrival: null, draftDeparture: null, kind: 'all', query: '', view: 'home', priority: ['closest', 'garage', 'chance'].includes(saved.priority) ? saved.priority : 'closest',
    basemap: ['satellite', 'dark', 'standard', 'terrain'].includes(saved.basemap) ? saved.basemap : 'satellite',
    estimates: saved.estimates !== false, forceFallback: saved.forceFallback === true,
  };
  let features = { type: 'FeatureCollection', features: [] }, dataState = 'loading', provider = 'Connecting map…', mapError = '', adapter, host, startingMap = false, dataStarted = false, fitted = false, loadingPromise, dockObserver, presentedSession = null;
  const selected = () => PARKING_AREAS.find(a => a.id === s.selectedId) || PARKING_AREAS[0];
  const plan = permit => ({ permit: permitPolicyId(permit), arrivalAt: parseCampusDateInput(s.arrival), departureAt: parseCampusDateInput(s.departure) });
  const activePermits = () => normalizePermitSelection(s.permits);
  const result = a => bestParkingResult(a, activePermits().map(plan));
  const destination = () => DESTINATIONS.find(d => d.id === s.destinationId) || DESTINATIONS[0];
  const recommended = () => {
    const nearby = DESTINATION_AREAS[s.destinationId] || [];
    const candidates = PARKING_AREAS.filter(area => area.dataset === 'campus-research' && area.kind !== 'street' && !area.rules.closed && result(area).status !== 'ineligible' && !result(area).permitConflict);
    const score = area => {
      const destinationRank = nearby.indexOf(area.id);
      const preference = s.priority === 'garage' ? (area.kind === 'garage' ? 0 : 5) : s.priority === 'chance' ? ({ good: 0, limited: 1, low: 2 }[area.demoChance] ?? 3) : 0;
      return (destinationRank < 0 ? 20 : destinationRank) + preference;
    };
    return candidates.sort((left, right) => score(left) - score(right)).slice(0, 3);
  };
  const display = a => ({ ...parkingDisplay(a, result(a), s.estimates), recommended: recommended().some(choice => choice.id === a.id) });
  const feature = id => features.features.find(f => f.id === id);
  const apiKey = () => s.forceFallback ? '' : read(sessionStorage, GOOGLE_KEY) || read(localStorage, GOOGLE_KEY) || MAP_CONFIG.googleMapsApiKey;
  const persist = () => { try { localStorage.setItem(PREFS, JSON.stringify({ selectedId: s.selectedId, permits: s.permits, destinationId: s.destinationId, priority: s.priority, basemap: s.basemap, estimates: s.estimates, forceFallback: s.forceFallback })); } catch { /* Still usable in this tab. */ } };
  const refresh = () => { persist(); onRefresh(); };
  const visible = () => PARKING_AREAS.filter(area => {
    const searchTerms = [area.name, area.shortName, ...area.categories, ...(area.guidance?.districts || [])];
    return (s.kind === 'all' || area.kind === s.kind) && searchTerms.join(' ').toLowerCase().includes(s.query.trim().toLowerCase());
  });
  const matchingDestinations = () => DESTINATIONS.filter(d => `${d.name} ${d.subtitle}`.toLowerCase().includes(s.query.trim().toLowerCase()));
  const permitSummary = () => s.permits.length ? s.permits.map(id => PERMITS.find(p => p.id === id)?.label).filter(Boolean).join(' · ') : 'No permit';
  const chance = a => { const d = display(a); return `<span class="geo-chance ${d.chance}"><i style="background:${d.color}"></i>${a.rules.closed ? 'Closed' : d.label}${d.illustrative ? '<span>· Demo estimate</span>' : ''}</span>`; };
  const dismissButton = label => `<button class="geo-sheet-close" data-geo-action="home" aria-label="${label}">${icon('close')}</button>`;
  const destinationEntry = () => `<details id="geo-destination-entry" class="geo-trip-entry geo-destination-entry" ${s.openEntry === 'geo-destination-entry' ? 'open' : ''}><summary>${icon('pin')}<span><strong>Where are you headed?</strong><small>${esc(destination().name)}</small></span>${icon('chevron')}</summary><label class="geo-destination-label" for="geo-destination">Destination<select id="geo-destination">${DESTINATIONS.map(d => `<option value="${d.id}" ${d.id === s.destinationId ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></label><small class="geo-entry-help">Updates the highlighted areas to review. Exact walking routes remain unverified.</small></details>`;
  const tripEntry = () => `<details id="geo-trip-entry" class="geo-trip-entry" ${s.openEntry === 'geo-trip-entry' ? 'open' : ''}><summary>${icon('clock')}<span><strong>Trip date & time</strong><small>${esc(s.arrival.replace('T', ' '))} to ${esc(s.departure.replace('T', ' '))}</small></span>${icon('chevron')}</summary><form id="geo-trip-form"><label for="geo-arrival">Arrive<input id="geo-arrival" name="arrival" type="datetime-local" value="${s.draftArrival ?? s.arrival}" required></label><label for="geo-departure">Leave<input id="geo-departure" name="departure" type="datetime-local" value="${s.draftDeparture ?? s.departure}" required></label><small>Los Angeles time - used to check parking restrictions</small><p id="geo-trip-error" role="alert"></p><button class="primary-button" type="submit">Update trip${icon('check')}</button></form></details>`;
  const searchField = () => `<div class="geo-search" role="search">${icon('search')}<input id="geo-search" type="search" autocomplete="off" placeholder="Find parking or enter a destination" value="${esc(s.query)}" aria-label="Search a destination, street, parking lot, or garage" ${s.view === 'search' ? 'aria-controls="geo-results"' : ''}>${s.query ? '<button type="button" class="geo-search-clear" data-geo-action="clear-query" aria-label="Clear search">' + icon('close') + '</button>' : ''}</div>${destinationEntry()}${tripEntry()}`;
  function cards() {
    const seen = new Set(), list = visible().filter(a => { if (seen.has(a.name)) return false; seen.add(a.name); return true; });
    const destinations = s.query.trim() ? matchingDestinations().map(d => `<button class="geo-result geo-destination-result" data-geo-action="set-destination" data-id="${d.id}"><span class="geo-result-icon">${icon('building')}</span><span class="geo-result-copy"><strong>Plan parking for ${esc(d.name)}</strong><small>${esc(d.subtitle)}</small></span>${icon('chevron')}</button>`).join('') : '';
    if (!list.length && !destinations) return `<div class="geo-empty">${icon('search')}<h3>No places found</h3><p>Try Library, Engineering, dorms, H1, Grand, or another campus area.</p></div>`;
    return destinations + list.map(a => `<button class="geo-result" data-geo-action="select" data-id="${a.id}"><span class="geo-result-icon ${a.kind}">${icon(a.kind === 'garage' ? 'building' : a.kind === 'street' ? 'pin' : 'car')}</span><span class="geo-result-copy"><strong>${esc(a.name)}</strong><small>${typeName(a)}${a.kind === 'street' ? ` · ${STREET_AREAS.filter(x => x.name === a.name).length} mapped blocks` : a.categories.length ? ` · ${esc(a.categories.join(' · '))}` : ' · Cal Poly'}</small></span>${icon('chevron')}</button>`).join('');
  }
  function recommendationCards() {
    const choices = recommended();
    if (!choices.length) return `<div class="geo-empty geo-recommendation-empty">${icon('permit')}<h3>Nothing can be matched yet</h3><p>Select a permit to hide known conflicts. Unconfirmed areas stay out of a confident recommendation.</p></div>`;
    return choices.map((area, index) => {
      const check = result(area);
      return `<button class="geo-recommendation" data-geo-action="select" data-id="${area.id}"><span class="geo-recommendation-number">${index + 1}</span><span><strong>${esc(area.name)}</strong><small>${check.ruleLabel ? esc(check.ruleLabel) : check.status === 'unknown' ? 'Review rules before parking' : esc(check.reason)}</small></span><span class="geo-recommendation-status ${check.status}">${check.status === 'unknown' ? 'Check' : esc(check.status)}</span></button>`;
    }).join('');
  }
  function searchPanel() {
    return `<div class="geo-search-content"><div class="geo-sheet-heading"><div><h1>Plan parking</h1><p>Choose where you are headed, then compare areas</p></div>${dismissButton('Close search')}</div>${searchField()}<button class="geo-trip-summary" data-geo-action="trip"><span>${icon('pin')}<strong>${esc(destination().name)}</strong><small>${esc(permitSummary())}</small></span>${icon('chevron')}</button><section class="geo-recommendations" aria-label="Recommended parking areas"><div class="geo-results-heading"><h2>Highlighted areas to review</h2><button data-geo-action="trip">${icon('permit')}Settings</button></div><p>For ${esc(destination().name)} · ${s.priority === 'garage' ? 'prefer a garage' : s.priority === 'chance' ? 'higher demo chance first' : 'closest area first'}</p>${recommendationCards()}</section><div class="geo-kind-filter" aria-label="Parking type">${[['all', 'All'], ['street', 'Streets'], ['lot', 'Lots'], ['garage', 'Garages']].map(([id, name]) => `<button data-geo-kind="${id}" class="${id === s.kind ? 'active' : ''}" aria-pressed="${id === s.kind}">${name}</button>`).join('')}</div><div class="geo-results-heading"><h2>Browse places</h2><div class="geo-browse-actions"><button data-geo-action="trip">${icon('permit')}Settings</button><button data-geo-action="districts">${icon('permit')}City permit districts</button></div></div><div id="geo-results" class="geo-results">${cards()}</div><p class="geo-search-footnote">Blue highlights are illustrative trip matches. Permit fit, signs, space type, and availability still need checking.</p></div>`;
  }
  function details() {
    const a = selected(), d = display(a), f = feature(a.id), center = featureCenter(f?.geometry);
    const direction = center ? `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: `${center[0]},${center[1]}`, travelmode: 'driving' })}` : '';
    return `<div class="geo-place-content"><button class="geo-handle" data-geo-action="home" aria-label="Close place details"><span></span></button>${searchField()}<div class="geo-place-body"><div class="geo-place-heading"><div><h1>${esc(a.name)}</h1><p>${typeName(a)}</p></div>${dismissButton('Close place details')}</div><div class="geo-place-main"><div>${chance(a)}<p class="geo-sign-caption">${esc(result(a).ruleSummary || d.reason)}${!d.locked && !result(a).ruleReviewed && !result(a).maxStayMinutes ? ' Check permit requirements and signs.' : ''}</p>${result(a).ruleReviewed ? `<p class="geo-rule-availability">Empty spaces: unknown.${result(a).permitExempt && result(a).nextRestrictionAt ? '<br>General permit hours resume ' + esc(campusDateInput(result(a).nextRestrictionAt).replace('T', ' ')) + ' (Los Angeles).' : ''}</p>` : ''}</div>${center && !a.rules.closed ? `<a class="geo-directions" href="${direction}" target="_blank" rel="noopener noreferrer" title="Directions to the mapped area; exact entrance unverified">${icon('navigate')}<span>Directions</span></a>` : ''}</div><div class="geo-place-actions"><button data-geo-action="rules">Rules & details${icon('chevron')}</button><button data-geo-action="reminder" ${result(a).status === 'ineligible' ? 'disabled' : ''}>${icon('car')}Save my car</button></div></div></div>`;
  }
  function shell({ session = null, showSession = false } = {}) {
    if (showSession && session?.manual && presentedSession !== session.id) { s.view = 'session'; presentedSession = session.id; }
    if (!session) presentedSession = null;
    if (s.view === 'session' && !session) s.view = 'home';
    const detail = s.view === 'detail', searching = s.view === 'search', sessionView = s.view === 'session';
    const label = s.estimates ? 'Demo parking estimates' : 'Parking availability';
    return `<main id="main-content" class="map-experience ${detail ? 'place-open' : searching ? 'search-open' : sessionView ? 'session-open' : 'map-home'}" data-basemap="${s.basemap}" tabindex="-1" aria-label="CampusCurb parking map"><section class="geo-map-stage" aria-label="Cal Poly and surrounding neighborhoods"><div id="geo-map" class="geo-map" role="region" aria-label="Interactive ${s.basemap} parking map"></div><div class="geo-map-controls"><button id="geo-layers" class="geo-map-control" data-geo-action="layers" aria-label="Map layers and appearance">${icon('layers')}</button><button class="geo-map-control" data-geo-action="locate" aria-label="Show my location">${icon('navigate')}</button></div><button class="geo-map-legend" data-geo-action="sources" aria-label="${label}. View sources and estimate information"><strong>${label}</strong><span class="geo-legend-row">${s.estimates ? ['good', 'limited', 'low'].map(k => `<span><i style="background:${CHANCE[k].color}"></i>${CHANCE[k].short}</span>`).join('') : '<span>Space availability unknown</span><span><i style="background:#258cff"></i>Reviewed permit rule</span>'}</span>${s.estimates ? '<small>Yellow: limited | Red: low chance or restricted<br>Blue: reviewed permit rule | Empty spaces unknown</small>' : ''}</button><div class="geo-map-alert" id="geo-map-alert" role="status" ${!mapError ? 'hidden' : ''}><span>${esc(mapError)}</span><button data-geo-action="dismiss-error" aria-label="Dismiss map notice">${icon('close')}</button></div></section><section class="geo-dock" aria-label="${detail ? 'Selected parking place' : searching ? 'Search parking' : sessionView ? 'Saved parking reminder' : 'Search'}">${searching ? searchPanel() : detail ? details() : sessionView ? `<div class="geo-session-content"><div class="geo-sheet-heading"><div><h1>Your parked car</h1><p>Manual reminder</p></div>${dismissButton('Close saved parking')}</div>${sessionPanel(session)}</div>` : `${session?.manual ? `<button class="geo-saved-car" data-geo-action="session">${icon('car')}<span>Your car · head back by <strong>${time(headBackAt(session.deadlineAt, session.walkMinutes, session.bufferMinutes))}</strong></span>${icon('chevron')}</button>` : ''}${searchField()}`}</section></main>`;
  }
  function updateMap() {
    const ids = new Set(PARKING_AREAS.filter(a => s.kind === 'all' || a.kind === s.kind).map(a => a.id));
    const fc = { ...features, features: features.features.filter(f => ids.has(f.id)) };
    adapter?.update(fc, Object.fromEntries(PARKING_AREAS.map(a => [a.id, display(a)])), s.view === 'detail' ? s.selectedId : null);
    return fc;
  }
  async function loadData() {
    if (loadingPromise) return loadingPromise;
    dataStarted = true; dataState = 'loading';
    loadingPromise = (async () => {
      const c = new AbortController(), timer = setTimeout(() => c.abort(), 20_000);
      try {
        const responses = await Promise.allSettled([fetchCampusFeatures(c.signal), fetchStreetFeatures(c.signal)]);
        features = { type: 'FeatureCollection', features: responses.flatMap(r => r.status === 'fulfilled' ? r.value.features : []) };
        dataState = responses.every(r => r.status === 'fulfilled') ? 'ready' : 'partial';
        if (!features.features.length) { dataState = 'error'; mapError = 'Parking geometry is unavailable. Search still works; try reloading map data in Layers.'; }
        else if (responses.some(r => r.status === 'rejected')) mapError = 'Some parking outlines or streets could not load. Reload map data in Layers to try again.';
      } finally { clearTimeout(timer); loadingPromise = null; onRefresh(); }
    })();
    return loadingPromise;
  }
  function showError(message) {
    mapError = message;
    const el = document.getElementById('geo-map-alert'); if (el) { el.hidden = false; el.querySelector('span').textContent = message; }
  }
  async function mount(session) {
    const placeholder = document.getElementById('geo-map'); if (!placeholder) return;
    if (s.view === 'session' && session?.manual) s.selectedId = session.areaId;
    if (!host) host = placeholder; else if (host !== placeholder) placeholder.replaceWith(host);
    if (!dataStarted) void loadData();
    if (!adapter && !startingMap) {
      startingMap = true;
      try {
        adapter = await createGeographicMap(host, { apiKey: apiKey(), basemap: s.basemap, onSelect: selectArea, onDeselect() { if (s.view === 'detail') { s.view = 'home'; refresh(); } }, onStatus(name) { provider = name; const el = document.getElementById('geo-provider-status'); if (el) el.textContent = name; }, onError: showError });
        if (!fitted) { adapter.fit(); fitted = true; }
      } catch (e) { showError(e.message); }
      finally { startingMap = false; }
    }
    updateMap();
    const sizeMap = () => { const dock = document.querySelector('.geo-dock'), main = document.querySelector('.map-experience'); if (dock && main) main.style.setProperty('--dock-height', `${Math.ceil(dock.getBoundingClientRect().height)}px`); adapter?.resize(); };
    dockObserver?.disconnect();
    if (typeof ResizeObserver !== 'undefined') { dockObserver = new ResizeObserver(sizeMap); const dock = document.querySelector('.geo-dock'); if (dock) dockObserver.observe(dock); }
    requestAnimationFrame(sizeMap);
  }
  function selectArea(id) {
    if (!PARKING_AREAS.some(a => a.id === id)) return;
    s.selectedId = id; s.view = 'detail'; s.query = ''; s.kind = 'all'; persist();
    document.getElementById('modal')?.close();
    document.dispatchEvent(new CustomEvent('campuscurb:explore-real'));
    requestAnimationFrame(() => { adapter?.resize(); adapter?.focus(feature(id)); });
  }
  function sources() {
    showModal(`${modalHeader('Behind the map', 'Real geography. Illustrative parking chances.')}<div class="geo-source-summary"><span>${icon('layers')}<strong id="geo-provider-status">${esc(provider)}</strong></span><span>${icon('clock')}Rules researched ${CHECKED_ON}</span></div><p class="modal-copy">Blue highlights show a researched permit rule, such as no general permit required for the trip. They do not indicate an empty space. Green, yellow, and red demonstrate a future parking-chance layer. They are fixed presentation samples, not measured availability or a validated forecast. Yellow means limited demo parking chance; red means low demo parking chance, not confirmed full. Red with a lock means a permit/payment warning, known trip conflict, or closure; tap the area for its exact reason. A verified full report would show a separate No available spaces reason, and would expire with its source observation. No live vacancies, counts, or occupancy feed are connected. Turn them off in Layers to see unknown availability.</p><p class="modal-copy">Cal Poly supplies lot outlines and garage locations; the City supplies the actual street geometry. Curb highlights are approximate display bands alongside street centerlines. Neither the lines nor the aerial imagery verify that parking is legal on a particular side of the road.</p><p class="modal-copy">Known permit exclusions and closed K1 use a red lock and keep their restrictions. Missing rules remain unconfirmed. A green demo estimate never confirms permission, payment, or an open space. Check the signs, exact entrance, and official information.</p><div class="geo-source-links"><a href="https://maps.calpoly.edu/" target="_blank" rel="noopener noreferrer">Official campus map${icon('external')}</a><a href="${GIS_POLYGONS}" target="_blank" rel="noopener noreferrer">Cal Poly parking outlines${icon('external')}</a><a href="${GIS_POINTS}" target="_blank" rel="noopener noreferrer">Cal Poly garage / lot points${icon('external')}</a><a href="${CITY_STREETS}" target="_blank" rel="noopener noreferrer">City street centerlines${icon('external')}</a><a href="${CITY_PARKING}" target="_blank" rel="noopener noreferrer">City residential parking permits${icon('external')}</a><a href="https://publish.data.ca.gov/dataset/naip-2022-60cm-california" target="_blank" rel="noopener noreferrer">2022 aerial imagery · USDA NAIP / CDFW${icon('external')}</a><a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">OpenFreeMap / OpenStreetMap${icon('external')}</a></div><p class="modal-copy">Imagery is historical, with 0.6 m native detail; closer zooms resample it. Google Maps is used when a browser key is connected. Otherwise the map uses the explicitly credited aerial, vector, or USGS fallback. Reminder notes stay in your browser.</p>`);
  }
  function layers() {
    showModal(`${modalHeader('Your map', 'A clearer view, day or night.')}<div class="geo-view-choices" aria-label="Map style">${[['satellite', 'Satellite', 'layers'], ['dark', 'Dark', 'moon'], ['standard', 'Standard', 'sun'], ['terrain', 'Terrain', 'leaf']].map(([id, label, glyph]) => `<button class="geo-view-choice ${s.basemap === id ? 'active' : ''}" data-geo-basemap="${id}" aria-pressed="${s.basemap === id}"><span class="geo-view-swatch ${id}">${icon(glyph)}</span><strong>${label}</strong>${s.basemap === id ? icon('checkCircle') : ''}</button>`).join('')}</div><label class="geo-toggle-row"><span><strong>Parking chance preview</strong><small>Illustrative colors for this demo</small></span><input id="geo-estimates" type="checkbox" role="switch" ${s.estimates ? 'checked' : ''}></label><div class="geo-settings-list"><button data-geo-action="trip">${icon('permit')}<span>Permits & preferences</span><small>${s.permits.length || 'no'} selected</small>${icon('chevron')}</button>${getSession()?.manual ? `<button data-geo-action="session">${icon('car')}<span>Your parked car</span>${icon('chevron')}</button>` : ''}<button data-geo-action="recenter">${icon('locate')}<span>Show campus & neighborhoods</span>${icon('chevron')}</button><button data-geo-action="settings">${icon('layers')}<span>Map connection</span><small>${apiKey() ? 'Google' : 'Aerial / vector fallback'}</small>${icon('chevron')}</button><button data-geo-action="sources">${icon('info')}<span>Sources & estimates</span>${icon('chevron')}</button><button data-geo-action="retry-data">${icon('arrow')}<span>Reload map data</span><small>${dataState === 'ready' ? 'Up to date' : dataState}</small></button><button data-geo-action="walkthrough">${icon('play')}<span>Sample parking walkthrough</span>${icon('chevron')}</button></div>`);
  }
  function trip() {
    showModal(`${modalHeader('Parking settings', 'Choose your permits and parking preferences.')}<div class="geo-plan"><fieldset class="geo-permit-picker"><legend>Permits to consider</legend><p>Toggle every product you could use. The app hides known conflicts; other spaces still require sign checks.</p><div>${PERMITS.filter(p => p.student).map(p => `<button type="button" class="geo-permit-chip ${s.permits.includes(p.id) ? 'active' : ''}" data-geo-action="toggle-permit" data-id="${p.id}" aria-pressed="${s.permits.includes(p.id)}">${s.permits.includes(p.id) ? icon('check') : icon('plus')}${esc(p.label)}</button>`).join('')}</div><details><summary>Other parking options</summary><div>${PERMITS.filter(p => !p.student).map(p => `<button type="button" class="geo-permit-chip ${s.permits.includes(p.id) ? 'active' : ''}" data-geo-action="toggle-permit" data-id="${p.id}" aria-pressed="${s.permits.includes(p.id)}">${s.permits.includes(p.id) ? icon('check') : icon('plus')}${esc(p.label)}</button>`).join('')}</div></details></fieldset><label>Prioritize<select id="geo-priority"><option value="closest" ${s.priority === 'closest' ? 'selected' : ''}>Closest area first · illustrative</option><option value="garage" ${s.priority === 'garage' ? 'selected' : ''}>Parking structure first</option><option value="chance" ${s.priority === 'chance' ? 'selected' : ''}>Higher demo chance first</option></select></label></div><p class="modal-copy">Student products shown here come from the project’s Cal Poly research handoff. This is not a permit purchase tool or a complete lot-policy database.</p><button class="primary-button" data-action="close-modal">Done${icon('check')}</button>`);
  }
  function rules() {
    const a = selected(), r = result(a), f = feature(a.id);
    showModal(`${modalHeader(a.name, typeName(a))}<div class="geo-decision ${r.status}">${icon('info')}<div><strong>${esc(r.ruleLabel || MAP_STATUS[r.status].label)}</strong><p>${esc(r.reason)}</p></div></div>${chance(a)}${r.limitProvenance === 'user-reported' ? `<p class="modal-copy">Reported parking limit (${esc(r.limitReportedOn)}). ${esc(r.limitScope)}. This has not been independently verified.</p>` : ''}${display(a).reason !== r.reason ? `<p class="modal-copy">${esc(display(a).reason)}</p>` : ''}${r.ruleReviewed ? `<p class="modal-copy">Permit rule checked ${esc(r.ruleCheckedOn)}. Applies to ${esc(r.scope)}; occupancy is unknown.</p><a class="secondary-button" href="${esc(r.ruleSource)}" target="_blank" rel="noopener noreferrer">Published permit rule${icon('external')}</a>` : ''}${parkingGuidance(a)}<div class="grouped-list">${r.maxStayMinutes ? `<div><span>Maximum parking time${r.limitProvenance === 'user-reported' ? ' (reported)' : ''}</span><strong>${esc(formatParkingDuration(r.maxStayMinutes))}</strong></div><div><span>Your planned trip</span><strong>${esc(formatParkingDuration(r.plannedStayMinutes))}</strong></div>` : ''}<div><span>Actual availability</span><strong>Unknown</strong></div><div><span>Permits considered</span><strong>${esc(permitSummary())}</strong></div><div><span>Return walk & price</span><strong>Not verified</strong></div></div><p class="modal-copy">${f ? esc(f.properties.geometryStatus) : 'No matching location in the campus or City map feed.'} Directions open the mapped area, not a verified parking entrance.</p><a class="secondary-button" href="${a.rules.sourceUrl || a.sourceUrl}" target="_blank" rel="noopener noreferrer">Official parking information${icon('external')}</a>${a.kind === 'street' ? `<button class="secondary-button" data-geo-action="districts">City permit districts${icon('chevron')}</button>` : `<a class="secondary-button" href="${ENFORCEMENT_SOURCE}" target="_blank" rel="noopener noreferrer">Campus enforcement hours${icon('external')}</a>`}<button class="secondary-button" data-geo-action="trip">Change permits${icon('permit')}</button><button class="primary-button" data-geo-action="reminder" ${r.status === 'ineligible' ? 'disabled' : ''}>Save car & set reminder${icon('car')}</button>`);
  }
  function parkingGuidance(area) {
    const categories = area.categories.join(' · ');
    const districtNames = area.guidance?.districts || [];
    const districts = RESIDENTIAL_DISTRICTS.filter(district => districtNames.includes(district.name));
    const districtNotes = districts.map(district =>
      `<li><strong>${esc(district.name)}</strong> · ${esc(district.hours)}</li>`
    ).join('');
    return `<p class="modal-copy"><strong>${esc(categories)}</strong></p>
      <p class="modal-copy">${esc(area.note)}</p>
      ${districtNotes ? `<p class="modal-copy">District maps to check for this street</p><ul class="geo-district-list">${districtNotes}</ul>` : ''}
      ${area.guidance?.timed ? `<p class="modal-copy">${esc(area.guidance.timed)}
        <a href="${area.guidance.timedSource}" target="_blank" rel="noopener noreferrer">City report</a></p>` : ''}`;
  }
  function showDistricts() {
    const districtRows = RESIDENTIAL_DISTRICTS.map(district =>
      `<li><strong>${esc(district.name)}</strong><span>${esc(district.hours)}</span>
      <a href="${district.map || CITY_PARKING}" target="_blank" rel="noopener noreferrer" aria-label="City map for ${esc(district.name)}">City map ${icon('external')}</a></li>`
    ).join('');
    showModal(`${modalHeader('City permit districts', 'San Luis Obispo residential parking')}
      <p class="modal-copy">Use the City district permit during the listed hours on signed blocks. A Cal Poly permit does not cover City permit parking. Check the map, both sides of the street, and signs at your space.</p>
      <ul class="geo-district-list">${districtRows}</ul>
      <a class="secondary-button" href="${CITY_PARKING}" target="_blank" rel="noopener noreferrer">Official City permit information ${icon('external')}</a>`);
  }
  function settings() {
    showModal(`${modalHeader('Map connection', 'Google Maps is the preferred provider.')}<p class="modal-copy">Currently using <strong id="geo-provider-status">${esc(provider)}</strong>. Without a Google key, satellite uses 2022 USDA NAIP aerial imagery through CDFW, and the crisp standard/dark map uses OpenFreeMap.</p><form id="geo-google-form"><label class="form-label" for="geo-google-key">Google Maps browser or demo key</label><input type="password" id="geo-google-key" name="key" autocomplete="off" required placeholder="Paste your restricted browser key"><label class="geo-checkbox"><input type="checkbox" name="remember">Remember in this browser</label><button class="primary-button" type="submit">Connect Google Maps${icon('arrow')}</button></form><p class="modal-copy">This connects this browser only. Use a website-restricted key with Maps JavaScript API access. Keys are not added to the team repository.</p><a class="secondary-button" href="https://developers.google.com/maps/documentation/javascript/demo-key" target="_blank" rel="noopener noreferrer">Get a Google Maps demo key${icon('external')}</a><button class="text-button" data-geo-action="fallback">Use the aerial / vector fallback</button>`);
  }
  function reminder() {
    const a = selected(); if (result(a).status === 'ineligible') { onToast(result(a).reason); return; }
    showModal(`${modalHeader('We’ll help you head back.', a.name)}<div class="inline-warning">Eligibility is not confirmed. Check the signs and your payment or permit before saving a reminder.</div><form id="geo-session-form"><label class="form-label" for="geo-reminder-at">Your confirmed return deadline · Los Angeles time</label><input id="geo-reminder-at" name="deadline" type="datetime-local" value="${s.departure}" required><label class="form-label" for="geo-walk">Your estimated walk back · minutes</label><input id="geo-walk" type="number" name="walk" min="1" max="180" required placeholder="Enter your own estimate"><label class="form-label" for="geo-buffer">Extra breathing room</label><select id="geo-buffer" name="buffer"><option value="5">5-minute buffer</option><option value="10">10-minute buffer</option><option value="0">No extra buffer</option></select><label class="form-label" for="geo-note">Remember your spot</label><input id="geo-note" name="note" maxlength="240" placeholder="Level, row, or a landmark…"><label class="geo-checkbox"><input name="confirmed" type="checkbox" required>I checked my parking conditions. This is a manual reminder.</label>${getSession() ? '<p class="modal-copy">Saving this replaces your current session.</p>' : ''}<button class="primary-button" type="submit">Save my reminder${icon('check')}</button></form>`);
  }
  function sessionPanel(session) {
    const a = PARKING_AREAS.find(a => a.id === session.areaId), phase = sessionPhase(session), left = Math.max(0, Math.ceil((session.deadlineAt - Date.now()) / 60_000));
    return `<div class="panel-heading"><div class="eyebrow">A LITTLE PEACE OF PARK</div><h1>My Parking</h1><p>Manual reminder · saved in this browser</p></div><div class="session-location"><span class="lot-icon">P</span><div><h2>${a?.name || 'Saved parking area'}</h2><p>${esc(session.note || 'Area saved · exact car position not recorded')}</p></div><button class="icon-button" data-action="edit-note" aria-label="Edit parking note">${icon('pin')}</button></div><div class="session-countdown"><div class="countdown-number" data-countdown>${left}<span>m</span></div><span>${phase === 'expired' ? 'Your reminder time has arrived' : 'Until your manual deadline'}</span><div class="session-progress"><div data-session-progress></div></div></div>${phase !== 'active' ? `<div class="inline-warning">${icon('bell')}${phase === 'expired' ? 'Your reminder time has arrived. Check the parking conditions and move your car as needed.' : 'Time to head back. Your walk and buffer are included.'}</div>` : ''}<div class="timing-card"><div><span>${icon('clock')}Your reminder deadline</span><strong>${time(session.deadlineAt)}</strong></div><div class="headback-row"><span>${icon('walk')}Head back by</span><strong>${time(headBackAt(session.deadlineAt, session.walkMinutes, session.bufferMinutes))}</strong></div></div><p class="buffer-caption">Your estimate: ${session.walkMinutes} min walk + ${session.bufferMinutes} min buffer</p><p class="geo-detail-note">This is your manually entered reminder time. It does not verify permission, payment, or a legal maximum stay. Reminders appear while the app is open.</p><div class="detail-actions"><button class="primary-button" data-geo-action="show-saved" data-id="${session.areaId}">${icon('pin')}View saved parking area</button><button class="secondary-button" data-action="end">End session</button></div>`;
  }
  document.addEventListener('click', event => {
    const summary = event.target.closest('.geo-trip-entry > summary');
    if (summary) {
      const entry = summary.parentElement;
      s.openEntry = entry.open ? null : entry.id;
      document.querySelectorAll('.geo-trip-entry').forEach(other => { if (other !== entry) other.open = false; });
    }

    const target = event.target.closest('[data-geo-action],[data-geo-kind],[data-geo-basemap]'); if (!target || target.disabled) return;
    if (target.dataset.geoKind) { s.kind = target.dataset.geoKind; refresh(); return; }
    if (target.dataset.geoBasemap) { s.basemap = target.dataset.geoBasemap; onAppearance?.(s.basemap === 'dark' ? 'dark' : 'light'); adapter?.setView(s.basemap); refresh(); layers(); return; }
    switch (target.dataset.geoAction) {
      case 'select': selectArea(target.dataset.id); break;
      case 'set-destination': s.destinationId = target.dataset.id; s.query = ''; refresh(); break;
      case 'toggle-permit': {
        const id = target.dataset.id;
        s.permits = togglePermitSelection(s.permits, id);
        refresh();
        trip();
        break;
      }
      case 'home': s.view = 'home'; s.query = ''; s.kind = 'all'; document.activeElement?.blur(); refresh(); break;
      case 'clear-query': s.query = ''; refresh(); document.getElementById('geo-search')?.focus(); break;
      case 'layers': layers(); break;
      case 'trip': trip(); break;
      case 'rules': rules(); break;
      case 'recenter': document.getElementById('modal').close(); s.view = 'home'; s.kind = 'all'; s.query = ''; refresh(); adapter?.fit(); break;
      case 'locate': {
        if (!navigator.geolocation) { onToast('Location is unavailable in this browser. Search for a street or parking area.'); break; }
        const control = target; control.classList.add('locating');
        navigator.geolocation.getCurrentPosition(p => { control.classList.remove('locating'); adapter?.locate([p.coords.latitude, p.coords.longitude]); }, () => { control.classList.remove('locating'); onToast('Location access is unavailable. Search for a place or show campus from Layers.'); }, { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }); break;
      }
      case 'sources': sources(); break;
      case 'districts': showDistricts(); break;
      case 'settings': settings(); break;
      case 'reminder': reminder(); break;
      case 'retry-data': document.getElementById('modal').close(); mapError = ''; void loadData(); break;
      case 'fallback': s.forceFallback = true; persist(); location.reload(); break;
      case 'dismiss-error': mapError = ''; document.getElementById('geo-map-alert').hidden = true; break;
      case 'session': document.getElementById('modal').close(); s.view = 'session'; refresh(); break;
      case 'show-saved': selectArea(target.dataset.id); break;
      case 'walkthrough': document.getElementById('modal').close(); document.dispatchEvent(new CustomEvent('campuscurb:walkthrough')); break;
    }
  });
  document.addEventListener('focusin', e => {
    if (e.target.id !== 'geo-search' || s.view === 'search') return;
    s.view = 'search'; refresh(); requestAnimationFrame(() => document.getElementById('geo-search')?.focus());
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'geo-arrival') { s.draftArrival = e.target.value; return; }
    if (e.target.id === 'geo-departure') { s.draftDeparture = e.target.value; return; }
    if (e.target.id !== 'geo-search') return;
    s.query = e.target.value; const el = document.getElementById('geo-results'); if (el) el.innerHTML = cards();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('modal').open && s.view !== 'home') { s.view = 'home'; s.query = ''; s.kind = 'all'; refresh(); document.getElementById('geo-layers')?.focus(); }
    if (e.target.id === 'geo-search' && ['ArrowDown', 'Enter'].includes(e.key)) { e.preventDefault(); const first = document.querySelector('#geo-results button'); if (e.key === 'Enter') first?.click(); else first?.focus(); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'geo-estimates') { s.estimates = e.target.checked; refresh(); return; }
    const fields = { 'geo-destination': 'destinationId', 'geo-priority': 'priority' };
    if (fields[e.target.id]) { s[fields[e.target.id]] = e.target.value; s.openEntry = null; refresh(); if (e.target.id === 'geo-destination') onToast('Destination updated. Highlighted areas refreshed.'); }
  });
  document.addEventListener('submit', e => {
    if (!['geo-session-form', 'geo-google-form', 'geo-trip-form'].includes(e.target.id)) return;
    e.preventDefault(); const f = new FormData(e.target);
    if (e.target.id === 'geo-trip-form') {
      const arrival = String(f.get('arrival')), departure = String(f.get('departure'));
      const error = validateTrip(arrival, departure);
      if (error) { document.getElementById('geo-trip-error').textContent = error; return; }
      s.arrival = arrival; s.departure = departure; s.draftArrival = null; s.draftDeparture = null; s.openEntry = null; refresh(); onToast('Trip updated. Parking restrictions refreshed.');
      return;
    }
    if (e.target.id === 'geo-google-form') {
      const key = String(f.get('key')).trim();
      if (!/^[A-Za-z0-9_-]{20,200}$/.test(key)) { onToast('Enter a valid Google Maps browser key.'); return; }
      try { localStorage.removeItem(GOOGLE_KEY); sessionStorage.removeItem(GOOGLE_KEY); (f.get('remember') ? localStorage : sessionStorage).setItem(GOOGLE_KEY, key); s.forceFallback = false; persist(); location.reload(); } catch { onToast('Browser storage is unavailable. Google Maps could not be connected.'); }
    } else {
      try {
        if (selected().rules.closed) throw new Error('This area is closed.');
        if (!f.get('confirmed')) throw new Error('Check and confirm your parking conditions before saving a reminder.');
        const session = createManualSession({ area: selected(), permit: permitPolicyId(activePermits()[0]), destinationId: s.destinationId, deadlineAt: parseCampusDateInput(String(f.get('deadline'))), walkMinutes: Number(f.get('walk')), bufferMinutes: Number(f.get('buffer')), note: f.get('note') });
        document.getElementById('modal').close(); s.view = 'session'; onSession(session);
      } catch (error) { onToast(error.message); }
    }
  });
  onAppearance?.(s.basemap === 'dark' ? 'dark' : 'light');
  return { shell, mount, sessionPanel, panel: searchPanel, mapMarkup: shell, detach() { host?.remove(); }, expanded: () => s.view !== 'home', answer(question, session) {
    if (session && /head|back|expire|deadline|time|when/i.test(question)) return `Your manual reminder ends at ${time(session.deadlineAt)}. Head back by ${time(headBackAt(session.deadlineAt, session.walkMinutes, session.bufferMinutes))}. Your entered walk and buffer are included; payment and parking permission are not verified.`;
    const a = selected(); return `${a.name}: ${result(a).reason}\n\n${a.note}\n\nActual space availability and walking time are unknown. Chance colors are illustrative demo fixtures. Check posted signs. Source: ${a.rules.sourceUrl || a.sourceUrl} (research checked ${a.checkedOn}).`;
  } };
}
