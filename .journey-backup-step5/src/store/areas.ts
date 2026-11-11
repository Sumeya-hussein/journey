import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AREAS, AreaId, DEFAULT_SELECTION, Intensity, Selection, composeIds } from '../constants/areas';
import { useWidgetStore } from './widgets';

type AreasState = {
  selection: Selection;
  onboarded: boolean;
  toggleArea: (id: AreaId) => void;
  setIntensity: (id: AreaId, level: Intensity) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

const applyToDashboard = (selection: Selection) => useWidgetStore.getState().setWidgetIds(composeIds(selection));

export const useAreasStore = create<AreasState>()(
  persist(
    (set, get) => ({
      selection: DEFAULT_SELECTION,
      onboarded: false,
      toggleArea: (id) => {
        const next: Selection = { ...get().selection };
        if (next[id]) {
          if (Object.keys(next).length <= 1) return; // always keep at least one area
          delete next[id];
        } else {
          next[id] = AREAS.find((a) => a.id === id)!.defaultIntensity;
        }
        set({ selection: next });
        if (get().onboarded) applyToDashboard(next); // deselecting hides widgets, it never deletes data
      },
      setIntensity: (id, level) => {
        if (!get().selection[id]) return;
        const next = { ...get().selection, [id]: level };
        set({ selection: next });
        if (get().onboarded) applyToDashboard(next);
      },
      completeOnboarding: () => {
        applyToDashboard(get().selection);
        set({ onboarded: true });
      },
      resetOnboarding: () => set({ onboarded: false }),
    }),
    { name: 'journey-areas', storage: createJSONStorage(() => AsyncStorage) }
  )
);
