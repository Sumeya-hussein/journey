export type Intensity = 'core' | 'light';

// Starter templates only. Nothing here is built in: users can use these, edit them, or add their own areas.
export type AreaTemplate = { name: string; items: string[]; intensity: Intensity };

export const TEMPLATES: AreaTemplate[] = [
  { name: 'Study & Career', items: ['Study block', 'Job or career task'], intensity: 'core' },
  { name: 'Health', items: ['Move your body', 'Drink water'], intensity: 'light' },
  { name: 'Content', items: ['Post or draft'], intensity: 'light' },
  { name: 'Finance', items: ['Check spending'], intensity: 'light' },
  { name: 'Family', items: ['Call or message someone'], intensity: 'light' },
];

export const SUGGESTIONS = ['Hifz', 'My business', 'Caring for parents', 'Fitness'];
