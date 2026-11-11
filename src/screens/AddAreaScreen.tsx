import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAreasStore } from '../store/areas';
import { Intensity, SUGGESTIONS } from '../constants/areas';

export default function AddAreaScreen({ onClose }: { onClose: () => void }) {
  const { colors: c } = useTheme();
  const addArea = useAreasStore((s) => s.addArea);
  const [name, setName] = useState('');
  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [level, setLevel] = useState<Intensity>('core');

  const input = { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, color: c.text, paddingHorizontal: 12, fontSize: 14 } as const;
  const canAdd = name.trim().length > 0;
  const submit = () => {
    if (!canAdd) return;
    addArea(name, [item1, item2], level);
    onClose();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: 56, gap: 12 }}>
      <Text style={{ color: c.accent, fontSize: 28, fontWeight: '700' }}>Add your own area</Text>
      <Text style={{ color: c.muted, fontSize: 14 }}>Journey tracks what you choose. Nothing is built in.</Text>

      <View style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 }}>
        <Text style={{ color: c.muted, fontSize: 13 }}>Area name</Text>
        <TextInput accessibilityLabel="Area name" value={name} onChangeText={setName} placeholder="Your area name" placeholderTextColor={c.muted} maxLength={40} style={input} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTIONS.map((s) => (
            <TouchableOpacity key={s} accessibilityRole="button" accessibilityLabel={`Use ${s}`} onPress={() => setName(s)} style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, borderColor: c.line, justifyContent: 'center' }}>
              <Text style={{ color: c.text, fontSize: 13 }}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 }}>
        <Text style={{ color: c.muted, fontSize: 13 }}>Starter checklist (optional)</Text>
        <TextInput accessibilityLabel="First checklist item" value={item1} onChangeText={setItem1} placeholder="Item one" placeholderTextColor={c.muted} style={input} />
        <TextInput accessibilityLabel="Second checklist item" value={item2} onChangeText={setItem2} placeholder="Item two" placeholderTextColor={c.muted} style={input} />
      </View>

      <View style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: c.text, fontSize: 14, flex: 1 }}>How much room on Today?</Text>
        <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: c.line, borderRadius: 12, overflow: 'hidden' }}>
          {(['core', 'light'] as Intensity[]).map((v) => (
            <TouchableOpacity key={v} accessibilityRole="button" accessibilityState={{ selected: level === v }} accessibilityLabel={`Room: ${v}`} onPress={() => setLevel(v)} style={{ minHeight: 44, minWidth: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: level === v ? c.accent : c.bg }}>
              <Text style={{ color: level === v ? c.onAccent : c.accent, fontWeight: '700', fontSize: 13 }}>{v === 'core' ? 'Core' : 'Light'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Add area" accessibilityState={{ disabled: !canAdd }} disabled={!canAdd} onPress={submit} style={{ minHeight: 52, borderRadius: 14, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', opacity: canAdd ? 1 : 0.4 }}>
        <Text style={{ color: c.onAccent, fontWeight: '700', fontSize: 16 }}>Add area</Text>
      </TouchableOpacity>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancel adding an area" onPress={onClose} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: c.accent, fontWeight: '700' }}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
