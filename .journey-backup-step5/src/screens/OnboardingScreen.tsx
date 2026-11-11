import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAreasStore } from '../store/areas';
import { AREAS, composeIds, unlockHint } from '../constants/areas';
import { WIDGET_NAMES } from '../constants/widgets';

export default function OnboardingScreen() {
  const { colors: c } = useTheme();
  const selection = useAreasStore((s) => s.selection);
  const toggleArea = useAreasStore((s) => s.toggleArea);
  const completeOnboarding = useAreasStore((s) => s.completeOnboarding);
  const [composing, setComposing] = useState(false);
  const [shown, setShown] = useState(0);

  const count = Object.keys(selection).length;
  const ids = composeIds(selection);

  // Simple composing moment: the chosen widgets appear one by one, then the dashboard opens.
  useEffect(() => {
    if (!composing) return;
    if (shown < ids.length) {
      const id = setTimeout(() => setShown((n) => n + 1), 300);
      return () => clearTimeout(id);
    }
    const done = setTimeout(completeOnboarding, 700);
    return () => clearTimeout(done);
  }, [composing, shown, ids.length, completeOnboarding]);

  if (composing) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, paddingTop: 96, gap: 12 }}>
        <Text style={{ color: c.accent, fontSize: 28, fontWeight: '700' }}>Building your dashboard</Text>
        {ids.slice(0, shown).map((id) => (
          <View key={id} style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: c.text, fontSize: 16 }}>{WIDGET_NAMES[id]}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: 64, gap: 12 }}>
      <Text style={{ color: c.accent, fontSize: 30, fontWeight: '700' }}>What matters this season?</Text>
      <Text style={{ color: c.muted, fontSize: 14 }}>Pick your focus areas. Journey builds your dashboard from them.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {AREAS.map((a) => {
          const level = selection[a.id];
          const on = !!level;
          return (
            <TouchableOpacity
              key={a.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={a.name}
              onPress={() => toggleArea(a.id)}
              style={{ width: '48%', minHeight: 72, borderRadius: 16, padding: 14, borderWidth: 2, borderColor: on ? c.accent : c.line, backgroundColor: c.card, justifyContent: 'center', gap: 6 }}
            >
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '500' }}>{a.name}</Text>
              <Text style={{ color: on ? c.accent : c.muted, fontSize: 12 }}>{on ? (level === 'core' ? 'Core' : 'Light') : 'Tap to add'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: c.line, borderRadius: 16, padding: 14 }}>
        <Text style={{ color: c.muted, fontSize: 13 }}>{unlockHint(selection)}</Text>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Build my dashboard"
        onPress={() => setComposing(true)}
        style={{ minHeight: 52, borderRadius: 14, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
      >
        <Text style={{ color: c.onAccent, fontWeight: '700', fontSize: 16 }}>Build my dashboard ({count})</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
