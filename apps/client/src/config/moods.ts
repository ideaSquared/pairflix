import type { Mood } from '../services/api/households';

export const MOODS: { id: Mood; label: string }[] = [
  { id: 'funny', label: 'Funny' },
  { id: 'feelgood', label: 'Feel-good' },
  { id: 'romantic', label: 'Romantic' },
  { id: 'thoughtful', label: 'Thoughtful' },
  { id: 'tense', label: 'Tense' },
  { id: 'dark', label: 'Dark' },
  { id: 'action', label: 'Action' },
];
