import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Local date as YYYY-MM-DD (device time zone, not UTC).
export const todayKey = (d: Date = new Date()): string => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

type NiyyahState = {
  entries: Record<string, string>; // dateKey -> intention. Old days are kept for the Journal screen.
  setNiyyah: (dateKey: string, text: string) => void;
};

export const useNiyyahStore = create<NiyyahState>()(
  persist(
    (set, get) => ({
      entries: {},
      setNiyyah: (dateKey, text) => {
        const trimmed = text.trim();
        const next = { ...get().entries };
        if (trimmed) next[dateKey] = trimmed;
        else delete next[dateKey];
        set({ entries: next });
      },
    }),
    { name: 'journey-niyyah', storage: createJSONStorage(() => AsyncStorage) }
  )
);
