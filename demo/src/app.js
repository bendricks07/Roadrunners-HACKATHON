import { AREAS, DESTINATIONS, PERMITS, INITIAL_REPORTS, REPORT_TYPES, DATA_NOTICE } from './data.js';
import { activeReports, evaluateParking, getWalkMinutes, createSession, headBackAt, sessionPhase, isValidSession, parseSavedState, normalizeReports, MINUTE } from './rules.js';
import { campusMap } from './map.js';
import { PARKING_AREAS } from './street-model.js';
import { createDiscovery } from './discovery.js';

const $ = (selector, parent = document) => parent.querySelector(selector);
const root = $('#app');
const modal = $('#modal');
const KEY = 'campuscurb.demo.v1';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
const time = value => timeFormatter.format(value);
const shortTime = value => time(value).replace(' AM', '').replace(' PM', '');
const paths = {
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  car: '<path d="m5 7 1.4-3h11.2L19 7l2 3v7H3v-7Z M3 10h18 M7 13h1m8 0h1 M5 17v3m14-3v3"/>',
  chat: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.6-4.3A8.5 8.5 0 1 1 21 11.5Z M8 10h8m-8 4h5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/>',
  arrow: '<path d="m5 12 14 0m-5-5 5 5-5 5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  walk: '<circle cx="14" cy="3.5" r="1.5"/><path d="m10 8 3-2 3 5 4 1 M13 6l-3 7-4 7 M10 13l5 3 1 5 M10 8l-4 3-2 1"/>',
  permit: '<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="8" cy="10" r="1.5"/><path d="M6 15h4m3-6h5m-5 4h5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 10v7m0-11v.5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  locate: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
  navigate: '<path d="m21 3-7 18-3-8-8-3Z"/>',
  bookmark: '<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4Z"/>',
  moon: '<path d="M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-10 9 10 6 10-6M2 17l10 6 10-6"/>',
  send: '<path d="m21 3-7 18-3-8-8-3Zm-10 10L21 3"/>',
  flag: '<path d="M5 22V3m0 0c5-5 9 5 15 0v11c-6 5-10-5-15 0"/>',
  leaf: '<path d="M20 3c-1 11-3 17-10 17A7 7 0 0 1 4 8c4-4 9-2 16-5ZM4 21l12-12"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/>',
  building: '<path d="M4 21V7h16v14M2 21h20M7 10h2m6 0h2M7 14h2m6 0h2M10 21v-4h4v4M6 7V3h12v4"/>',
};
const icon = (name, className = '') => `<svg class="icon ${className}" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;

function readSaved() {
  try { return parseSavedState(localStorage.getItem(KEY)); } catch { return {}; }
}
const saved = readSaved();
function validStoredSession(value) {
  return isValidSession(value, [...AREAS, ...PARKING_AREAS].map(a => a.id), DESTINATIONS.map(d => d.id)) && (PARKING_AREAS.some(a => a.id === value.areaId) === (value.manual === true));
}
const restoredSession = validStoredSession(saved.session) ? saved.session : null;
const state = {
  // Every launch opens the map. A previous walkthrough remains available in
  // Layers, with its saved session preserved separately from real parking.
  mode: 'real',
  tab: restoredSession?.manual ? 'parking' : 'explore', detail: false, selectedId: restoredSession?.areaId || 'north', destinationId: DESTINATIONS.some(d => d.id === saved.destinationId) ? saved.destinationId : 'library',
  permit: PERMITS.some(p => p.id === saved.permit) ? saved.permit : 'commuter', durationMinutes: [60,90,120,180,240].includes(saved.durationMinutes) ? saved.durationMinutes : 90,
  sort: 'best', favorites: Array.isArray(saved.favorites) ? saved.favorites.filter(id => AREAS.some(a => a.id === id)) : [],
  reports: Array.isArray(saved.reports) ? normalizeReports(saved.reports, AREAS.map(a => a.id), REPORT_TYPES) : INITIAL_REPORTS.map(r => ({ ...r })),
  session: restoredSession,
  theme: saved.theme === 'dark' ? 'dark' : 'light', messages: [], reminderPreview: false, routeMode: 'drive', zoom: 1, mapPosition: { x: 0, y: 0 },
};
let toastTimer;
let lastPhase = state.session ? sessionPhase(state.session) : null;
const reportSignature = () => activeReports(state.reports).map(r => r.id).join('|');
let lastReportSignature = reportSignature();

function persist() {
  const { destinationId, permit, durationMinutes, favorites, reports, session, theme, mode } = state;
  try { localStorage.setItem(KEY, JSON.stringify({ destinationId, permit, durationMinutes, favorites, reports, session, theme, mode })); }
  catch { toast('Browser storage is unavailable. Keep this tab open to retain your session.'); }
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4800);
}
const area = () => AREAS.find(a => a.id === state.selectedId) || AREAS[0];
const destination = () => DESTINATIONS.find(d => d.id === state.destinationId) || DESTINATIONS[0];
const plan = () => ({ permit: state.permit, durationMinutes: state.durationMinutes });
const eligibility = a => evaluateParking(a, plan(), state.reports);
const walk = a => getWalkMinutes(a, state.destinationId, state.reports);
const money = a => a.price === 0 ? a.permits.includes(state.permit) ? 'Included with permit' : 'Permit required' : `$${a.price} demo rate`;
const discovery = createDiscovery({ icon, escape, time, onRefresh: render, onToast: toast, showModal, modalHeader, getSession: () => state.session, onAppearance(theme) { state.theme = theme; persist(); }, onSession(session) {
  state.session = session; state.tab = 'parking'; state.mode = 'real'; state.reminderPreview = false; lastPhase = sessionPhase(session); persist(); render(); toast('Your manual reminder is saved in this browser.');
} });
const usesRealMap = () => state.mode === 'real' && !(state.tab === 'parking' && state.session && !state.session.manual);

function nav() {
  const items = [['explore','compass','Explore'],['parking','car','My Parking'],['ask','chat','Ask'],['updates','bell','Updates']];
  return `<aside class="sidebar">
    <a class="brand" href="#" data-tab="explore" aria-label="CampusCurb home"><span class="brand-icon">P<span></span></span><span>CampusCurb<span class="brand-sub">A little less circling.</span></span></a>
    <div class="sidebar-campus"><span class="campus-monogram">CP</span><div>Cal Poly<span>San Luis Obispo</span></div>${icon('chevron')}</div>
    <div class="nav-label">YOUR CAMPUS, SIMPLIFIED</div>
    <nav class="main-nav" aria-label="Main navigation">${items.map(([id,glyph,label]) => `<button class="nav-item ${state.tab === id ? 'selected' : ''}" data-tab="${id}" ${state.tab === id ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${label}</span>${id === 'parking' && state.session ? '<i class="nav-dot" aria-label="Active session"></i>' : ''}${id === 'updates' && activeReports(state.reports).length ? `<span class="nav-count">${activeReports(state.reports).length}</span>` : ''}</button>`).join('')}</nav>
    <div class="sidebar-bottom"><div class="sidebar-tip">${icon('leaf')}<p>Less searching.<br><strong>More campus.</strong></p></div><button class="demo-launch" data-action="demo">${icon('play')}<span>Try a 90-second session</span></button><div class="sidebar-settings"><button class="theme-button" data-action="theme" aria-label="Switch to ${state.theme === 'light' ? 'dark' : 'light'} appearance">${icon(state.theme === 'light' ? 'moon' : 'sun')}<span>${state.theme === 'light' ? 'Dark appearance' : 'Light appearance'}</span></button><span class="version-label">DEMO 01</span></div></div>
  </aside>`;
}

function heading(kicker, title, description = '') {
  return `<div class="panel-heading"><div class="eyebrow">${kicker}</div><h1>${title}</h1>${description ? `<p>${description}</p>` : ''}</div>`;
}
function searchControl() {
  return `<div class="search-wrap"><label class="search-field" for="destination-search">${icon('search')}<input id="destination-search" type="search" autocomplete="off" placeholder="Where are you headed?" aria-label="Campus destination" value="${escape(destination().name)}" aria-controls="destination-options" aria-expanded="false"><span class="search-shortcut" aria-hidden="true">⌕</span></label><div id="destination-options" class="destination-options" hidden>${destinationOptions('')}</div></div>`;
}
function destinationOptions(query) {
  const options = DESTINATIONS.filter(d => d.name.toLowerCase().includes(query.toLowerCase()));
  return options.length ? options.map(d => `<button class="destination-option" data-destination="${d.id}">${icon('building')}<span><strong>${d.name}</strong><small>${d.subtitle}</small></span>${d.id === state.destinationId ? icon('check') : ''}</button>`).join('') : '<p class="search-empty">Try Kennedy Library, University Union, Recreation Center, or Performing Arts Center.</p>';
}
function filters() {
  return `<div class="plan-filters"><label class="filter-select">${icon('clock')}<select id="duration-select" aria-label="Length of stay">${[60,90,120,180,240].map(n => `<option value="${n}" ${n === state.durationMinutes ? 'selected' : ''}>${n === 90 ? '1.5 hours' : `${n/60} hour${n===60?'':'s'}`} · until ${time(Date.now()+n*MINUTE)}</option>`).join('')}</select></label><label class="filter-select">${icon('permit')}<select id="permit-select" aria-label="Your parking permit">${PERMITS.map(p => `<option value="${p.id}" ${p.id===state.permit?'selected':''}>${p.label}</option>`).join('')}</select></label></div>`;
}
function parkingCard(a, index) {
  const result = eligibility(a);
  const recentFull = activeReports(state.reports).some(r => r.areaId === a.id && r.type === 'full');
  return `<article class="parking-card ${a.id === state.selectedId ? 'highlighted' : ''} ${result.status !== 'eligible' ? 'uncertain' : ''}">
    <button class="parking-card-main" data-action="details" data-id="${a.id}" aria-label="View ${a.name}"><div class="card-heading"><span class="lot-icon ${a.photo}">P</span><div><h3>${a.name}</h3><p>${a.detail}</p></div>${icon('chevron')}</div><div class="card-metrics"><span>${icon('walk')}<strong>${walk(a)} min</strong><span>walk</span></span><span class="metrics-divider"></span><span>${money(a)}</span></div><div class="card-footer"><span class="eligibility-tag ${result.status}">${icon(result.status === 'eligible' ? 'checkCircle' : 'info')}${result.status === 'eligible' ? 'Fits your stay' : result.status === 'unknown' ? 'Check permit' : 'Doesn’t fit'}</span><span class="availability">${recentFull ? 'Reported full' : 'Availability unknown'}</span></div></button>
    ${index === 0 && result.status === 'eligible' ? '<div class="best-label">BEST MATCH</div>' : ''}
  </article>`;
}

function explorePanel() {
  if (state.mode === 'real') return discovery.panel();
  if (state.detail) return detailPanel();
  const rank = a => { const result = eligibility(a); return result.status === 'eligible' ? 0 : result.status === 'unknown' ? 1000 : 2000; };
  const sorted = [...AREAS].sort((a,b) => rank(a)-rank(b) || (state.sort === 'price' ? a.price-b.price : state.sort === 'closest' ? walk(a)-walk(b) : walk(a)+a.price-walk(b)-b.price));
  const eligibleCount = sorted.filter(a => eligibility(a).status === 'eligible').length;
  return `<button class="geo-return-button" data-action="real-map">${icon('back')}Back to the real campus map</button>${heading('SAMPLE WALKTHROUGH', 'Find your place.', 'Fictional lots and rules for the presentation.')}
    <div class="plan-section">${searchControl()}${filters()}</div>
    <div class="results-header"><h2>${eligibleCount ? `${eligibleCount} option${eligibleCount === 1 ? '' : 's'} for you` : state.permit === 'unknown' ? 'Check before parking' : 'Adjust your plan'}</h2><span>Near ${destination().name.replace('Kennedy ', '').replace('University ', '')}</span></div>
    <div class="segmented" aria-label="Sort parking">${[['best','Best match'],['closest','Closest'],['price','Lowest cost']].map(([id,label]) => `<button class="${state.sort===id?'active':''}" data-sort="${id}" aria-pressed="${state.sort===id}">${label}</button>`).join('')}</div>
    <div class="parking-results">${sorted.map((a,index) => `${eligibility(a).status!=='eligible' && (index===0 || eligibility(sorted[index-1]).status!==eligibility(a).status)?`<div class="result-group-label">${eligibility(a).status==='unknown'?'CHECK BEFORE PARKING':'DOESN’T FIT THIS PLAN'}</div>`:''}${parkingCard(a,index)}`).join('')}</div>
    <div class="quiet-note">${icon('info')}<p>Permit fit and space availability are different. Always check the signs when you arrive.</p></div>
    <div class="demo-note"><span class="tiny-dot"></span>Sample parking data for this demonstration</div>`;
}

function detailPanel() {
  const a = area();
  const result = eligibility(a);
  const saved = state.favorites.includes(a.id);
  return `<div class="detail-top"><button class="text-button back-button" data-action="back">${icon('back')}Explore</button><button class="icon-button ${saved?'is-saved':''}" data-action="save" aria-label="${saved?'Unsave':'Save'} ${a.name}" aria-pressed="${saved}">${icon('bookmark')}</button></div>
    <div class="detail-hero ${a.photo}"><div class="detail-hero-lines"></div><span class="hero-parking">P</span><span class="hero-caption">CAL POLY · DEMO LOCATION</span></div>
    <div class="detail-title"><div class="eyebrow">${a.id==='grand'?'PARKING STRUCTURE':'CAMPUS PARKING'}</div><h1>${a.name}</h1><p>${icon('walk')}${walk(a)} min walk to ${destination().name}</p></div>
    <div class="eligibility-banner ${result.status}">${icon(result.status === 'eligible' ? 'checkCircle' : 'info')}<span>${escape(result.reason)}</span></div>
    <div class="grouped-list"><div><span>Planned departure</span><strong>${time(Date.now()+state.durationMinutes*MINUTE)}</strong></div><div><span>Time limit</span><strong>${a.maxStayMinutes/60} hours · demo</strong></div><div><span>Parking cost</span><strong>${money(a)}</strong></div><div><span>Availability</span><strong class="muted-value">Unknown</strong></div></div>
    <button class="disclosure-row" data-action="rules">${icon('permit')}<span>Parking rules & sources</span>${icon('chevron')}</button>
    <div class="detail-actions"><button class="primary-button" data-action="route">${icon('navigate')}Preview route<span>${a.drive} min</span></button><button class="secondary-button" data-action="park" ${result.status!=='eligible'?'disabled':''}>${icon('car')}I parked here</button></div>
    <p class="detail-disclaimer">Illustrative location and rules. This preview is not a verified driving route.</p>`;
}

function countdownText(session) {
  const seconds = Math.max(0, Math.ceil((session.deadlineAt-Date.now())/1000));
  const h = Math.floor(seconds/3600), m = Math.floor(seconds%3600/60), s = seconds%60;
  return h ? `${h}<span>h</span> ${String(m).padStart(2,'0')}<span>m</span>` : session.demo || seconds < 300 ? `${m}<span>m</span> ${String(s).padStart(2,'0')}<span>s</span>` : `${m}<span>m</span>`;
}
function parkingPanel() {
  const session = state.session;
  if (session?.manual) return discovery.sessionPanel(session);
  if (!session) return `${heading('ONE LESS THING TO THINK ABOUT', 'My Parking', 'Your car. Your time. All in one place.')}<div class="empty-parking"><div class="empty-car">${icon('car')}</div><h2>A little peace of park.</h2><p>Pick a spot, confirm you’ve parked,<br>and we’ll keep an eye on the time.</p><button class="primary-button" data-tab="explore">Find parking${icon('arrow')}</button><button class="text-button" data-action="demo">Try a 90-second demo${icon('play')}</button></div><div class="session-benefits"><div>${icon('pin')}<span>Remember where you parked</span></div><div>${icon('clock')}<span>Know exactly when to head back</span></div><div>${icon('walk')}<span>Make time for the walk</span></div></div>`;
  const a = AREAS.find(a => a.id===session.areaId);
  const phase = sessionPhase(session);
  const warning = phase === 'expired' || phase === 'head-back' || state.reminderPreview;
  const hb = headBackAt(session.deadlineAt,session.walkMinutes,session.bufferMinutes);
  const closure = activeReports(state.reports).some(r => r.areaId===session.areaId && r.type==='closure');
  return `<div class="panel-heading session-heading"><div class="eyebrow">YOUR TIME, TAKEN CARE OF</div><h1>My Parking</h1><span class="session-status ${phase}"><i></i>${phase==='expired'?'Parking time ended':phase==='head-back'?'Time to head back':'Active session'}${session.demo?' · 90-second demo':''}</span></div>
    <div class="session-location"><span class="lot-icon">P</span><div><h2>${a.name}</h2><p>${escape(session.note || 'Saved demo parking location')}</p></div><button class="icon-button" data-action="edit-note" aria-label="Edit parking note">${icon('pin')}</button></div>
    ${closure?`<div class="inline-warning">${icon('flag')}Entrance closure reported. Check for an alternate entrance.</div>`:''}
    <div class="session-countdown ${phase==='expired'?'expired':''}"><div class="countdown-number" data-countdown>${countdownText(session)}</div><span>${phase==='expired'?'Parking time has ended':'Parking time remaining'}</span><div class="session-progress"><div data-session-progress></div></div></div>
    ${warning?`<div class="return-reminder ${phase==='expired'?'expired':''}">${icon('bell')}<div><strong>${phase==='expired'?'Your parking time has ended':'Time to head back'}</strong><p>${phase==='expired'?'Check your parking conditions and move your car as needed.':state.reminderPreview?'This is a simulated reminder. Your actual deadline is unchanged.':'Your return walk and buffer are included. Let’s get you to your car.'}</p></div>${state.reminderPreview?'<button class="icon-button" data-action="dismiss-reminder" aria-label="Dismiss simulated reminder">'+icon('close')+'</button>':''}</div>`:''}
    <div class="timing-card"><div><span>${icon('clock')}Parking ends</span><strong>${time(session.deadlineAt)}</strong></div><div class="headback-row"><span>${icon('walk')}Head back by</span><strong>${time(hb)}</strong></div></div>
    <p class="buffer-caption">${session.demo?'Demo timing: 30 sec walk + 30 sec buffer':`${session.walkMinutes} min walk + ${session.bufferMinutes} min buffer`}</p>
    <div class="detail-actions"><button class="primary-button" data-action="walk-back">${icon('walk')}Walk to my car${icon('arrow')}</button><button class="secondary-button" data-action="end">End session</button></div>
    <div class="mini-map"><div class="mini-map-title">${icon('pin')}Your car is right here</div>${campusMap({selectedId:a.id,destinationId:session.destinationId,compact:true,mode:'car'})}<span class="mini-map-label">${a.name}</span></div>
    <div class="session-demo-controls"><button class="text-button" data-action="remind">${icon('bell')}Preview reminder</button><button class="text-button" data-action="demo">${icon('play')}90-second demo</button></div><p class="detail-disclaimer">In-app reminders work while this demo is open. Your session is saved on this browser.</p>`;
}

function askPanel() {
  return `${heading('A CLEARER ANSWER', 'Ask CampusCurb', 'Less parking guesswork. More getting on with your day.')}<div class="guide-label">${icon('info')}${state.mode==='real'?'Source guide · Campus records · Eligibility unconfirmed':'Demo guide · Uses the sample parking rules'}</div><div class="chat-messages" id="chat-messages">${state.messages.length ? state.messages.map(m => `<div class="chat-message ${m.role}">${m.role==='assistant'?'<span class="assistant-avatar">P</span>':''}<div>${escape(m.text).replace(/\n/g,'<br>')}</div></div>`).join('') : `<div class="ask-welcome"><div class="ask-orbit">${icon('chat')}</div><h2>What’s on your mind?</h2><p>${state.mode==='real'?'I can explain the selected parking area, source confidence, and your return reminder.':'I can help compare the sample parking options and explain your current session.'}</p></div><div class="suggested-questions">${['Where should I park?','Does my permit work here?','When should I head back?','Any parking updates?'].map(q => `<button data-question="${q}">${q}${icon('arrow')}</button>`).join('')}</div>`}</div><form id="ask-form" class="ask-input"><label class="sr-only" for="question-input">Your parking question</label><input id="question-input" name="question" placeholder="Ask about your parking…" maxlength="300" required autocomplete="off"><button type="submit" class="send-button" aria-label="Send question">${icon('send')}</button></form><p class="detail-disclaimer">Rule-based demo answers. No live AI service or real-time parking feed is connected.</p>`;
}
function answerQuestion(question) {
  if (state.mode === 'real' || state.session?.manual) return discovery.answer(question, state.session);
  const q = question.toLowerCase();
  const a = area();
  const result = eligibility(a);
  if (/overnight|over night|tomorrow|weekend|holiday/.test(q)) return 'I cannot verify overnight, future-day, weekend, or holiday parking permission from these sample rules. A positive result for your selected short demo stay does not establish permission for those times. Check the current official Cal Poly guidance and posted signs.';
  if (/head|back|expire|deadline|time|long|when/.test(q)) {
    if (!state.session) return 'You don’t have an active parking session yet. Choose a parking option and tap “I parked here.” I’ll calculate your head-back time from the confirmed deadline, return walk, and buffer.';
    const s=state.session;
    return `Your parking ends at ${time(s.deadlineAt)}. Head back by ${time(headBackAt(s.deadlineAt,s.walkMinutes,s.bufferMinutes))}.\n\nThat includes ${s.demo?'a simulated 30-second walk and 30-second buffer':`a ${s.walkMinutes}-minute walk and ${s.bufferMinutes}-minute buffer`}. The deadline is based on your confirmed demo parking time, not a completed payment.`;
  }
  if (/update|clos|full|report|change/.test(q)) {
    const reports=activeReports(state.reports);
    return reports.length ? `${reports.length} active demo update${reports.length===1?'':'s'}:\n\n${reports.map(r=>`${AREAS.find(a=>a.id===r.areaId)?.name}: ${r.title}. ${r.description}`).join('\n\n')}\n\nCommunity observations are unverified; they do not establish official parking rules.` : 'There are no active reports in this demonstration. That does not confirm any lot is open or has spaces. You can add an update in the Updates tab and see the suggestions change.';
  }
  if (/permit|eligib|allow|valid|overnight|free|cost|pay|rules/.test(q)) return `${a.name}: ${result.reason}\n\nYour selection: ${PERMITS.find(p=>p.id===state.permit).label}, staying ${state.durationMinutes} minutes. The sample maximum stay is ${a.maxStayMinutes/60} hours. Availability is unknown.\n\nSource: simulated demo rules, not verified Cal Poly policy. Check the posted signs and official parking information before using a real lot.`;
  if (/park|where|best|near|library|cheap|closest|spot/.test(q)) {
    const eligible=AREAS.filter(a=>eligibility(a).status==='eligible').sort((a,b)=>walk(a)+a.price-walk(b)-b.price);
    if (!eligible.length) return 'I can’t confidently recommend a demo lot for those settings. Try choosing your permit and a shorter stay in Explore. Unknown eligibility is kept separate from a positive recommendation.';
    const best=eligible[0];
    return `For ${destination().name}, try ${best.name} in this demonstration. It’s a ${walk(best)}-minute walk and fits your ${state.durationMinutes}-minute plan with the selected permit.\n\n${eligible[1]?`Backup: ${eligible[1].name}, ${walk(eligible[1])} minutes away on foot.\n\n`:''}Space availability is unknown. These are sample rules, not live parking advice.`;
  }
  return 'I can explain the parking options, your permit fit, your head-back time, or nearby demo reports. Try “Where should I park?” or “When should I head back?”\n\nThis demo guide answers from the shared sample rules; it does not use a live AI model.';
}

function relativeTime(at) { const m=Math.max(0,Math.floor((Date.now()-at)/MINUTE)); return m<1?'Just now':`${m} min ago`; }
function updatesPanel() {
  const reports=activeReports(state.reports).sort((a,b)=>b.createdAt-a.createdAt);
  return `${heading('A LITTLE LOCAL KNOW-HOW', 'Campus updates', 'A heads-up can make someone’s day.')}<button class="primary-button report-button" data-action="report">${icon('plus')}Share an update</button><div class="feed-heading"><h2>Nearby reports</h2><span>${reports.length} active</span></div>${reports.length?`<div class="updates-feed">${reports.map(r=>`<article class="update-card"><div class="update-icon ${r.type}">${icon(r.type==='full'?'car':r.type==='path'?'walk':'flag')}</div><div class="update-content"><div class="update-meta">${AREAS.find(a=>a.id===r.areaId)?.name} <span>· ${relativeTime(r.createdAt)}</span></div><h3>${escape(r.title)}</h3><p>${escape(r.description)}</p><div class="update-footer"><span>Community · Unverified</span><button data-resolve-report="${escape(r.id)}">Mark resolved${icon('check')}</button></div></div></article>`).join('')}</div>`:`<div class="feed-empty"><div class="empty-car">${icon('checkCircle')}</div><h2>A quiet day on campus.</h2><p>No active demo reports. Share a closure or a full lot to see how CampusCurb responds.</p></div>`}<div class="report-demo-card">${icon('layers')}<div><h3>See a change in action</h3><p>Simulate a walkway closure and watch the return-walk estimate adjust.</p><button class="text-button" data-action="simulate-closure">Simulate walkway closure${icon('arrow')}</button></div></div><div class="quiet-note">${icon('info')}<p>Reports in this demo stay in your browser. Community reports never override official parking rules.</p></div>`;
}

function mapPanel() {
  const isSession = state.tab==='parking' && state.session;
  const mapArea = isSession ? AREAS.find(a=>a.id===state.session.areaId) : area();
  const dest = isSession ? DESTINATIONS.find(d=>d.id===state.session.destinationId) : destination();
  const selectedWalk = isSession ? state.session.walkMinutes : walk(mapArea);
  const mapEligibility = eligibility(mapArea).status;
  return `<section class="map-pane" aria-label="Campus parking map"><div class="map-toolbar"><div class="campus-chip">${icon('building')}<span>Cal Poly, San Luis Obispo</span><span class="location-online"></span></div><button class="data-chip" data-action="data-info">Demo data${icon('info')}</button></div><div class="map-canvas" id="map-canvas"><div class="map-world" id="map-world" style="transform:translate(${state.mapPosition.x}px,${state.mapPosition.y}px) scale(${state.zoom})">${campusMap({selectedId:mapArea.id,destinationId:dest.id,route:true,mode:isSession?'car':'drive',reports:state.reports})}</div></div><div class="map-controls"><button class="icon-button" data-action="zoom-in" aria-label="Zoom in">${icon('plus')}</button><button class="icon-button" data-action="zoom-out" aria-label="Zoom out">${icon('minus')}</button><span></span><button class="icon-button" data-action="recenter" aria-label="Recenter map">${icon('locate')}</button></div><div class="map-location-card"><div class="location-card-icon">${icon(isSession?'walk':'navigate')}</div><div><div class="location-card-eyebrow">${isSession?'YOUR RETURN WALK':mapEligibility==='eligible'?'A SPOT THAT FITS YOUR DAY':mapEligibility==='unknown'?'CHECK YOUR PERMIT FIRST':'DOESN’T FIT YOUR CURRENT PLAN'}</div><h2>${isSession?`Back to ${mapArea.name}`:mapArea.name}</h2><p>${isSession?'From '+dest.name:dest.name+' is a short walk away'}</p></div><div class="route-duration"><strong>${isSession && state.session.demo?'30 sec':selectedWalk+' min'}</strong><span>${icon('walk')}walk</span></div><button class="round-action" data-action="${isSession?'walk-back':'details'}" data-id="${mapArea.id}" aria-label="${isSession?'View return route':'View parking details'}">${icon('arrow')}</button></div><div class="map-footer"><span>${icon('pin')}Illustrative campus map</span><span>Rules and routes are simulated</span></div><div class="map-compass" aria-hidden="true"><span>N</span>${icon('navigate')}</div></section>`;
}

function render({ preserveDrafts = false } = {}) {
  const focusedId = root.contains(document.activeElement) ? document.activeElement.id : null;
  const draft = preserveDrafts && focusedId ? document.getElementById(focusedId) : null;
  const draftState = draft && 'value' in draft ? { value: draft.value, start: draft.selectionStart, end: draft.selectionEnd } : null;
  const focusId = document.activeElement?.id?.startsWith('geo-') ? document.activeElement.id : null;
  discovery.detach();
  syncSessionWalk();
  lastReportSignature = reportSignature();
  document.documentElement.dataset.theme = state.theme;
  $('meta[name="theme-color"]').content = state.theme==='dark'?'#111316':'#f7f8fa';
  const content = state.tab==='parking'?parkingPanel():state.tab==='ask'?askPanel():state.tab==='updates'?updatesPanel():explorePanel();
  const realMap = usesRealMap();
  root.innerHTML = realMap ? discovery.shell({ session: state.session, showSession: state.tab === 'parking' }) : `<div class="app-shell tab-${state.tab}"><header class="mobile-appbar"><a href="#" data-tab="explore" class="mobile-brand"><span class="brand-icon">P<span></span></span>CampusCurb</a><div><button class="icon-button" data-action="demo" aria-label="Start 90-second demo">${icon('play')}</button><button class="icon-button" data-action="theme" aria-label="Switch to ${state.theme==='light'?'dark':'light'} appearance">${icon(state.theme==='light'?'moon':'sun')}</button></div></header>${nav()}<main id="main-content" class="content-panel" tabindex="-1">${content}<div class="panel-bottom-brand">CampusCurb<span>A little less circling.</span></div></main>${mapPanel()}</div>`;
  if (realMap) void discovery.mount(state.tab === 'parking' ? state.session : null);
  if (focusId && (focusId !== 'geo-search' || root.querySelector('.search-open'))) document.getElementById(focusId)?.focus({ preventScroll: true });
  updateClock(false);
  const chat=$('#chat-messages'); if(chat && state.messages.length) chat.scrollTop=chat.scrollHeight;
  if (draftState) {
    const input = document.getElementById(focusedId);
    if (input) {
      input.value = draftState.value; input.focus({ preventScroll: true });
      if (draftState.start !== null) input.setSelectionRange?.(draftState.start, draftState.end);
      if (focusedId === 'destination-search') $('#destination-options').innerHTML = destinationOptions(input.value);
    }
  }
}

function showModal(content) {
  modal.innerHTML=`<div class="modal-body">${content}</div>`;
  if(!modal.open) modal.showModal();
  (modal.querySelector('form select, form input, form textarea') || modal.querySelector('button, a[href]'))?.focus();
}
function modalHeader(title, text='') { return `<div class="modal-heading"><div><h2 id="modal-title">${title}</h2>${text?`<p>${text}</p>`:''}</div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button></div>`; }
function startDialog() {
  const a=area();
  if(eligibility(a).status!=='eligible') { toast('Adjust your permit or stay before starting this demo session.'); return; }
  showModal(`${modalHeader('Make yourself at home.', `Start a parking session at ${a.name}.`)}${state.session?'<div class="inline-warning">This will replace your current parking session.</div>':''}<form id="start-form"><label class="form-label" for="session-duration">Parking time</label><select id="session-duration" name="duration">${[30,60,90,120,180,240].filter(n=>n<=a.maxStayMinutes).map(n=>`<option value="${n}" ${n===state.durationMinutes?'selected':''}>${n} minutes · until ${time(Date.now()+n*MINUTE)}</option>`).join('')}</select><label class="form-label" for="session-buffer">A little breathing room</label><select id="session-buffer" name="buffer"><option value="5">5-minute return buffer</option><option value="10">10-minute return buffer</option><option value="0">No extra buffer</option></select><label class="form-label" for="session-note">Remember your spot <span>optional</span></label><input id="session-note" name="note" maxlength="240" placeholder="Level 2, near the east stairs…"><div class="form-note">${icon('info')}This confirms a demo parking time. It does not purchase or extend parking.</div><button class="primary-button" type="submit">${icon('checkCircle')}${state.session?'Replace session':'Start my session'}</button></form>`);
}
function reportDialog() {
  showModal(`${modalHeader('Give campus a heads-up.', 'A quick update can help the next person.')}<form id="report-form"><label class="form-label" for="report-area">Where?</label><select id="report-area" name="area">${AREAS.map(a=>`<option value="${a.id}">${a.name}</option>`).join('')}</select><label class="form-label" for="report-type">What’s happening?</label><select id="report-type" name="type">${Object.entries(REPORT_TYPES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select><label class="form-label" for="report-description">A little more detail</label><textarea id="report-description" name="description" rows="3" required minlength="5" maxlength="500" placeholder="What should other drivers know?"></textarea><div class="form-note">${icon('info')}Demo reports are saved only in this browser and labeled unverified.</div><button class="primary-button" type="submit">${icon('flag')}Share update</button></form>`);
}

function startDemo() {
  state.mode = 'demo';
  const a=AREAS.find(a=>a.id===state.selectedId)||AREAS[0];
  const s=createSession({area:a,destinationId:state.destinationId,durationMinutes:1.5,bufferMinutes:.5,demo:true,note:'90-second demo · Simulated location'});
  s.walkMinutes=.5;
  state.session=s; state.tab='parking'; state.reminderPreview=false; lastPhase='active'; persist(); render();
  toast('90-second demo started. A head-back reminder appears in 30 seconds.');
}

function syncSessionWalk() {
  if(!state.session || state.session.demo || state.session.manual) return false;
  const s=state.session;
  const a=AREAS.find(a=>a.id===s.areaId);
  const minutes=getWalkMinutes(a,s.destinationId,state.reports);
  if(s.walkMinutes===minutes) return false;
  s.walkMinutes=minutes;
  persist();
  return true;
}
function updateClock(allowRender=true) {
  if (allowRender && reportSignature() !== lastReportSignature) { render({ preserveDrafts: true }); return; }
  if(!state.session) return;
  const changed=syncSessionWalk();
  const s=state.session;
  const phase=sessionPhase(s);
  const el=$('[data-countdown]'); if(el) el.innerHTML=countdownText(s);
  const progress=$('[data-session-progress]'); if(progress) progress.style.width=`${Math.max(0,Math.min(100,(Date.now()-s.startedAt)/(s.deadlineAt-s.startedAt)*100))}%`;
  if((phase!==lastPhase || changed) && allowRender) {
    const phaseChanged=phase!==lastPhase;
    lastPhase=phase; render({ preserveDrafts: true });
    if(phaseChanged && phase==='head-back') toast('Time to head back. Your return walk and buffer are included.');
    if(phaseChanged && phase==='expired') toast(state.session.manual ? 'Your manual reminder time has arrived.' : 'Your parking time has ended.');
  }
}

document.addEventListener('click', event => {
  const target=event.target.closest('button, a[data-tab], [data-select-area]');
  if(!event.target.closest('.search-wrap')) closeDestinationOptions();
  if(!target) return;
  if(target.disabled) return;
  if(target.dataset.tab) { event.preventDefault(); state.tab=target.dataset.tab; state.detail=false; state.reminderPreview=false; render(); return; }
  if(target.dataset.destination) { state.destinationId=target.dataset.destination; persist(); render(); $('#destination-search')?.focus(); closeDestinationOptions(); return; }
  if(target.dataset.sort) { state.sort=target.dataset.sort; render(); return; }
  if(target.dataset.selectArea) { state.selectedId=target.dataset.selectArea; state.tab='explore'; state.detail=true; render(); return; }
  if(target.dataset.question) { const q=target.dataset.question; state.messages.push({role:'user',text:q},{role:'assistant',text:answerQuestion(q)}); render(); return; }
  if(target.dataset.resolveReport) { const r=state.reports.find(r=>r.id===target.dataset.resolveReport); if(r) r.active=false; persist(); render(); toast('Report marked resolved. Parking suggestions have been updated.'); return; }
  switch(target.dataset.action) {
    case 'real-map': state.mode='real'; state.tab='explore'; persist(); render(); break;
    case 'theme': state.theme=state.theme==='light'?'dark':'light'; persist(); render(); break;
    case 'details': if(target.dataset.id) state.selectedId=target.dataset.id; state.tab='explore'; state.detail=true; render(); break;
    case 'back': state.detail=false; render(); break;
    case 'save': state.favorites=state.favorites.includes(area().id)?state.favorites.filter(id=>id!==area().id):[...state.favorites,area().id]; persist(); render(); toast(state.favorites.includes(area().id)?'Parking saved for next time.':'Parking removed from saved places.'); break;
    case 'route': showModal(`${modalHeader('A clear way to campus.', `Route preview · ${area().name}`)}<div class="route-preview-map">${campusMap({selectedId:area().id,destinationId:state.destinationId,compact:true})}</div><div class="route-stats"><span>${icon('car')}<strong>${area().drive} min</strong> drive</span><span>${icon('walk')}<strong>${walk(area())} min</strong> walk</span></div><p class="modal-copy">This is an illustrative route. Confirm the entrance and posted parking signs when you arrive.</p><a class="secondary-button" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination().query)}">Open destination in Maps${icon('external')}</a><button class="primary-button" data-action="park" ${eligibility(area()).status!=='eligible'?'disabled':''}>I parked here${icon('arrow')}</button>`); break;
    case 'park': startDialog(); break;
    case 'rules': showModal(`${modalHeader('Know before you park.', area().name)}<div class="eligibility-banner unknown">${icon('info')}Simulated rules for this demonstration</div><div class="grouped-list"><div><span>Accepted demo permits</span><strong>${area().permits.join(', ')}</strong></div><div><span>Maximum demo stay</span><strong>${area().maxStayMinutes/60} hours</strong></div><div><span>Availability feed</span><strong>Not connected</strong></div></div><p class="modal-copy">${DATA_NOTICE}</p><a class="secondary-button" href="https://afd.calpoly.edu/parking/slo/parking-on-campus/permits/" target="_blank" rel="noopener noreferrer">Official Cal Poly parking information${icon('external')}</a>`); break;
    case 'data-info': showModal(`${modalHeader('A preview of a calmer commute.')}<p class="modal-copy">CampusCurb is an interactive hackathon prototype. Parking rules, prices, map positions, routes, and reports are illustrative.</p><p class="modal-copy">The session clock, return-time calculations, saved state, filters, and report responses work in this browser. Live occupancy, payments, automatic parking detection, and AI services are not connected.</p><a class="secondary-button" href="https://afd.calpoly.edu/parking/slo/" target="_blank" rel="noopener noreferrer">Check official parking information${icon('external')}</a><button class="primary-button" data-action="close-modal">Got it${icon('check')}</button>`); break;
    case 'demo': if(modal.open) modal.close(); if(state.session) showModal(`${modalHeader('Try a quick session?', 'This replaces your current demo parking session.')}<p class="modal-copy">A head-back reminder appears after 30 seconds. The parking session ends after 90 seconds.</p><button class="primary-button" data-action="confirm-demo">Start 90-second demo${icon('play')}</button><button class="secondary-button" data-action="close-modal">Keep my session</button>`); else startDemo(); break;
    case 'confirm-demo': modal.close(); startDemo(); break;
    case 'remind': state.reminderPreview=true; render(); toast('Simulated reminder shown. Your actual deadline has not changed.'); break;
    case 'dismiss-reminder': state.reminderPreview=false; render(); break;
    case 'walk-back': if(!state.session) break; state.selectedId=state.session.areaId; state.destinationId=state.session.destinationId; state.routeMode='walk'; showModal(`${modalHeader('Let’s get you back.', `${AREAS.find(a=>a.id===state.session.areaId).name} · Saved car location`)}<div class="route-preview-map">${campusMap({selectedId:state.session.areaId,destinationId:state.session.destinationId,compact:true,mode:'car'})}</div><div class="route-stats"><span>${icon('walk')}<strong>${state.session.demo?'30 sec demo':state.session.walkMinutes+' min'}</strong> return walk</span></div><p class="modal-copy">${escape(state.session.note||'No parking note added.')}<br><br>Illustrative walking route. Location tracking is not active in this browser demo.</p><button class="primary-button" data-action="close-modal">Back to my session${icon('arrow')}</button>`); render(); break;
    case 'edit-note': if(state.session) showModal(`${modalHeader('Remember your spot.')}<form id="note-form"><label class="form-label" for="parking-note">Parking note</label><input id="parking-note" name="note" maxlength="240" value="${escape(state.session.note)}" placeholder="Level, row, or a useful landmark"><button type="submit" class="primary-button">Save note${icon('check')}</button></form>`); break;
    case 'end': showModal(`${modalHeader('All done here?', 'End your current parking session.')}<p class="modal-copy">The saved session and in-app reminders will be cleared.</p><button class="primary-button" data-action="confirm-end">End session${icon('check')}</button><button class="secondary-button" data-action="close-modal">Keep my session</button>`); break;
    case 'confirm-end': state.session=null; lastPhase=null; state.reminderPreview=false; persist(); modal.close(); render(); toast('Session ended. Have a good rest of your day.'); break;
    case 'report': reportDialog(); break;
    case 'simulate-closure': { const existing=state.reports.find(r=>r.id==='seed-path'); if(existing) { existing.active=true; existing.createdAt=Date.now(); existing.expiresAt=Date.now()+3*60*MINUTE; } else state.reports.push({...INITIAL_REPORTS[0],active:true,createdAt:Date.now(),expiresAt:Date.now()+3*60*MINUTE}); persist(); render(); toast('Demo walkway closure added. North Parking walks now include a 3-minute detour.'); break; }
    case 'zoom-in': state.zoom=Math.min(1.8,state.zoom+.15); applyMapTransform(); break;
    case 'zoom-out': state.zoom=Math.max(.75,state.zoom-.15); applyMapTransform(); break;
    case 'recenter': state.zoom=1; state.mapPosition={x:0,y:0}; applyMapTransform(); break;
    case 'close-modal': modal.close(); break;
  }
});

document.addEventListener('change', event => {
  if(event.target.id==='duration-select') { state.durationMinutes=Number(event.target.value); persist(); render(); }
  if(event.target.id==='permit-select') { state.permit=event.target.value; persist(); render(); }
});
document.addEventListener('focusin', event => {
  if(event.target.id==='destination-search') { $('#destination-options').hidden=false; event.target.setAttribute('aria-expanded','true'); event.target.select(); }
});
document.addEventListener('input', event => {
  if(event.target.id==='destination-search') { $('#destination-options').innerHTML=destinationOptions(event.target.value); $('#destination-options').hidden=false; event.target.setAttribute('aria-expanded','true'); }
  if(event.target.id==='report-description') event.target.setCustomValidity('');
});
document.addEventListener('keydown', event => {
  const options = $('#destination-options');
  if (event.target.id === 'destination-search' && ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
    const choices = options ? [...options.querySelectorAll('button')] : [];
    if (choices.length) {
      event.preventDefault(); options.hidden = false;
      event.target.setAttribute('aria-expanded', 'true');
      if (event.key === 'Enter') choices[0].click();
      else choices[event.key === 'ArrowUp' ? choices.length - 1 : 0].focus();
    }
  } else if (event.target.matches('.destination-option') && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault();
    const choices = [...options.querySelectorAll('button')];
    const index = choices.indexOf(event.target);
    choices[(index + (event.key === 'ArrowDown' ? 1 : -1) + choices.length) % choices.length].focus();
  }
  const marker=event.target.closest('[data-select-area]');
  if(marker && ['Enter',' '].includes(event.key)) { event.preventDefault(); marker.dispatchEvent(new MouseEvent('click',{bubbles:true})); }
  if(event.key==='Escape' && options && !options.hidden) {
    event.preventDefault();
    $('#destination-search')?.focus(); closeDestinationOptions();
  }
});
function closeDestinationOptions() {
  const options = $('#destination-options');
  if (options) options.hidden = true;
  $('#destination-search')?.setAttribute('aria-expanded', 'false');
}
document.addEventListener('focusout', event => {
  if (event.target.closest('.search-wrap') && !event.relatedTarget?.closest('.search-wrap')) closeDestinationOptions();
});
document.addEventListener('submit', event => {
  const form=event.target;
  if(!['start-form','report-form','ask-form','note-form'].includes(form.id)) return;
  event.preventDefault();
  const data=new FormData(form);
  if(form.id==='start-form') {
    const durationMinutes=Number(data.get('duration'));
    if(evaluateParking(area(),{permit:state.permit,durationMinutes},state.reports).status!=='eligible') { toast('That plan no longer fits. Check the parking rules.'); return; }
    state.session=createSession({area:area(),destinationId:state.destinationId,durationMinutes,bufferMinutes:Number(data.get('buffer')),note:data.get('note'),reports:state.reports});
    state.tab='parking'; state.reminderPreview=false; lastPhase=sessionPhase(state.session); persist(); modal.close(); render(); toast('You’re parked. Your session is saved in this browser.');
  }
  if(form.id==='report-form') {
    const type=data.get('type'), areaId=data.get('area');
    const description=String(data.get('description')).trim().slice(0,500);
    if(!Object.hasOwn(REPORT_TYPES,type)||!AREAS.some(a=>a.id===areaId)) return;
    if(description.length<5) {
      const input = $('#report-description');
      input.setCustomValidity('Add at least 5 non-space characters describing the update.');
      input.reportValidity(); return;
    }
    state.reports.push({id:crypto.randomUUID(),areaId,type,title:REPORT_TYPES[type],description,extraWalkMinutes:type==='path'?3:0,createdAt:Date.now(),expiresAt:Date.now()+(type==='full'?15:180)*MINUTE,status:'Community report · Unverified',simulated:true,active:true});
    persist(); modal.close(); render(); toast('Update shared in this browser demo. Suggestions have been refreshed.');
  }
  if(form.id==='ask-form') {
    const question=String(data.get('question')).trim().slice(0,300); if(!question) return;
    state.messages.push({role:'user',text:question},{role:'assistant',text:answerQuestion(question)}); render(); $('#question-input')?.focus();
  }
  if(form.id==='note-form' && state.session) { state.session.note=String(data.get('note')).trim().slice(0,240); persist(); modal.close(); render(); toast('Parking note saved.'); }
});
modal.addEventListener('click', event => { if(event.target===modal && (event.offsetX<0 || event.offsetX>modal.offsetWidth || event.offsetY<0 || event.offsetY>modal.offsetHeight)) modal.close(); });

function applyMapTransform() { const world=$('#map-world'); if(world) world.style.transform=`translate(${state.mapPosition.x}px,${state.mapPosition.y}px) scale(${state.zoom})`; }
let drag=null;
document.addEventListener('pointerdown', event => {
  if(!event.target.closest('#map-canvas') || event.target.closest('[data-select-area]')) return;
  drag={x:event.clientX,y:event.clientY,origin:{...state.mapPosition}};
});
document.addEventListener('pointermove', event => {
  if(!drag) return;
  state.mapPosition={x:Math.max(-300,Math.min(300,drag.origin.x+event.clientX-drag.x)),y:Math.max(-250,Math.min(250,drag.origin.y+event.clientY-drag.y))}; applyMapTransform();
});
document.addEventListener('pointerup',()=>{drag=null;});
document.addEventListener('pointercancel',()=>{drag=null;});
window.addEventListener('storage', event => {
  if(event.key!==KEY && event.key!==null) return;
  const other=readSaved();
  state.session=validStoredSession(other.session)?other.session:null;
  state.reports=Array.isArray(other.reports)?normalizeReports(other.reports,AREAS.map(a=>a.id),REPORT_TYPES):INITIAL_REPORTS.map(r=>({ ...r }));
  state.destinationId=DESTINATIONS.some(d=>d.id===other.destinationId)?other.destinationId:'library';
  state.permit=PERMITS.some(p=>p.id===other.permit)?other.permit:'commuter';
  state.durationMinutes=[60,90,120,180,240].includes(other.durationMinutes)?other.durationMinutes:90;
  state.favorites=Array.isArray(other.favorites)?other.favorites.filter(id=>AREAS.some(a=>a.id===id)):[];
  state.theme=other.theme==='dark'?'dark':'light';
  state.mode=other.mode==='demo'?'demo':'real';
  lastPhase=state.session?sessionPhase(state.session):null;
  render({ preserveDrafts: true });
});
document.addEventListener('campuscurb:walkthrough', () => { state.mode='demo'; state.tab='explore'; state.detail=false; persist(); render(); });
document.addEventListener('campuscurb:explore-real', () => { state.mode='real'; state.tab='explore'; persist(); render(); });
render();
setInterval(updateClock,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden) updateClock();});
