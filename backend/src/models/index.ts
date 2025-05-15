import { Sequelize } from 'sequelize';
import ActivityLog from './ActivityLog'; // Assuming it's a default export like others
import AuditLog from './AuditLog';
import Match from './Match';
import User from './User';
import WatchlistEntry from './WatchlistEntry';

export function initializeModels(sequelize: Sequelize) {
	// Initialize models that don't depend on other models first
	User.initialize(sequelize);
	WatchlistEntry.initialize(sequelize);

	// Then initialize models that depend on those
	Match.initialize(sequelize);
	ActivityLog.initialize(sequelize);
	AuditLog.initialize(sequelize);

	// Set up associations after all models are initialized
	Match.belongsTo(User, { as: 'user1', foreignKey: 'user1_id' });
	Match.belongsTo(User, { as: 'user2', foreignKey: 'user2_id' });
	User.hasMany(Match, { as: 'initiatedMatches', foreignKey: 'user1_id' });
	User.hasMany(Match, { as: 'receivedMatches', foreignKey: 'user2_id' });

	WatchlistEntry.belongsTo(User, { foreignKey: 'user_id' });
	User.hasMany(WatchlistEntry, { foreignKey: 'user_id' });

	// Add association between Match and WatchlistEntry
	Match.belongsTo(WatchlistEntry, {
		as: 'watchlistEntry',
		foreignKey: 'entry_id',
	});
	WatchlistEntry.hasMany(Match, { foreignKey: 'entry_id' });

	return {
		User,
		Match,
		WatchlistEntry,
		ActivityLog,
		AuditLog,
	};
}

export default {
	User,
	Match,
	WatchlistEntry,
	ActivityLog,
	AuditLog,
};
