// Theme tokens. Adding a theme = adding one entry here.
// Hex values are placeholders until you share your final palettes.
export type ThemeId = 'midnightBarakah' | 'radiantHarmony';

export type Theme = {
  name: string;
  dark: boolean;
  colors: {
    bg: string;
    card: string;
    line: string;
    text: string;
    muted: string;
    accent: string;
    onAccent: string;
  };
};

export const themes: Record<ThemeId, Theme> = {
  midnightBarakah: {
    name: 'Midnight Barakah',
    dark: true,
    colors: {
      bg: '#0F1B2D',
      card: '#172640',
      line: '#27395A',
      text: '#F4EEE1',
      muted: '#A9B4C6',
      accent: '#E2BD78',
      onAccent: '#0F1B2D',
    },
  },
  radiantHarmony: {
    name: 'Radiant Harmony',
    dark: false,
    colors: {
      bg: '#FBF4E8',
      card: '#FFFFFF',
      line: '#E6D9C3',
      text: '#2B2233',
      muted: '#6B6275',
      accent: '#7A4A8E',
      onAccent: '#FFFFFF',
    },
  },
};