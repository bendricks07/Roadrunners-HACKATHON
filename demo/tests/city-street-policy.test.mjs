import test from 'node:test';
import assert from 'node:assert/strict';
import { STREET_AREAS, PARKING_AREAS, parkingDisplay } from '../src/street-model.js';
import { CITY_DISTRICTS, streetPolicyEvidence, districtWindowOverlaps } from '../src/city-street-policy.js';
import { evaluateParking, bestParkingResult } from '../src/rules.js';
import { parseCampusDateInput } from '../src/map-model.js';
import { selectParkingReviews } from '../src/parking-reviews.js';
const area = id => STREET_AREAS.find(a=>a.sourceId===id);
const plan = (start='2026-11-16T09:00', end='2026-11-16T10:00', cityPermits=[], permit='commuter') => ({ arrivalAt: parseCampusDateInput(start), departureAt: parseCampusDateInput(end), cityPermits, permit });

test('all 42 street sections have unique block evidence without green vacancy claims',()=>{
  assert.equal(STREET_AREAS.length,42);
  for(const a of STREET_AREAS){
    assert.ok(a.cityPolicy);
    assert.match(a.blockLabel,/address range/);
    assert.equal(a.cityPolicy.boundaryVerified,false);
    const r=evaluateParking(a,plan());
    assert.equal(r.occupancy,'unknown');
    assert.notEqual(r.status,'eligible');
    const d=parkingDisplay(a,r);
    assert.notEqual(d.color,'#55df78');
    assert.equal(d.illustrative,false);
    assert.equal(parkingDisplay(a,r,false).color,d.color);
  }
  assert.equal(streetPolicyEvidence(-1),null);
});
test('Slack timed sections reject a three-hour trip but eastern permit sections do not inherit that maximum',()=>{
  const p=plan('2026-11-16T09:00','2026-11-16T12:00');
  for(const id of [3347,3379]){
    const r=evaluateParking(area(id),p);
    assert.equal(r.durationConflict,true);
    assert.equal(r.maxStayMinutes,120);
    assert.match(r.reason,/allowed parking time is 2 hours/);
  }
  assert.equal(area(3383).rules.maxStayMinutes,undefined);
  assert.equal(evaluateParking(area(3383),p).permitConflict,true);
  assert.equal(evaluateParking(area(3379),plan('2026-11-16T09:00','2026-11-16T11:00')).durationConflict,undefined);
});
test('Abbott is upgraded from a report to the exact City zone ID without claiming verified curbs',()=>{
  for(const id of [2173,2333]){
    assert.equal(area(id).cityPolicy.zoneId,38);
    assert.equal(area(id).rules.maxStayMinutes,600);
    assert.equal(area(id).rules.limitProvenance,'city-gis');
    assert.match(area(id).rules.limitScope,/signed portions/);
  }
});
test('campus permits never substitute for the matching City neighborhood permit',()=>{
  for(const permit of ['none','unknown','commuter','staff','visitor']){
    const r=evaluateParking(area(1401),plan(undefined,undefined,[],permit));
    assert.equal(r.permitConflict,true);
    assert.match(r.reason,/Murray.*8 AM-5 PM/);
    assert.match(r.reason,/Cal Poly permit does not substitute/);
  }
  assert.equal(evaluateParking(area(1401),plan(undefined,undefined,['monterey-heights'])).permitConflict,true);
  const matched=evaluateParking(area(1401),plan(undefined,undefined,['murray']));
  assert.equal(matched.permitConflict,undefined);
  assert.equal(matched.status,'unknown');
  assert.equal(matched.cityPermitMatched,true);
});
test('district hours check the entire stay and exact end boundary in campus time',()=>{
  assert.equal(evaluateParking(area(1401),plan('2026-11-16T17:00','2026-11-16T18:00')).permitConflict,undefined);
  assert.equal(evaluateParking(area(1401),plan('2026-11-16T16:59','2026-11-16T18:00')).permitConflict,true);
  assert.equal(evaluateParking(area(1401),plan('2026-11-15T09:00','2026-11-15T11:00')).permitConflict,undefined);
  assert.equal(evaluateParking(area(1401),plan('2026-11-15T23:00','2026-11-16T08:01')).permitConflict,true);
  assert.equal(districtWindowOverlaps(CITY_DISTRICTS[1],parseCampusDateInput('2026-11-16T01:00'),parseCampusDateInput('2026-11-16T02:00')),false);
});
test('Alta Vista variants require the same permit but retain their different enforcement windows',()=>{
  assert.equal(evaluateParking(area(1966),plan('2026-11-16T18:00','2026-11-16T19:00')).permitConflict,undefined);
  assert.equal(evaluateParking(area(1749),plan('2026-11-16T18:00','2026-11-16T19:00')).permitConflict,true);
  assert.equal(evaluateParking(area(1749),plan('2026-11-16T18:00','2026-11-16T19:00',['alta-vista'])).permitConflict,undefined);
});
test('a permit for one side of a mixed-district street gives a caution rather than requiring both district permits',()=>{
  const r=evaluateParking(area(2122),plan(undefined,undefined,['alta-vista']));
  assert.equal(r.permitConflict,undefined);
  assert.equal(r.mixedDistrictPermit,true);
  assert.equal(r.status,'unknown');
  assert.match(r.reason,/not Monterey Heights.*correct signed side/);
});
test('City ceiling is not a 72-hour parking recommendation and is not assigned to campus or mixed-side streets',()=>{
  assert.equal(area(1953).rules.maxStayMinutes,4320);
  assert.equal(area(1953).rules.limitIsCeiling,true);
  const r=evaluateParking(area(1953),plan());
  assert.equal(r.reviewCandidate,false);
  assert.match(r.reason,/shorter local limits/);
  assert.equal(evaluateParking(area(1953),plan('2026-11-16T09:00','2026-11-19T09:01')).durationConflict,true);
  for(const id of [815,2296,2326,3378,3383]) assert.notEqual(area(id).rules.limitIsCeiling,true);
});
test('review shortlist includes signed street options while removing overlong and missing-permit candidates',()=>{
  const p=plan('2026-11-16T09:00','2026-11-16T12:00',[],'none');
  const evaluate=a=>evaluateParking(a,p);
  const reviews=selectParkingReviews(PARKING_AREAS,evaluate,{kind:'street'});
  assert.ok(reviews.some(a=>a.gisName==='ABBOTT ST'));
  assert.ok(!reviews.some(a=>a.gisName==='SLACK ST'||a.gisName==='LOOMIS ST'));
  for(const a of reviews){assert.notEqual(evaluate(a).permitConflict,true);assert.notEqual(evaluate(a).durationConflict,true);}
  assert.equal(new Set(reviews.map(a=>a.name)).size,reviews.length);
  const r=bestParkingResult(area(1401),[plan(undefined,undefined,[],'commuter'),plan(undefined,undefined,[],'staff')]);
  assert.equal(r.permitConflict,true);
});
