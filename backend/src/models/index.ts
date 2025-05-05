import Match from './Match';
import User from './User';
import WatchlistEntry from './WatchlistEntry';

export function initializeModels() {
	// Initialize models with their associations
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
	};
}

export default {
	User,
	Match,
	WatchlistEntry,
};
