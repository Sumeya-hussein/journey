import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Intensity } from '../constants/areas';
import { useWidgetStore } from './widgets';

export type AreaItem = { id: string; text: string };
export type Area = { id: string; name: string; intensity: Intensity; active: boolean; items: AreaItem[] };

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

type AreasState = {
  areas: Area[]; // removed areas stay here (active: false), so their items are never lost
  done: Record<string, string[]>; // dateKey -> ids of items checked that day
  onboarded: boolean;
  addArea: (name: string, items: string[], intensity: Intensity) => string;
  setIntensity: (id: string, level: Intensity) => void;
  setActive: (id: string, active: boolean) => void;
  addItem: (areaId: string, text: string) => void;
  toggleItem: (dateKey: string, itemId: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useAreasStore = create<AreasState>()(
  persist(
    (set, get) => ({
      areas: [],
      done: {},
      onboarded: false,
      addArea: (name, items, intensity) => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        const id = uid();
        const area: Area = {
          id,
          name: trimmed,
          intensity,
          active: true,
          items: items.map((t) => t.trim()).filter(Boolean).map((text) => ({ id: uid(), text })),
        };
        set({ areas: [...get().areas, area] });
        useWidgetStore.getState().addWidget(`area:${id}`);
        return id;
      },
      setIntensity: (id, level) =>
        set({ areas: get().areas.map((a) => (a.id === id ? { ...a, intensity: level } : a)) }),
      setActive: (id, active) => {
        set({ areas: get().areas.map((a) => (a.id === id ? { ...a, active } : a)) });
        const w = useWidgetStore.getState();
        if (active) w.addWidget(`area:${id}`);
        else w.removeWidget(`area:${id}`);
      },
      addItem: (areaId, text) => {
        const t = text.trim();
        if (!t) return;
        set({ areas: get().areas.map((a) => (a.id === areaId ? { ...a, items: [...a.items, { id: uid(), text: t }] } : a)) });
      },
      toggleItem: (dateKey, itemId) => {
        const today = get().done[dateKey] ?? [];
        const next = today.includes(itemId) ? today.filter((i) => i !== itemId) : [...today, itemId];
        set({ done: { ...get().done, [dateKey]: next } });
      },
      completeOnboarding: () => set({ onboarded: true }),
      resetOnboarding: () => set({ onboarded: false }),
    }),
    { name: 'journey-areas-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
);
