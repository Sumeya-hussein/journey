import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useNow } from '../prayer/hooks';
import { todayKey } from '../store/niyyah';
import { dayNumber, useDayStore } from '../store/day';

const TOTAL = 75;

export function DayProgressCard() {
  const { colors: c } = useTheme();
  const key = todayKey(useNow(60000));
  const startKey = useDayStore((s) => s.startKey);
  const continuing = useDayStore((s) => s.continuing);
  const startCycle = useDayStore((s) => s.startCycle);
  const keepGoing = useDayStore((s) => s.keepGoing);

  const card = { backgroundColor: c.card, borderColor: c.line, borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 } as const;
  const btn = { minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 } as const;

  if (!startKey) {
    return (
      <View style={card}>
        <Text style={{ color: c.muted, fontSize: 12 }}>Day progress</Text>
        <Text style={{ color: c.text, fontSize: 15 }}>Start your {TOTAL} days</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Start today as day 1" onPress={() => startCycle(key)} style={[btn, { backgroundColor: c.accent }]}>
          <Text style={{ color: c.onAccent, fontWeight: '700' }}>Start today</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const n = dayNumber(startKey, key);
  if (n > TOTAL && !continuing) {
    return (
      <View style={card}>
        <Text style={{ color: c.muted, fontSize: 12 }}>Day {n}</Text>
        <Text style={{ color: c.text, fontSize: 22, fontWeight: '700' }}>{TOTAL} days complete</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Start a new cycle" onPress={() => startCycle(key)} style={[btn, { backgroundColor: c.accent }]}>
          <Text style={{ color: c.onAccent, fontWeight: '700' }}>Start a new cycle</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Keep going without a cycle" onPress={keepGoing} style={[btn, { borderWidth: 1, borderColor: c.accent }]}>
          <Text style={{ color: c.accent, fontWeight: '700' }}>Keep going, no cycle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ gap: 6, paddingVertical: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: c.muted, fontSize: 13 }}>{n > TOTAL ? `Day ${n}` : `Day ${n} of ${TOTAL}`}</Text>
        {n <= TOTAL && <Text style={{ color: c.muted, fontSize: 13 }}>{Math.round((n / TOTAL) * 100)}%</Text>}
      </View>
      {n <= TOTAL && (
        <View style={{ height: 4, borderRadius: 2, backgroundColor: c.line }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: c.accent, width: `${(n / TOTAL) * 100}%` }} />
        </View>
      )}
    </View>
  );
}
