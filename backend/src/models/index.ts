import { Sequelize } from 'sequelize';
import ActivityLog from './ActivityLog';
import AppSettings from './AppSettings';
import AuditLog from './AuditLog';
import Content from './Content';
import ContentReport from './ContentReport';
import Match from './Match';
import User from './User';
import WatchlistEntry from './WatchlistEntry';

export function initializeModels(sequelize: Sequelize) {
	// Initialize models that don't depend on other models first
	User.initialize(sequelize);
	WatchlistEntry.initialize(sequelize);
	AppSettings.initialize(sequelize);
	Content.initialize(sequelize);

	// Then initialize models that depend on those
	Match.initialize(sequelize);
	ActivityLog.initialize(sequelize);
	AuditLog.initialize(sequelize);
	ContentReport.initialize(sequelize);

	// Set up associations after all models are initialized
	Match.belongsTo(User, { as: 'user1', foreignKey: 'user1_id' });
	Match.belongsTo(User, { as: 'user2', foreignKey: 'user2_id' });
	User.hasMany(Match, { as: 'initiatedMatches', foreignKey: 'user1_id' });
	User.hasMany(Match, { as: 'receivedMatches', foreignKey: 'user2_id' });

	WatchlistEntry.belongsTo(User, {
		foreignKey: 'user_id',
		as: 'watchlistUser',
	});
	User.hasMany(WatchlistEntry, {
		foreignKey: 'user_id',
		as: 'watchlistEntries',
	});

	ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'activityUser' });
	User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'userActivities' });

	// Content and ContentReport associations
	ContentReport.belongsTo(Content, {
		foreignKey: 'content_id',
		as: 'reportedContent',
	});
	Content.hasMany(ContentReport, { foreignKey: 'content_id', as: 'reports' });

	ContentReport.belongsTo(User, { foreignKey: 'user_id', as: 'reportingUser' });
	User.hasMany(ContentReport, { foreignKey: 'user_id', as: 'contentReports' });

	// Add association between Match and WatchlistEntry
	Match.belongsTo(WatchlistEntry, {
		foreignKey: 'entry_id',
		as: 'watchlistEntry',
	});
	WatchlistEntry.hasMany(Match, { foreignKey: 'entry_id', as: 'matches' });
}

export default {
	User,
	Match,
	WatchlistEntry,
	ActivityLog,
	AuditLog,
	AppSettings,
	Content,
	ContentReport,
};
