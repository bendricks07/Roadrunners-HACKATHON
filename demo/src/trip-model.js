import { parseCampusDateInput } from './map-model.js';

export function validateTrip(arrival, departure) {
  const arrivalAt = parseCampusDateInput(arrival), departureAt = parseCampusDateInput(departure);
  if (!Number.isFinite(arrivalAt) || !Number.isFinite(departureAt)) return 'Enter valid arrival and departure dates in Los Angeles time. Ambiguous or skipped daylight-saving times are not supported.';
  if (departureAt <= arrivalAt) return 'Leave time must be after arrival time.';
  return '';
}
