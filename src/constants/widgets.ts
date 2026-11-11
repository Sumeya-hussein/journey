import type { WidgetId, FixedWidget } from '../store/widgets';
import type { Area } from '../store/areas';

export const FIXED_NAMES: Record<FixedWidget, string> = {
  nextPrayer: 'Next prayer',
  niyyah: 'Niyyah today',
  dayProgress: 'Day progress',
};

export function widgetName(id: WidgetId, areas: Area[]): string {
  if (id.startsWith('area:')) return areas.find((a) => `area:${a.id}` === id)?.name ?? 'Area';
  return FIXED_NAMES[id as FixedWidget];
}
