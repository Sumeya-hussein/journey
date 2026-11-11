import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ArrangeScreen from './src/screens/ArrangeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AreasScreen from './src/screens/AreasScreen';
import { useAreasStore } from './src/store/areas';
import { NextPrayerHero } from './src/widgets/NextPrayerHero';
import { NiyyahCard } from './src/widgets/NiyyahCard';
import { TabBar, TabId } from './src/components/TabBar';
import { useWidgetStore, visibleWidgets } from './src/store/widgets';
import { WIDGET_NAMES } from './src/constants/widgets';
import { useTheme, useThemeStore } from './src/theme/useTheme';

function ComingSoon({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: 14 }}>Coming soon.</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabId>('today');
  const [isArranging, setIsArranging] = useState(false);
  const theme = useTheme();
  const { bg, card, line, text, muted, accent, onAccent } = theme.colors;
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  const widgets = useWidgetStore((s) => s.widgets);
  const prayerPinned = useWidgetStore((s) => s.prayerPinned);
  const list = useMemo(() => visibleWidgets(widgets, prayerPinned), [widgets, prayerPinned]);

  // Wait for saved data to load, so returning users don't flash the onboarding screen.
  const [ready, setReady] = useState(useAreasStore.persist.hasHydrated());
  useEffect(() => useAreasStore.persist.onFinishHydration(() => setReady(true)), []);
  const onboarded = useAreasStore((s) => s.onboarded);

  if (!ready) return <View style={{ flex: 1, backgroundColor: bg }} />;
  if (!onboarded) return <OnboardingScreen />;

  // Arranging is a focused task, so it hides the tab bar.
  if (isArranging) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, paddingTop: 48 }}>
        <ArrangeScreen onDone={() => setIsArranging(false)} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View style={styles.body}>
        {tab === 'today' ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: text }]}>Good morning</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Open Arrange screen"
                style={[styles.arrangeButton, { backgroundColor: accent }]}
                onPress={() => setIsArranging(true)}
              >
                <Text style={[styles.arrangeButtonText, { color: onAccent }]}>Arrange</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
              {list.length === 0 ? (
                <Text style={[styles.emptyText, { color: muted }]}>All widgets are hidden. Tap &quot;Arrange&quot; to show them.</Text>
              ) : (
                list.map((widget) =>
                  widget.id === 'nextPrayer' ? (
                    <NextPrayerHero key={widget.id} />
                  ) : widget.id === 'niyyah' ? (
                    <NiyyahCard key={widget.id} />
                  ) : (
                    <View key={widget.id} style={[styles.widgetCard, { backgroundColor: card, borderColor: line }]}>
                      <Text style={[styles.widgetTitle, { color: text }]}>{WIDGET_NAMES[widget.id]}</Text>
                      <Text style={[styles.widgetBody, { color: muted }]}>Content coming soon.</Text>
                    </View>
                  )
                )
              )}
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setTheme(themeId === 'midnightBarakah' ? 'radiantHarmony' : 'midnightBarakah')}
                style={[styles.themeButton, { borderColor: accent }]}
              >
                <Text style={{ color: accent, fontWeight: '700' }}>Switch theme</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        ) : tab === 'areas' ? (
          <AreasScreen />
        ) : (
          <ComingSoon title={tab === 'journal' ? 'Journal' : 'Me'} />
        )}
      </View>
      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, padding: 16, paddingTop: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '700' },
  arrangeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minHeight: 44, justifyContent: 'center' },
  arrangeButtonText: { fontWeight: '700', fontSize: 14 },
  content: { paddingBottom: 24, gap: 12 },
  widgetCard: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 80, justifyContent: 'center' },
  widgetTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  widgetBody: { fontSize: 14 },
  emptyText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  themeButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
