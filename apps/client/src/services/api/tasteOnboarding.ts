import { fetchWithAuth } from './utils';

export interface OnboardingCard {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  genreIds: number[];
}

export interface OnboardingSwipe {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  genreIds: number[];
  verdict: 'love' | 'not_for_me';
}

export interface OnboardingSubmission {
  likedGenreIds: number[];
  swipes: OnboardingSwipe[];
  providers: string[];
}

export const tasteOnboarding = {
  getDeck: async (): Promise<{ cards: OnboardingCard[] }> => {
    const response = await fetchWithAuth('/api/me/taste-onboarding/deck');
    return response.data;
  },

  submit: async (body: OnboardingSubmission): Promise<void> => {
    await fetchWithAuth('/api/me/taste-onboarding', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};
