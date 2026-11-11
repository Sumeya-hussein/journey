import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import ArrangeScreen from './src/screens/ArrangeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AreasScreen from './src/screens/AreasScreen';
import { NextPrayerHero } from './src/widgets/NextPrayerHero';
import { NiyyahCard } from './src/widgets/NiyyahCard';
import { DayProgressCard } from './src/widgets/DayProgressCard';
import { OneThingCard } from './src/widgets/OneThingCard';
import { AreaRow } from './src/widgets/AreaRow';
import { TabBar, TabId } from './src/components/TabBar';
import { useWidgetStore, visibleWidgets } from './src/store/widgets';
import { useAreasStore } from './src/store/areas';
import { useDayStore } from './src/store/day';
import { todayKey } from './src/store/niyyah';
import { useNow } from './src/prayer/hooks';
import { greeting } from './src/utils/greeting';
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

  const now = useNow(60000);
  const dateKey = todayKey(now);
  const widgets = useWidgetStore((s) => s.widgets);
  const prayerPinned = useWidgetStore((s) => s.prayerPinned);
  const list = useMemo(() => visibleWidgets(widgets, prayerPinned), [widgets, prayerPinned]);
  const areas = useAreasStore((s) => s.areas);
  const lightDayKey = useDayStore((s) => s.lightDayKey);
  const setLightDay = useDayStore((s) => s.setLightDay);
  const lightOn = lightDayKey === dateKey; // Light day switches itself off on the next date

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

  const areaFor = (id: string) => areas.find((a) => `area:${a.id}` === id && a.active);
  const activeAreaCount = areas.filter((a) => a.active).length;
  const hasAreaWidget = list.some((w) => areaFor(w.id));
  let areasLabelShown = false;

  const renderToday = () => {
    if (lightOn) {
      return (
        <>
          {list.filter((w) => w.id === 'nextPrayer').map((w) => <NextPrayerHero key={w.id} />)}
          {list.filter((w) => w.id === 'niyyah').map((w) => <NiyyahCard key={w.id} />)}
          <OneThingCard />
          {activeAreaCount > 0 && (
            <View style={[styles.pausedRow, { borderColor: line }]}>
              <Text style={{ color: muted, fontSize: 14 }}>{activeAreaCount} {activeAreaCount === 1 ? 'area' : 'areas'} paused for today</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Show my areas again" onPress={() => setLightDay(false, dateKey)} style={{ minHeight: 44, justifyContent: 'center' }}>
                <Text style={{ color: accent, fontWeight: '700' }}>Show</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={{ color: muted, fontSize: 13 }}>Light days still count. Your journey keeps going.</Text>
        </>
      );
    }
    return (
      <>
        {list.map((w) => {
          if (w.id === 'nextPrayer') return <NextPrayerHero key={w.id} />;
          if (w.id === 'niyyah') return <NiyyahCard key={w.id} />;
          if (w.id === 'dayProgress') return <DayProgressCard key={w.id} />;
          const area = areaFor(w.id);
          if (!area) return null;
          const label = !areasLabelShown;
          areasLabelShown = true;
          return (
            <View key={w.id} style={{ gap: 10 }}>
              {label && <Text style={{ color: muted, fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' }}>Your areas</Text>}
              <AreaRow area={area} />
            </View>
          );
        })}
        {!hasAreaWidget && (
          <View style={[styles.widgetCard, { backgroundColor: card, borderColor: line, gap: 6 }]}>
            <Text style={{ color: text, fontSize: 15 }}>Add an area to build your Today</Text>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go to Areas" onPress={() => setTab('areas')} style={{ minHeight: 44, justifyContent: 'center' }}>
              <Text style={{ color: accent, fontWeight: '700' }}>Open Areas</Text>
            </TouchableOpacity>
          </View>
        )}
      </>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <View style={styles.body}>
        {tab === 'today' ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.greeting, { color: text }]}>{greeting(now)}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  accessibilityRole="switch"
                  accessibilityState={{ checked: lightOn }}
                  accessibilityLabel="Light day"
                  onPress={() => setLightDay(!lightOn, dateKey)}
                  style={[styles.pill, { borderColor: accent, backgroundColor: lightOn ? accent : bg }]}
                >
                  <Text style={{ color: lightOn ? onAccent : accent, fontWeight: '700', fontSize: 13 }}>Light day: {lightOn ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open Arrange screen" style={[styles.arrangeButton, { backgroundColor: accent }]} onPress={() => setIsArranging(true)}>
                  <Text style={[styles.arrangeButtonText, { color: onAccent }]}>Arrange</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
              {renderToday()}
              <TouchableOpacity accessibilityRole="button" onPress={() => setTheme(themeId === 'midnightBarakah' ? 'radiantHarmony' : 'midnightBarakah')} style={[styles.themeButton, { borderColor: accent }]}>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 },
  greeting: { fontSize: 22, fontWeight: '700' },
  pill: { minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1, justifyContent: 'center' },
  arrangeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, minHeight: 44, justifyContent: 'center' },
  arrangeButtonText: { fontWeight: '700', fontSize: 14 },
  content: { paddingBottom: 24, gap: 12 },
  widgetCard: { borderWidth: 1, borderRadius: 16, padding: 16, minHeight: 80, justifyContent: 'center' },
  pausedRow: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 },
  themeButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
