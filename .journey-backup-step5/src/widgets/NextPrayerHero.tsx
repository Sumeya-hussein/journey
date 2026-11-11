import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useLocation, useNow } from '../prayer/hooks';
import { PRAYER_KEYS, PRAYER_LABELS, daySchedule, formatCountdown, nextPrayer } from '../prayer/compute';

const fmt = (d: Date) => d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function NextPrayerHero() {
  const t = useTheme();
  const { status, place, request } = useLocation();
  const now = useNow();
  const dayKey = now.toDateString();

  const today = useMemo(() => (place ? daySchedule(place, now) : null), [place, dayKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = place ? nextPrayer(place, now) : null;

  const card = {
    backgroundColor: t.colors.card,
    borderColor: t.colors.line,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 188,
  } as const;
  const label = { color: t.colors.muted, fontSize: 12 } as const;

  if (!place || !today || !next) {
    return (
      <View style={card}>
        <Text style={label}>Next prayer</Text>
        <Text style={{ color: t.colors.text, fontSize: 18, marginTop: 12 }}>
          {status === 'denied' ? 'Allow location to see prayer times for where you are.' : 'Finding your location…'}
        </Text>
        {status === 'denied' && (
          <Pressable accessibilityRole="button" onPress={request} style={{ minHeight: 44, justifyContent: 'center', marginTop: 8 }}>
            <Text style={{ color: t.colors.accent, fontWeight: '700' }}>Allow location</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const countdown = formatCountdown(next.time.getTime() - now.getTime());
  return (
    <View style={card} accessibilityLabel={`Next prayer ${PRAYER_LABELS[next.key]} in ${countdown}`}>
      <Text style={label}>Next prayer</Text>
      <Text style={{ color: t.colors.text, fontSize: 36, fontWeight: '600', marginTop: 4 }}>
        {PRAYER_LABELS[next.key]}
        {next.isTomorrow ? ' tomorrow' : ''}
      </Text>
      <Text style={{ color: t.colors.accent, fontSize: 20, fontWeight: '500' }}>
        in {countdown} · {fmt(next.time)}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 16 }}>
        {PRAYER_KEYS.map((k) => {
          const done = today[k].getTime() <= now.getTime();
          const isNext = !next.isTomorrow && next.key === k;
          return (
            <View key={k} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  borderWidth: done ? 0 : 2,
                  borderColor: isNext ? t.colors.accent : t.colors.line,
                  backgroundColor: done ? t.colors.accent : 'transparent',
                }}
              />
              <Text style={{ color: t.colors.muted, fontSize: 12 }}>{PRAYER_LABELS[k]}</Text>
              <Text style={{ color: t.colors.muted, fontSize: 11 }}>{fmt(today[k])}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
