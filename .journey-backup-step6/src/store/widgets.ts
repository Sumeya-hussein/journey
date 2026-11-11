import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type WidgetType =
  | 'nextPrayer'
  | 'niyyah'
  | 'dayProgress'
  | 'studyRotation'
  | 'health'
  | 'habits'
  | 'content'
  | 'finance'
  | 'family';

export type Widget = { id: WidgetType; order: number; visible: boolean };

// Hardcoded for now. Later, onboarding composes this from the chosen focus areas.
const defaults: Widget[] = (
  ['nextPrayer', 'niyyah', 'dayProgress', 'studyRotation', 'health', 'habits'] as WidgetType[]
).map((id, order) => ({ id, order, visible: true }));

type WidgetState = {
  widgets: Widget[];
  prayerPinned: boolean; // pinned: prayer stays first and cannot be hidden
  move: (id: WidgetType, toIndex: number) => void;
  hide: (id: WidgetType) => void;
  show: (id: WidgetType) => void;
  setPrayerPinned: (pinned: boolean) => void;
  setWidgetIds: (ids: WidgetType[]) => void; // used by Areas: keeps order and visibility of widgets that stay
};

const MAX_VISIBLE = 7; // newly added widgets beyond this start in the Hidden tray

const renumber = (list: Widget[]): Widget[] => list.map((w, order) => ({ ...w, order }));

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
      setWidgetIds: (ids) => {
        const existing = [...get().widgets].sort((a, b) => a.order - b.order);
        const keep = existing.filter((w) => ids.includes(w.id));
        const keepIds = new Set(keep.map((w) => w.id));
        let shown = keep.filter((w) => w.visible).length;
        const added: Widget[] = ids
          .filter((id) => !keepIds.has(id))
          .map((id) => {
            const visible = shown < MAX_VISIBLE;
            if (visible) shown += 1;
            return { id, order: 0, visible };
          });
        set({ widgets: renumber([...keep, ...added]) });
      },
    }),
    { name: 'journey-widgets', storage: createJSONStorage(() => AsyncStorage) }
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
