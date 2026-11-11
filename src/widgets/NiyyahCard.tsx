import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useNow } from '../prayer/hooks';
import { todayKey, useNiyyahStore } from '../store/niyyah';

export function NiyyahCard() {
  const t = useTheme();
  const now = useNow(60000); // re-checks the date every minute so the card rolls over at midnight
  const dateKey = todayKey(now);
  const saved = useNiyyahStore((s) => s.entries[dateKey]) ?? '';
  const setNiyyah = useNiyyahStore((s) => s.setNiyyah);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(saved);
    setEditing(true);
  };
  const save = () => {
    setNiyyah(dateKey, draft);
    setEditing(false);
  };

  const c = t.colors;
  const btn = { minHeight: 44, minWidth: 44, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' } as const;

  return (
    <View style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 76 }}>
      <Text style={{ color: c.muted, fontSize: 12 }}>Niyyah today</Text>
      {editing ? (
        <View style={{ gap: 10, marginTop: 8 }}>
          <TextInput
            accessibilityLabel="Today's intention"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={save}
            placeholder="Your intention for today"
            placeholderTextColor={c.muted}
            maxLength={140}
            autoFocus
            returnKeyType="done"
            style={{ minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, color: c.text, paddingHorizontal: 12, fontSize: 15 }}
          />
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancel" onPress={() => setEditing(false)} style={[btn, { borderWidth: 1, borderColor: c.accent }]}>
              <Text style={{ color: c.accent, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Save intention" onPress={save} style={[btn, { backgroundColor: c.accent }]}>
              <Text style={{ color: c.onAccent, fontWeight: '700' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <Text style={{ flex: 1, fontSize: 15, color: saved ? c.text : c.accent }}>{saved || "Set today's intention"}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={saved ? "Edit today's intention" : "Set today's intention"}
            onPress={startEdit}
            style={[btn, { borderWidth: 1, borderColor: c.line, backgroundColor: c.bg }]}
          >
            <Text style={{ color: c.accent, fontWeight: '700' }}>{saved ? 'Edit' : 'Set'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
