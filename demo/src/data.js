// All rules, availability observations, paths and map positions below are simulated.
// Real destinations are included for context; these fixtures are not parking advice.
export const DATA_NOTICE = 'Illustrative parking rules and map. Check official information and posted signs before parking.';
export const DESTINATIONS = [
  { id: 'library', name: 'Kennedy Library', subtitle: 'Study, meet, get things done', x: 690, y: 425, query: 'Robert E. Kennedy Library Cal Poly San Luis Obispo' },
  { id: 'union', name: 'University Union', subtitle: 'The heart of campus', x: 808, y: 639, query: 'University Union Cal Poly San Luis Obispo' },
  { id: 'rec', name: 'Recreation Center', subtitle: 'A little room to recharge', x: 598, y: 755, query: 'Recreation Center Cal Poly San Luis Obispo' },
  { id: 'pac', name: 'Performing Arts Center', subtitle: 'Find your way to the show', x: 950, y: 675, query: 'Performing Arts Center San Luis Obispo' },
];
export const AREAS = [
  { id: 'north', name: 'North Parking', detail: 'North campus · Outdoor lot', label: 'NORTH PARKING', x: 459, y: 279, capacity: 'Unknown', drive: 4, walk: { library: 8, union: 12, rec: 15, pac: 16 }, permits: ['commuter', 'staff'], maxStayMinutes: 240, price: 0, tags: ['Commuter permit', 'Easy campus access'], source: 'Demo fixture', photo: 'north' },
  { id: 'west', name: 'Library West', detail: 'West campus · Outdoor lot', label: 'LIBRARY WEST', x: 417, y: 504, capacity: 'Unknown', drive: 5, walk: { library: 5, union: 11, rec: 10, pac: 15 }, permits: ['commuter', 'staff', 'visitor'], maxStayMinutes: 120, price: 4, tags: ['Visitor parking', 'Close to the library'], source: 'Demo fixture', photo: 'west' },
  { id: 'grand', name: 'Grand Avenue', detail: 'East campus · Parking structure', label: 'GRAND AVENUE', x: 1009, y: 780, capacity: 'Unknown', drive: 6, walk: { library: 12, union: 6, rec: 10, pac: 4 }, permits: ['commuter', 'staff', 'visitor'], maxStayMinutes: 480, price: 6, tags: ['Covered parking', 'Good for a longer stay'], source: 'Demo fixture', photo: 'grand' },
];
export const PERMITS = [
  { id: 'commuter', label: 'Commuter permit' },
  { id: 'visitor', label: 'Visitor · no permit' },
  { id: 'staff', label: 'Staff permit' },
  { id: 'unknown', label: 'Not sure yet' },
];
export const INITIAL_REPORTS = [
  { id: 'seed-path', areaId: 'north', type: 'path', title: 'East walkway maintenance', description: 'A section of the east walkway is closed in this demonstration. Allow an extra 3 minutes on the return walk.', extraWalkMinutes: 3, createdAt: Date.now() - 18 * 60_000, expiresAt: Date.now() + 6 * 60 * 60_000, status: 'Community report · Unverified', simulated: true, active: false },
];
export const REPORT_TYPES = { full: 'Lot reported full', closure: 'Entrance closed', path: 'Walkway closed', payment: 'Payment issue', other: 'Other update' };
