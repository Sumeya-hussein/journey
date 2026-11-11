import React, { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAreasStore } from '../store/areas';
import { FIXED_NAMES } from '../constants/widgets';
import { TEMPLATES } from '../constants/areas';
import AddAreaScreen from './AddAreaScreen';

export default function OnboardingScreen() {
  const { colors: c } = useTheme();
  const areas = useAreasStore((s) => s.areas);
  const addArea = useAreasStore((s) => s.addArea);
  const setActive = useAreasStore((s) => s.setActive);
  const completeOnboarding = useAreasStore((s) => s.completeOnboarding);

  const [picked, setPicked] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [composing, setComposing] = useState(false);
  const [shown, setShown] = useState(0);

  const existing = areas.filter((a) => a.active);
  const existingNames = existing.map((a) => a.name);
  const total = existing.length + picked.filter((n) => !existingNames.includes(n)).length;
  const lineup = [...Object.values(FIXED_NAMES), ...existingNames, ...picked.filter((n) => !existingNames.includes(n))];

  // Simple composing moment: the chosen parts appear one by one, then Today opens.
  useEffect(() => {
    if (!composing) return;
    if (shown < lineup.length) {
      const id = setTimeout(() => setShown((n) => n + 1), 300);
      return () => clearTimeout(id);
    }
    const done = setTimeout(completeOnboarding, 700);
    return () => clearTimeout(done);
  }, [composing, shown, lineup.length, completeOnboarding]);

  const build = () => {
    for (const name of picked) {
      if (existingNames.includes(name)) continue;
      const t = TEMPLATES.find((x) => x.name === name);
      if (t) addArea(t.name, t.items, t.intensity);
    }
    // Areas removed earlier and picked again come back with their items.
    for (const a of areas) if (!a.active && picked.includes(a.name)) setActive(a.id, true);
    setComposing(true);
  };

  if (adding) return <AddAreaScreen onClose={() => setAdding(false)} />;

  if (composing) {
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, padding: 24, paddingTop: 96, gap: 12 }}>
        <Text style={{ color: c.accent, fontSize: 28, fontWeight: '700' }}>Building your Today</Text>
        {lineup.slice(0, shown).map((n) => (
          <View key={n} style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 14, padding: 14 }}>
            <Text style={{ color: c.text, fontSize: 16 }}>{n}</Text>
          </View>
        ))}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: 64, gap: 12 }}>
      <Text style={{ color: c.accent, fontSize: 30, fontWeight: '700' }}>What matters this season?</Text>
      <Text style={{ color: c.muted, fontSize: 14 }}>Pick what you want on your Today. Prayer times and your daily niyyah are always there.</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {TEMPLATES.map((t) => {
          const added = existingNames.includes(t.name);
          const on = added || picked.includes(t.name);
          return (
            <TouchableOpacity
              key={t.name}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on, disabled: added }}
              accessibilityLabel={t.name}
              disabled={added}
              onPress={() => setPicked(on ? picked.filter((n) => n !== t.name) : [...picked, t.name])}
              style={{ width: '48%', minHeight: 72, borderRadius: 16, padding: 14, borderWidth: 2, borderColor: on ? c.accent : c.line, backgroundColor: c.card, justifyContent: 'center', gap: 6 }}
            >
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '500' }}>{t.name}</Text>
              <Text style={{ color: on ? c.accent : c.muted, fontSize: 12 }}>{added ? 'Added' : on ? 'Selected' : 'Tap to add'}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {existing.filter((a) => !TEMPLATES.some((t) => t.name === a.name)).map((a) => (
        <View key={a.id} style={{ borderWidth: 2, borderColor: c.accent, borderRadius: 16, padding: 14, backgroundColor: c.card }}>
          <Text style={{ color: c.text, fontSize: 15 }}>{a.name}</Text>
          <Text style={{ color: c.accent, fontSize: 12 }}>Your own area</Text>
        </View>
      ))}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add your own area" onPress={() => setAdding(true)} style={{ minHeight: 52, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.accent, fontWeight: '700' }}>+ Add your own area</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Build my Today" accessibilityState={{ disabled: total === 0 }} disabled={total === 0} onPress={build} style={{ minHeight: 52, borderRadius: 14, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginTop: 8, opacity: total === 0 ? 0.4 : 1 }}>
        <Text style={{ color: c.onAccent, fontWeight: '700', fontSize: 16 }}>Build my Today ({total})</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
