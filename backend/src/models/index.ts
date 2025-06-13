import type { Sequelize } from 'sequelize';
import ActivityLog from './ActivityLog';
import AppSettings from './AppSettings';
import AuditLog from './AuditLog';
import Content from './Content';
import ContentReport from './ContentReport';
import EmailVerification from './EmailVerification';
import Match from './Match';
import PasswordReset from './PasswordReset';
import User from './User';
import UserSession from './UserSession';
import WatchlistEntry from './WatchlistEntry';

export function initializeModels(sequelize: Sequelize) {
	// Validate sequelize instance
	if (!sequelize || typeof sequelize.define !== 'function') {
		throw new Error(
			'Invalid Sequelize instance provided to initializeModels(). ' +
				'Make sure the Sequelize instance is properly configured.'
		);
	}

	try {
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
		EmailVerification.initialize(sequelize);
		PasswordReset.initialize(sequelize);
		UserSession.initialize(sequelize);

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

		ContentReport.belongsTo(User, {
			foreignKey: 'user_id',
			as: 'reportingUser',
		});
		User.hasMany(ContentReport, {
			foreignKey: 'user_id',
			as: 'contentReports',
		});

		// Email verification and password reset associations
		EmailVerification.belongsTo(User, {
			foreignKey: 'user_id',
			as: 'user',
		});
		User.hasMany(EmailVerification, {
			foreignKey: 'user_id',
			as: 'emailVerifications',
		});

		PasswordReset.belongsTo(User, {
			foreignKey: 'user_id',
			as: 'user',
		});
		User.hasMany(PasswordReset, {
			foreignKey: 'user_id',
			as: 'passwordResets',
		});

		// User session associations
		UserSession.belongsTo(User, {
			foreignKey: 'user_id',
			as: 'user',
		});
		User.hasMany(UserSession, {
			foreignKey: 'user_id',
			as: 'sessions',
		});

		// Add association between Match and WatchlistEntry
		Match.belongsTo(WatchlistEntry, {
			foreignKey: 'entry_id',
			as: 'watchlistEntry',
		});
		WatchlistEntry.hasMany(Match, { foreignKey: 'entry_id', as: 'matches' });
	} catch (error) {
		console.error('Error initializing models:', error);
		throw new Error(
			`Failed to initialize models: ${error instanceof Error ? error.message : 'Unknown error'}`
		);
	}
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
	EmailVerification,
	PasswordReset,
	UserSession,
};
