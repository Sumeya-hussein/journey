import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useNow } from '../prayer/hooks';
import { todayKey } from '../store/niyyah';
import { useDayStore } from '../store/day';

export function OneThingCard() {
  const { colors: c } = useTheme();
  const key = todayKey(useNow(60000));
  const one = useDayStore((s) => s.oneThing);
  const setOneThing = useDayStore((s) => s.setOneThing);
  const toggle = useDayStore((s) => s.toggleOneThing);
  const [draft, setDraft] = useState('');
  const today = one && one.dateKey === key ? one : null;

  return (
    <View style={{ backgroundColor: c.card, borderColor: c.accent, borderWidth: 2, borderRadius: 16, padding: 16, gap: 8 }}>
      <Text style={{ color: c.muted, fontSize: 12 }}>One thing today</Text>
      {today ? (
        <>
          <TouchableOpacity accessibilityRole="checkbox" accessibilityState={{ checked: today.done }} accessibilityLabel={today.text} onPress={() => toggle(key)} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: today.done ? 0 : 2, borderColor: c.line, backgroundColor: today.done ? c.accent : 'transparent' }} />
            <Text style={{ color: today.done ? c.muted : c.text, fontSize: 16, flex: 1 }}>{today.text}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Change your one thing" onPress={() => setOneThing(key, '')} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text style={{ color: c.accent, fontWeight: '600', fontSize: 13 }}>Change</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            accessibilityLabel="Your one thing for today"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => { setOneThing(key, draft); setDraft(''); }}
            placeholder="What is the one thing?"
            placeholderTextColor={c.muted}
            maxLength={100}
            style={{ flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, color: c.text, paddingHorizontal: 12, fontSize: 15 }}
          />
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Set your one thing" onPress={() => { setOneThing(key, draft); setDraft(''); }} style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.accent, justifyContent: 'center' }}>
            <Text style={{ color: c.onAccent, fontWeight: '700' }}>Set</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
