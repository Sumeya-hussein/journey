import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OneThing = { dateKey: string; text: string; done: boolean };

type DayState = {
  lightDayKey: string | null; // the date Light day was switched on; it switches itself off the next day
  oneThing: OneThing | null;
  startKey: string | null; // first day of the 75-day journey
  continuing: boolean; // after day 75: keep counting without a cycle
  setLightDay: (on: boolean, dateKey: string) => void;
  setOneThing: (dateKey: string, text: string) => void;
  toggleOneThing: (dateKey: string) => void;
  startCycle: (dateKey: string) => void;
  keepGoing: () => void;
};

export const useDayStore = create<DayState>()(
  persist(
    (set, get) => ({
      lightDayKey: null,
      oneThing: null,
      startKey: null,
      continuing: false,
      setLightDay: (on, dateKey) => set({ lightDayKey: on ? dateKey : null }),
      setOneThing: (dateKey, text) => {
        const t = text.trim();
        set({ oneThing: t ? { dateKey, text: t, done: false } : null });
      },
      toggleOneThing: (dateKey) => {
        const o = get().oneThing;
        if (o && o.dateKey === dateKey) set({ oneThing: { ...o, done: !o.done } });
      },
      startCycle: (dateKey) => set({ startKey: dateKey, continuing: false }),
      keepGoing: () => set({ continuing: true }),
    }),
    { name: 'journey-day', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// Day number counting the start day as day 1. Uses local dates, so it follows the device's midnight.
export function dayNumber(startKey: string, todayKey: string): number {
  const toDate = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d, 12).getTime();
  };
  return Math.round((toDate(todayKey) - toDate(startKey)) / 86400000) + 1;
}
