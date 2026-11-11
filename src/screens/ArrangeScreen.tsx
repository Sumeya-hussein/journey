import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useWidgetStore, visibleWidgets, WidgetId } from '../store/widgets';
import { widgetName } from '../constants/widgets';
import { useAreasStore } from '../store/areas';
import { useTheme } from '../theme/useTheme';

interface ArrangeScreenProps {
  onDone: () => void;
}

export default function ArrangeScreen({ onDone }: ArrangeScreenProps) {
  const theme = useTheme();
  const { bg, card, line, text, muted, accent, onAccent } = theme.colors;

  const widgets = useWidgetStore((s) => s.widgets);
  const prayerPinned = useWidgetStore((s) => s.prayerPinned);
  const move = useWidgetStore((s) => s.move);
  const hide = useWidgetStore((s) => s.hide);
  const show = useWidgetStore((s) => s.show);
  const setPrayerPinned = useWidgetStore((s) => s.setPrayerPinned);
  const areas = useAreasStore((s) => s.areas);
  const nameOf = (id: WidgetId) => widgetName(id, areas);

  // Same ordering rules as the dashboard, so both screens always agree.
  const visible = useMemo(() => visibleWidgets(widgets, prayerPinned), [widgets, prayerPinned]);
  const full = useMemo(() => [...widgets].sort((a, b) => a.order - b.order), [widgets]);
  const hidden = full.filter((w) => !w.visible && !(prayerPinned && w.id === 'nextPrayer'));

  // Move relative to the neighbouring VISIBLE widget, so hidden widgets in between don't swallow the move.
  const moveBy = (id: WidgetId, dir: -1 | 1) => {
    const i = visible.findIndex((w) => w.id === id);
    const neighbour = visible[i + dir];
    if (!neighbour) return;
    move(id, full.findIndex((w) => w.id === neighbour.id));
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: text }]}>Arrange your Today</Text>
      <Text style={[styles.subtitle, { color: muted }]}>Reorder your widgets. Hidden widgets keep their data.</Text>

      <View style={[styles.card, { backgroundColor: card, borderColor: line }]}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleTitle, { color: text }]}>Keep next prayer at the top</Text>
          <Text style={[styles.toggleDesc, { color: muted }]}>When on, it can&apos;t be hidden or moved.</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="switch"
          accessibilityState={{ checked: prayerPinned }}
          accessibilityLabel="Keep next prayer at the top"
          style={[styles.toggleButton, { backgroundColor: prayerPinned ? accent : line }]}
          onPress={() => setPrayerPinned(!prayerPinned)}
        >
          <Text style={[styles.toggleButtonText, { color: prayerPinned ? onAccent : text }]}>{prayerPinned ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { color: text }]}>Visible widgets</Text>
      {visible.map((widget, index) => {
        const name = nameOf(widget.id);
        const pinnedRow = prayerPinned && widget.id === 'nextPrayer';
        const upDisabled = index === 0 || (prayerPinned && visible[index - 1].id === 'nextPrayer');
        const downDisabled = index === visible.length - 1;
        return (
          <View key={widget.id} style={[styles.widgetRow, { backgroundColor: card, borderColor: line }]}>
            <View style={styles.widgetInfo}>
              <Text style={[styles.widgetName, { color: text }]}>{name}</Text>
              {pinnedRow && <Text style={[styles.pinnedBadge, { color: accent }]}>Pinned</Text>}
            </View>
            {!pinnedRow && (
              <View style={styles.actions}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${name} up`}
                  disabled={upDisabled}
                  style={[styles.actionBtn, { borderColor: line }, upDisabled && styles.disabledBtn]}
                  onPress={() => moveBy(widget.id, -1)}
                >
                  <Text style={[styles.actionBtnText, { color: text }]}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Move ${name} down`}
                  disabled={downDisabled}
                  style={[styles.actionBtn, { borderColor: line }, downDisabled && styles.disabledBtn]}
                  onPress={() => moveBy(widget.id, 1)}
                >
                  <Text style={[styles.actionBtnText, { color: text }]}>↓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Hide ${name}`}
                  style={[styles.textBtn, { borderColor: accent }]}
                  onPress={() => hide(widget.id)}
                >
                  <Text style={{ color: accent, fontWeight: '600' }}>Hide</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      <View style={[styles.dashedTray, { backgroundColor: card, borderColor: line }]}>
        <Text style={[styles.sectionHeader, { color: text }]}>Hidden ({hidden.length})</Text>
        {hidden.length === 0 ? (
          <Text style={[styles.subtitle, { color: muted }]}>Nothing hidden.</Text>
        ) : (
          hidden.map((widget) => (
            <View key={widget.id} style={[styles.widgetRow, { backgroundColor: card, borderColor: line }]}>
              <Text style={[styles.widgetName, { color: muted }]}>{nameOf(widget.id)}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Show ${nameOf(widget.id)}`}
                style={[styles.textBtn, { backgroundColor: accent, borderColor: accent }]}
                onPress={() => show(widget.id)}
              >
                <Text style={{ color: onAccent, fontWeight: '600' }}>Show</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Done arranging widgets"
        style={[styles.doneButton, { backgroundColor: accent }]}
        onPress={onDone}
      >
        <Text style={[styles.doneButtonText, { color: onAccent }]}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  toggleTextContainer: { flex: 1, marginRight: 12 },
  toggleTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  toggleDesc: { fontSize: 12 },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minHeight: 44, minWidth: 44, justifyContent: 'center' },
  toggleButtonText: { fontWeight: '700', textAlign: 'center' },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  widgetRow: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minHeight: 44 },
  widgetInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  widgetName: { fontSize: 16, fontWeight: '500' },
  pinnedBadge: { fontSize: 12, fontWeight: '600', marginLeft: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionBtn: { width: 44, height: 44, borderWidth: 1, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  disabledBtn: { opacity: 0.3 },
  actionBtnText: { fontSize: 18, fontWeight: 'bold' },
  textBtn: { paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, minHeight: 44, justifyContent: 'center' },
  dashedTray: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, padding: 16, marginTop: 16, marginBottom: 24 },
  doneButton: { padding: 16, borderRadius: 12, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  doneButtonText: { fontSize: 16, fontWeight: '700' },
});
