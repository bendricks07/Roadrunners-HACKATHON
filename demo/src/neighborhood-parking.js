// Published enforcement windows for signed City of San Luis Obispo districts.
// Use the City's maps to check boundaries and the signs for each side of a block.
export const RESIDENTIAL_DISTRICTS = [
  { name: 'Alta Vista', hours: 'Mon–Fri, 2 AM–5 PM or 2 AM–10 PM, depending on the block', map: 'https://www.slocity.org/home/showpublisheddocument/3620/637885532583170000' },
  { name: 'Monterey Heights', hours: 'Mon–Fri, 2 AM–10 PM', map: 'https://www.slocity.org/home/showpublisheddocument/26360/637340576865800000' },
  { name: 'Murray', hours: 'Mon–Fri, 8 AM–5 PM' },
  { name: 'College Highlands', hours: 'Daily, 10 PM–10 AM' },
  { name: 'Ferrini', hours: 'Daily, midnight–5 PM' },
  { name: 'Park View', hours: 'Daily, midnight–7 AM' },
  { name: 'Anholm', hours: 'Daily, 8 AM–2 AM' },
  { name: 'Dana Street', hours: 'Daily, 8 AM–2 AM' },
  { name: 'Mission Orchard', hours: 'Mon–Fri, 6 AM–6 PM' },
  { name: 'Palomar', hours: 'Daily, 10 PM–6 AM' },
  { name: 'Tassajara / South Tassajara', hours: 'Daily, 10 PM–6 AM or 24 hours, depending on the block' },
];

const TIMED_REPORT = 'https://www.slocity.org/home/showpublisheddocument/19537/636607024839670000';
export const STREET_GUIDANCE = {
  'HATHWAY AVE': { districts: ['Alta Vista'] },
  'FREDERICKS ST': { districts: ['Alta Vista', 'Monterey Heights'] },
  'MURRAY AVE': { districts: ['Murray'] },
  'GRAND AVE': { districts: ['Alta Vista', 'Monterey Heights'] },
  'CALIFORNIA BLVD': { districts: ['Alta Vista'] },
  'FOOTHILL BLVD': { districts: ['Alta Vista'] },
  'LOOMIS ST': {
    districts: ['Monterey Heights'],
    timed: 'A City report records a 2-hour zone east of Grand Avenue. Confirm the exact curb, hours, and current sign.',
    timedSource: TIMED_REPORT,
  },
  'SLACK ST': {
    districts: ['Alta Vista', 'Monterey Heights'],
    timed: 'A City report records a 2-hour zone near campus. Confirm the exact curb, hours, and current sign.',
    timedSource: 'https://www.slocity.org/home/showpublisheddocument/10171/635907136060370000',
  },
};
