import test from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, DESTINATIONS, permitPolicyId } from '../src/data.js';
import { evaluateParking, calculateDeadline, createSession, headBackAt, sessionPhase, getWalkMinutes, isValidSession, parseSavedState, normalizeReports, MINUTE } from '../src/rules.js';
import { REPORT_TYPES } from '../src/data.js';

const now = Date.parse('2026-11-14T20:36:00Z');
test('unknown permit is never a confident recommendation', () => {
  assert.equal(evaluateParking(AREAS[0], { permit: 'unknown', durationMinutes: 90 }, [], now).status, 'unknown');
});

test('student permit products retain their specific rule identifier', () => {
  assert.equal(permitPolicyId('commuter'), 'commuter');
  assert.equal(permitPolicyId('r3'), 'r3');
  assert.equal(permitPolicyId('resident-r4'), 'resident-r4');
});
test('a stay crossing the time limit is excluded; an exact limit fits', () => {
  assert.equal(evaluateParking(AREAS[1], { permit: 'commuter', durationMinutes: 121 }, [], now).status, 'ineligible');
  assert.equal(evaluateParking(AREAS[1], { permit: 'commuter', durationMinutes: 120 }, [], now).status, 'eligible');
});
test('active entrance closure excludes a lot, expired report does not', () => {
  const report = { areaId: 'north', type: 'closure', expiresAt: now + MINUTE };
  assert.equal(evaluateParking(AREAS[0], { permit: 'commuter', durationMinutes: 90 }, [report], now).status, 'ineligible');
  assert.equal(evaluateParking(AREAS[0], { permit: 'commuter', durationMinutes: 90 }, [report], now + MINUTE).status, 'eligible');
});
test('deadline follows the earliest applicable restriction, not just payment', () => {
  assert.deepEqual(calculateDeadline({ startedAt: now, paidThrough: now + 120 * MINUTE, maxStayMinutes: 240, restrictionAt: now + 45 * MINUTE, permitExpiresAt: now + 90 * MINUTE }), { label: 'Restriction change', at: now + 45 * MINUTE });
});
test('2 PM deadline with 12-minute walk and 5-minute buffer yields 1:43 PM', () => {
  const deadline = Date.parse('2026-11-14T22:00:00Z');
  assert.equal(headBackAt(deadline, 12, 5), Date.parse('2026-11-14T21:43:00Z'));
});
test('session uses absolute times and progresses correctly after reload', () => {
  const session = JSON.parse(JSON.stringify(createSession({ area: AREAS[0], destinationId: 'library', durationMinutes: 90, now })));
  assert.equal(sessionPhase(session, now), 'active');
  assert.equal(sessionPhase(session, session.deadlineAt - 13 * MINUTE), 'head-back');
  assert.equal(sessionPhase(session, session.deadlineAt), 'expired');
  assert.equal(isValidSession(session, AREAS.map(a => a.id), DESTINATIONS.map(d => d.id)), true);
});
test('walkway reports add return time only while active', () => {
  const report = { areaId: 'north', type: 'path', extraWalkMinutes: 3, expiresAt: now + MINUTE };
  assert.equal(getWalkMinutes(AREAS[0], 'library', [report], now), 11);
  assert.equal(getWalkMinutes(AREAS[0], 'library', [report], now + MINUTE), 8);
});
test('corrupt persisted sessions are rejected rather than rendered as valid', () => {
  assert.equal(isValidSession({ areaId: 'north', deadlineAt: 'bad' }, ['north'], ['library']), false);
});

test('saved-state parsing tolerates broken JSON and non-object payloads', () => {
  for (const raw of ['{broken', 'null', '42', 'true', '"text"', '[]', null]) {
    assert.deepEqual(parseSavedState(raw), {});
  }
  assert.deepEqual(parseSavedState('{"theme":"dark"}'), { theme: 'dark' });
});

const report = { id: 'path-test', areaId: 'north', type: 'path', createdAt: now, expiresAt: now + MINUTE, description: 'Walkway closed', extraWalkMinutes: 3 };
const cleanReports = rows => normalizeReports(rows, AREAS.map(a => a.id), REPORT_TYPES);

test('malformed reports cannot crash restoration or impersonate a valid type', () => {
  const malformed = [null, 7, {}, { ...report, id: null }, { ...report, areaId: 'missing' }, { ...report, type: 'constructor' }, { ...report, createdAt: 'bad' }, { ...report, expiresAt: now }, { ...report, description: null }];
  assert.deepEqual(cleanReports(malformed), []);
});

test('duplicate persisted reports do not double the return walk', () => {
  const normalized = cleanReports([report, { ...report }]);
  assert.equal(normalized.length, 1);
  assert.equal(getWalkMinutes(AREAS[0], 'library', normalized, now), 11);
});

test('restored reports retain local unverified provenance and controlled content', () => {
  const [normalized] = cleanReports([{ ...report, title: 'Official approval', status: 'Verified', simulated: false, description: 'x'.repeat(600), extraWalkMinutes: -4 }]);
  assert.equal(normalized.title, REPORT_TYPES.path);
  assert.equal(normalized.status, 'Community report · Unverified');
  assert.equal(normalized.simulated, true);
  assert.equal(normalized.description.length, 500);
  assert.equal(normalized.extraWalkMinutes, 3);
});

test('resolved reports remain resolved after restoration and expiry removes detours', () => {
  const normalized = cleanReports([{ ...report, active: false }]);
  assert.equal(getWalkMinutes(AREAS[0], 'library', normalized, now), 8);
  assert.equal(getWalkMinutes(AREAS[0], 'library', cleanReports([report]), now + MINUTE), 8);
});
