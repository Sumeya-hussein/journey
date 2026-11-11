import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAreasStore } from '../store/areas';
import { AREAS, Intensity } from '../constants/areas';
import { WIDGET_NAMES } from '../constants/widgets';

function Segment({ value, onChange, label }: { value: Intensity; onChange: (v: Intensity) => void; label: string }) {
  const { colors: c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: c.line, borderRadius: 12, overflow: 'hidden' }}>
      {(['core', 'light'] as Intensity[]).map((v) => {
        const on = v === value;
        return (
          <TouchableOpacity
            key={v}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${label} ${v}`}
            onPress={() => onChange(v)}
            style={{ minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.bg }}
          >
            <Text style={{ color: on ? c.onAccent : c.accent, fontWeight: '700', fontSize: 12 }}>{v === 'core' ? 'Core' : 'Light'}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AreasScreen() {
  const { colors: c } = useTheme();
  const selection = useAreasStore((s) => s.selection);
  const toggleArea = useAreasStore((s) => s.toggleArea);
  const setIntensity = useAreasStore((s) => s.setIntensity);
  const resetOnboarding = useAreasStore((s) => s.resetOnboarding);
  const onlyOne = Object.keys(selection).length <= 1;

  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <View>
        <Text style={{ color: c.accent, fontSize: 30, fontWeight: '700' }}>Your focus areas</Text>
        <Text style={{ color: c.muted, fontSize: 14, marginTop: 4 }}>Choose how much each shapes your Today.</Text>
      </View>
      {AREAS.map((a) => {
        const level = selection[a.id];
        const widgets = (level === 'light' ? a.light : a.core).map((w) => WIDGET_NAMES[w]).join(', ');
        return (
          <View key={a.id} style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 }}>
            <View>
              <Text style={{ color: level ? c.text : c.muted, fontSize: 16 }}>{a.name}</Text>
              <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{widgets}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {level ? <Segment value={level} onChange={(v) => setIntensity(a.id, v)} label={a.name} /> : <View />}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${level ? 'Remove' : 'Add'} ${a.name}`}
                disabled={!!level && onlyOne}
                onPress={() => toggleArea(a.id)}
                style={[
                  { minHeight: 44, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', borderWidth: 1, borderColor: c.accent },
                  !level && { backgroundColor: c.accent },
                  !!level && onlyOne && { opacity: 0.3 },
                ]}
              >
                <Text style={{ color: level ? c.accent : c.onAccent, fontWeight: '700' }}>{level ? 'Remove' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <Text style={{ color: c.muted, fontSize: 13 }}>
        Removing an area hides its widgets and keeps your data. You always keep at least one area.
      </Text>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Redo setup" onPress={resetOnboarding} style={{ minHeight: 44, justifyContent: 'center' }}>
        <Text style={{ color: c.accent, fontWeight: '700' }}>Redo setup</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
