import { Sequelize } from 'sequelize';
import { ActivityLog } from './ActivityLog';
import AuditLog from './AuditLog';
import Match from './Match';
import User from './User';
import WatchlistEntry from './WatchlistEntry';

export function initializeModels(sequelize: Sequelize) {
	// First initialize all models
	User.initialize(sequelize);
	Match.initialize(sequelize);
	WatchlistEntry.initialize(sequelize);
	ActivityLog.initialize(sequelize);
	AuditLog.initialize(sequelize);

	// Then set up associations
	Match.belongsTo(User, { as: 'user1', foreignKey: 'user1_id' });
	Match.belongsTo(User, { as: 'user2', foreignKey: 'user2_id' });
	User.hasMany(Match, { as: 'initiatedMatches', foreignKey: 'user1_id' });
	User.hasMany(Match, { as: 'receivedMatches', foreignKey: 'user2_id' });

	WatchlistEntry.belongsTo(User, { foreignKey: 'user_id' });
	User.hasMany(WatchlistEntry, { foreignKey: 'user_id' });

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
