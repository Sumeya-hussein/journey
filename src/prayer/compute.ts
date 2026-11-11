import { CalculationMethod, Coordinates, HighLatitudeRule, PrayerTimes } from 'adhan';

export type Place = { lat: number; lon: number };
export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export const PRAYER_KEYS: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

// Calculation method picked by region. This is a first pass: North America uses ISNA,
// everywhere else uses Muslim World League. A method picker in Me will override it.
function paramsFor(place: Place) {
  const coords = new Coordinates(place.lat, place.lon);
  const inNorthAmerica = place.lat > 15 && place.lat < 72 && place.lon > -170 && place.lon < -50;
  const params = inNorthAmerica ? CalculationMethod.NorthAmerica() : CalculationMethod.MuslimWorldLeague();
  // Far-north places like Edmonton need this in summer, when twilight never fully ends.
  params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  return { coords, params };
}

export function daySchedule(place: Place, date: Date): Record<PrayerKey, Date> {
  const { coords, params } = paramsFor(place);
  const t = new PrayerTimes(coords, date, params);
  return { fajr: t.fajr, dhuhr: t.dhuhr, asr: t.asr, maghrib: t.maghrib, isha: t.isha };
}

export type NextPrayer = { key: PrayerKey; time: Date; isTomorrow: boolean };

export function nextPrayer(place: Place, now: Date): NextPrayer {
  const today = daySchedule(place, now);
  for (const key of PRAYER_KEYS) {
    if (today[key].getTime() > now.getTime()) return { key, time: today[key], isTomorrow: false };
  }
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return { key: 'fajr', time: daySchedule(place, tomorrow).fajr, isTomorrow: true };
}

export function formatCountdown(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0 && m === 0) return 'less than 1 min';
  return h === 0 ? `${m} min` : `${h} h ${m} min`;
}