import { Sequelize } from 'sequelize';
import { initializeModels } from '../models';
import Match from '../models/Match';
import User from '../models/User';
import WatchlistEntry from '../models/WatchlistEntry';

// Mock Sequelize for tests
export const mockSequelize = new Sequelize('sqlite::memory:', {
	logging: false,
});

// Initialize models with mock Sequelize instance
export function initializeTestModels() {
	// Initialize models
	User.initialize(mockSequelize);
	Match.initialize(mockSequelize);
	WatchlistEntry.initialize(mockSequelize);

	// Set up associations
	initializeModels();

	return {
		User,
		Match,
		WatchlistEntry,
	};
}

// Helper to clear all test data
export async function clearTestData() {
	await WatchlistEntry.destroy({ where: {}, force: true });
	await Match.destroy({ where: {}, force: true });
	await User.destroy({ where: {}, force: true });
}
