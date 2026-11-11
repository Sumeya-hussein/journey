import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeId, themes } from './tokens';

type ThemeState = { themeId: ThemeId; setTheme: (id: ThemeId) => void };

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: 'midnightBarakah',
      setTheme: (themeId) => set({ themeId }),
    }),
    { name: 'journey-theme', storage: createJSONStorage(() => AsyncStorage) }
  )
);

export const useTheme = (): Theme => themes[useThemeStore((s) => s.themeId)];