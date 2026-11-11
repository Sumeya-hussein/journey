import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fixed widgets are part of the app. Every other widget is a user-owned area: id 'area:<areaId>'.
export type FixedWidget = 'nextPrayer' | 'niyyah' | 'dayProgress';
export type WidgetId = FixedWidget | `area:${string}`;
export type Widget = { id: WidgetId; order: number; visible: boolean };

const FIXED: FixedWidget[] = ['nextPrayer', 'niyyah', 'dayProgress'];
const isValid = (id: string) => (FIXED as string[]).includes(id) || id.startsWith('area:');
const defaults: Widget[] = FIXED.map((id, order) => ({ id, order, visible: true }));
const renumber = (list: Widget[]): Widget[] => list.map((w, order) => ({ ...w, order }));

type WidgetState = {
  widgets: Widget[];
  prayerPinned: boolean; // pinned: prayer stays first and cannot be hidden
  move: (id: WidgetId, toIndex: number) => void;
  hide: (id: WidgetId) => void;
  show: (id: WidgetId) => void;
  setPrayerPinned: (pinned: boolean) => void;
  addWidget: (id: WidgetId) => void; // adds at the end, or restores if it already exists
  removeWidget: (id: WidgetId) => void;
};

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      widgets: defaults,
      prayerPinned: true,
      move: (id, toIndex) => {
        const list = [...get().widgets].sort((a, b) => a.order - b.order);
        const from = list.findIndex((w) => w.id === id);
        if (from < 0) return;
        const [item] = list.splice(from, 1);
        list.splice(Math.max(0, Math.min(toIndex, list.length)), 0, item);
        set({ widgets: renumber(list) });
      },
      hide: (id) => {
        if (id === 'nextPrayer' && get().prayerPinned) return;
        set({ widgets: get().widgets.map((w) => (w.id === id ? { ...w, visible: false } : w)) });
      },
      show: (id) =>
        set({ widgets: get().widgets.map((w) => (w.id === id ? { ...w, visible: true } : w)) }),
      setPrayerPinned: (prayerPinned) => set({ prayerPinned }),
      addWidget: (id) => {
        const list = get().widgets;
        if (list.some((w) => w.id === id)) {
          set({ widgets: list.map((w) => (w.id === id ? { ...w, visible: true } : w)) });
        } else {
          set({ widgets: renumber([...list].sort((a, b) => a.order - b.order).concat({ id, order: 0, visible: true })) });
        }
      },
      removeWidget: (id) => set({ widgets: renumber(get().widgets.filter((w) => w.id !== id)) }),
    }),
    {
      name: 'journey-widgets',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      // Older layouts had built-in widgets (study, health, ...). Keep only the fixed ones and user areas.
      migrate: (persisted) => {
        const p = persisted as { widgets?: Widget[]; prayerPinned?: boolean };
        const kept = (p.widgets ?? []).filter((w) => isValid(w.id));
        return { ...p, widgets: renumber(kept.length ? kept : defaults) } as unknown as WidgetState;
      },
    }
  )
);

// Pure helpers. Call these inside useMemo so selectors stay stable.
export function visibleWidgets(widgets: Widget[], prayerPinned: boolean): Widget[] {
  const sorted = [...widgets].sort((a, b) => a.order - b.order);
  const shown = sorted.filter((w) => w.visible || (prayerPinned && w.id === 'nextPrayer'));
  if (!prayerPinned) return shown;
  return [...shown.filter((w) => w.id === 'nextPrayer'), ...shown.filter((w) => w.id !== 'nextPrayer')];
}

export const hiddenWidgets = (widgets: Widget[]): Widget[] => widgets.filter((w) => !w.visible);
