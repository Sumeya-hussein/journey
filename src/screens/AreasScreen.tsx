import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAreasStore } from '../store/areas';
import { Intensity, TEMPLATES } from '../constants/areas';
import AddAreaScreen from './AddAreaScreen';

function Segment({ value, onChange, label }: { value: Intensity; onChange: (v: Intensity) => void; label: string }) {
  const { colors: c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: c.line, borderRadius: 12, overflow: 'hidden' }}>
      {(['core', 'light'] as Intensity[]).map((v) => {
        const on = v === value;
        return (
          <TouchableOpacity key={v} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${label} ${v}`} onPress={() => onChange(v)} style={{ minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.bg }}>
            <Text style={{ color: on ? c.onAccent : c.accent, fontWeight: '700', fontSize: 12 }}>{v === 'core' ? 'Core' : 'Light'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AreasScreen() {
  const { colors: c } = useTheme();
  const areas = useAreasStore((s) => s.areas);
  const addArea = useAreasStore((s) => s.addArea);
  const setActive = useAreasStore((s) => s.setActive);
  const setIntensity = useAreasStore((s) => s.setIntensity);
  const resetOnboarding = useAreasStore((s) => s.resetOnboarding);
  const [adding, setAdding] = useState(false);

  if (adding) return <AddAreaScreen onClose={() => setAdding(false)} />;

  const suggestions = TEMPLATES.filter((t) => !areas.some((a) => a.name === t.name));
  const btn = { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', borderWidth: 1, borderColor: c.accent } as const;

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <View>
        <Text style={{ color: c.accent, fontSize: 30, fontWeight: '700' }}>Your areas</Text>
        <Text style={{ color: c.muted, fontSize: 14, marginTop: 4 }}>Choose what shows on Today and how much room it gets.</Text>
      </View>
      {areas.length === 0 && <Text style={{ color: c.muted, fontSize: 14 }}>No areas yet. Add one below.</Text>}
      {areas.map((a) => (
        <View key={a.id} style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
          <View>
            <Text style={{ color: a.active ? c.text : c.muted, fontSize: 16 }}>{a.name}</Text>
            <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>
              {a.items.length} {a.items.length === 1 ? 'item' : 'items'}{a.active ? '' : ' · hidden, your items are kept'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {a.active ? <Segment value={a.intensity} onChange={(v) => setIntensity(a.id, v)} label={a.name} /> : <View />}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${a.active ? 'Remove' : 'Restore'} ${a.name}`} onPress={() => setActive(a.id, !a.active)} style={[btn, !a.active && { backgroundColor: c.accent }]}>
              <Text style={{ color: a.active ? c.accent : c.onAccent, fontWeight: '700' }}>{a.active ? 'Remove' : 'Restore'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {suggestions.length > 0 && (
        <View style={{ borderWidth: 1, borderStyle: 'dashed', borderColor: c.line, borderRadius: 16, padding: 14, gap: 8 }}>
          <Text style={{ color: c.muted, fontSize: 12 }}>Suggestions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {suggestions.map((t) => (
              <TouchableOpacity key={t.name} accessibilityRole="button" accessibilityLabel={`Add ${t.name}`} onPress={() => addArea(t.name, t.items, t.intensity)} style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: c.line, justifyContent: 'center' }}>
                <Text style={{ color: c.text, fontSize: 13 }}>+ {t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add your own area" onPress={() => setAdding(true)} style={{ minHeight: 52, borderRadius: 14, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.onAccent, fontWeight: '700' }}>Add your own area</Text>
      </TouchableOpacity>
      <Text style={{ color: c.muted, fontSize: 13 }}>Removing an area hides it from Today and keeps your items.</Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Redo setup" onPress={resetOnboarding} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text style={{ color: c.accent, fontWeight: '700' }}>Redo setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
