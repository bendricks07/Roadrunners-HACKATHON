import test from 'node:test';
import assert from 'node:assert/strict';
import { AREAS, DESTINATIONS } from '../src/data.js';
import { evaluateParking, calculateDeadline, createSession, headBackAt, sessionPhase, getWalkMinutes, isValidSession, MINUTE } from '../src/rules.js';

const now = Date.parse('2026-11-14T20:36:00Z');
test('unknown permit is never a confident recommendation', () => {
  assert.equal(evaluateParking(AREAS[0], { permit: 'unknown', durationMinutes: 90 }, [], now).status, 'unknown');
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
