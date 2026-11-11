import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useNow } from '../prayer/hooks';
import { todayKey } from '../store/niyyah';
import { Area, useAreasStore } from '../store/areas';

export function AreaRow({ area }: { area: Area }) {
  const { colors: c } = useTheme();
  const key = todayKey(useNow(60000));
  const doneToday = useAreasStore((s) => s.done[key]);
  const toggleItem = useAreasStore((s) => s.toggleItem);
  const addItem = useAreasStore((s) => s.addItem);

  const [open, setOpen] = useState(area.intensity === 'core'); // Core areas start open, Light areas start collapsed
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const doneIds = doneToday ?? [];
  const doneCount = area.items.filter((i) => doneIds.includes(i.id)).length;
  const save = () => {
    addItem(area.id, draft);
    setDraft('');
    setAdding(false);
  };

  return (
    <View style={{ backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16 }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${area.name}, ${doneCount} of ${area.items.length} done`}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Text style={{ color: c.text, fontSize: 15 }}>{area.name}</Text>
        <Text style={{ color: c.muted, fontSize: 13 }}>
          {doneCount} of {area.items.length} {open ? '⌄' : '›'}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={{ paddingBottom: 8 }}>
          {area.items.length === 0 && <Text style={{ color: c.muted, fontSize: 13, paddingBottom: 4 }}>No items yet.</Text>}
          {area.items.map((item) => {
            const checked = doneIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={item.text}
                onPress={() => toggleItem(key, item.id)}
                style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: checked ? 0 : 2, borderColor: c.line, backgroundColor: checked ? c.accent : 'transparent' }} />
                <Text style={{ color: checked ? c.muted : c.text, fontSize: 14 }}>{item.text}</Text>
              </TouchableOpacity>
            );
          })}
          {adding ? (
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <TextInput
                accessibilityLabel={`New item for ${area.name}`}
                value={draft}
                onChangeText={setDraft}
                onSubmitEditing={save}
                placeholder="New item"
                placeholderTextColor={c.muted}
                autoFocus
                style={{ flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg, color: c.text, paddingHorizontal: 12, fontSize: 14 }}
              />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Add item to ${area.name}`} onPress={save} style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.accent, justifyContent: 'center' }}>
                <Text style={{ color: c.onAccent, fontWeight: '700' }}>Add</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Add an item to ${area.name}`} onPress={() => setAdding(true)} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ color: c.accent, fontWeight: '600', fontSize: 13 }}>+ Add item</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
