import { describe, expect, it } from 'vitest';
import { summariseTasteProfile } from './tasteSummary';

describe('summariseTasteProfile', () => {
	it('returns an empty string when there is nothing to summarise', () => {
		expect(summariseTasteProfile({ userId: 'u1' })).toBe('');
		expect(
			summariseTasteProfile({
				userId: 'u1',
				genreWeights: {},
				likes: [],
				dislikes: [],
				preferredRuntime: null,
			})
		).toBe('');
	});

	it('names the single leaning genre as a percentage', () => {
		expect(
			summariseTasteProfile({ userId: 'u1', genreWeights: { comedy: 0.8 } })
		).toBe('Leans comedy (80%).');
	});

	it('names the top two genres by weight, highest first', () => {
		expect(
			summariseTasteProfile({
				userId: 'u1',
				genreWeights: { comedy: 0.4, drama: 0.9, horror: 0.7 },
			})
		).toBe('Leans drama (90%) and horror (70%).');
	});

	it('breaks weight ties alphabetically for determinism', () => {
		expect(
			summariseTasteProfile({
				userId: 'u1',
				genreWeights: { horror: 0.5, comedy: 0.5, drama: 0.5 },
			})
		).toBe('Leans comedy (50%) and drama (50%).');
	});

	it('ignores non-positive genre weights', () => {
		expect(
			summariseTasteProfile({
				userId: 'u1',
				genreWeights: { comedy: 0.6, drama: 0, horror: -1 },
			})
		).toBe('Leans comedy (60%).');
	});

	it('reports preferred runtime rounded to whole minutes', () => {
		expect(
			summariseTasteProfile({ userId: 'u1', preferredRuntime: 97.4 })
		).toBe('Prefers ~97 min films.');
	});

	it('combines likes and dislikes, each sorted, into one clause', () => {
		expect(
			summariseTasteProfile({
				userId: 'u1',
				likes: ['zombies', 'heists'],
				dislikes: ['gore'],
			})
		).toBe('Likes heists, zombies, avoids gore.');
	});

	it('renders likes-only and dislikes-only as separate phrasings', () => {
		expect(summariseTasteProfile({ userId: 'u1', likes: ['heists'] })).toBe(
			'Likes heists.'
		);
		expect(summariseTasteProfile({ userId: 'u1', dislikes: ['gore'] })).toBe(
			'Avoids gore.'
		);
	});

	it('assembles every part in order and is deterministic', () => {
		const input = {
			userId: 'u1',
			genreWeights: { drama: 0.9, comedy: 0.5 },
			preferredRuntime: 110,
			likes: ['slow burns'],
			dislikes: ['jump scares'],
		};
		const expected =
			'Leans drama (90%) and comedy (50%). Prefers ~110 min films. Likes slow burns, avoids jump scares.';
		expect(summariseTasteProfile(input)).toBe(expected);
		expect(summariseTasteProfile(input)).toBe(summariseTasteProfile(input));
	});
});
