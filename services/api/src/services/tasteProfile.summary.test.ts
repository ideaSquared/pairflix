import { summariseTasteProfile } from './tasteProfile.summary';

describe('summariseTasteProfile', () => {
	it('renders the canonical happy-path blurb deterministically', () => {
		const blurb = summariseTasteProfile({
			user_id: 'u1',
			genre_weights: { comedy: 0.6, drama: 0.25, horror: 0.05 },
			preferred_runtime: 95,
			likes: ['feel-good'],
			dislikes: ['horror'],
		});

		expect(blurb).toBe(
			'Leans comedy (60%) and drama (25%). Prefers ~95 min films. Likes feel-good, avoids horror.'
		);

		// Deterministic: same input -> same string
		const again = summariseTasteProfile({
			user_id: 'u1',
			genre_weights: { drama: 0.25, comedy: 0.6, horror: 0.05 },
			preferred_runtime: 95,
			likes: ['feel-good'],
			dislikes: ['horror'],
		});
		expect(again).toBe(blurb);
	});
});
