// A shortlist to inspect, never a guarantee of legal parking or empty spaces.
export function selectParkingReviews(areas, evaluate, { kind = 'all', nearby = [], priority = 'closest' } = {}) {
  const candidates = areas.filter(a => {
    const r = evaluate(a);
    return a.dataset === 'campus-research' && (kind === 'all' || a.kind === kind) && !a.rules.closed && r.status !== 'ineligible' && !r.permitConflict && !r.durationConflict && (a.kind !== 'street' || r.reviewCandidate);
  });
  const score = a => {
    const rank = nearby.indexOf(a.id);
    const demoPreference = priority === 'chance' && a.kind !== 'street' ? ({ good: 0, limited: 1, low: 2 }[a.demoChance] ?? 3) : 0;
    return (rank < 0 ? 20 : rank) + (priority === 'garage' && a.kind !== 'garage' ? 5 : 0) + demoPreference;
  };
  const seen = new Set();
  return candidates.sort((a,b)=>score(a)-score(b)).filter(a=> {
    const key = a.kind === 'street' ? a.name : a.id;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0,3);
}
