import type { WidgetType } from '../store/widgets';

export type AreaId = 'faith' | 'study' | 'health' | 'content' | 'finance' | 'family';
export type Intensity = 'core' | 'light';
export type Selection = Partial<Record<AreaId, Intensity>>;

export type Area = {
  id: AreaId;
  name: string;
  core: WidgetType[]; // widgets this area adds at Core intensity
  light: WidgetType[]; // widgets it adds at Light intensity
  defaultIntensity: Intensity;
};

export const AREAS: Area[] = [
  { id: 'faith', name: 'Faith', core: ['nextPrayer', 'niyyah'], light: ['nextPrayer'], defaultIntensity: 'core' },
  { id: 'study', name: 'Study & Career', core: ['studyRotation'], light: ['studyRotation'], defaultIntensity: 'core' },
  { id: 'health', name: 'Health', core: ['health', 'habits'], light: ['health'], defaultIntensity: 'light' },
  { id: 'content', name: 'Content', core: ['content'], light: ['content'], defaultIntensity: 'light' },
  { id: 'finance', name: 'Finance', core: ['finance'], light: ['finance'], defaultIntensity: 'light' },
  { id: 'family', name: 'Family', core: ['family'], light: ['family'], defaultIntensity: 'light' },
];

export const DEFAULT_SELECTION: Selection = { faith: 'core', study: 'core', health: 'light', content: 'light' };

// Default dashboard order for composed widgets.
const CANONICAL: WidgetType[] = [
  'nextPrayer', 'niyyah', 'dayProgress', 'studyRotation', 'health', 'content', 'finance', 'family', 'habits',
];

export function composeIds(selection: Selection): WidgetType[] {
  const out = new Set<WidgetType>(['dayProgress']);
  for (const area of AREAS) {
    const level = selection[area.id];
    if (level) (level === 'core' ? area.core : area.light).forEach((w) => out.add(w));
  }
  return CANONICAL.filter((id) => out.has(id));
}

export function unlockHint(selection: Selection): string {
  const count = Object.keys(selection).length;
  if (selection.faith && selection.study) return 'Faith + Study together adds a niyyah check-in to Study rotation.';
  if (count < 2) return 'Pick two or more areas to see what combining them unlocks.';
  return 'Each area adds its own widgets. You can change this any time in Areas.';
}
