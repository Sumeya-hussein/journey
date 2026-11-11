import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export type TabId = 'today' | 'areas' | 'journal' | 'me';
const TABS: { id: TabId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'areas', label: 'Areas' },
  { id: 'journal', label: 'Journal' },
  { id: 'me', label: 'Me' },
];

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  const t = useTheme();
  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: t.colors.card, borderTopWidth: 1, borderTopColor: t.colors.line, paddingBottom: 12 }}>
      {TABS.map((tab) => {
        const on = tab.id === active;
        return (
          <TouchableOpacity
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={tab.label}
            onPress={() => onChange(tab.id)}
            style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: on ? t.colors.accent : t.colors.muted, fontWeight: on ? '700' : '400', fontSize: 13 }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
