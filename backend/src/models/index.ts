import type { Sequelize } from 'sequelize';
import ActivityLog from './ActivityLog';
import AppSettings from './AppSettings';
import AuditLog from './AuditLog';
import Content from './Content';
import ContentReport from './ContentReport';
import EmailVerification from './EmailVerification';
import Household from './Household';
import HouseholdInvite from './HouseholdInvite';
import HouseholdMember from './HouseholdMember';
import Match from './Match';
import PasswordReset from './PasswordReset';
import PickEvent from './PickEvent';
import PickUsage from './PickUsage';
import Subscription from './Subscription';
import TasteProfile from './TasteProfile';
import User from './User';
import UserSession from './UserSession';
import WatchedTogether from './WatchedTogether';
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
		Household.initialize(sequelize);
		HouseholdMember.initialize(sequelize);
		HouseholdInvite.initialize(sequelize);
		TasteProfile.initialize(sequelize);
		WatchedTogether.initialize(sequelize);
		Subscription.initialize(sequelize);
		PickUsage.initialize(sequelize);
		PickEvent.initialize(sequelize);

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

		Household.belongsToMany(User, {
			through: HouseholdMember,
			foreignKey: 'household_id',
			otherKey: 'user_id',
			as: 'members',
		});
		User.belongsToMany(Household, {
			through: HouseholdMember,
			foreignKey: 'user_id',
			otherKey: 'household_id',
			as: 'households',
		});
		HouseholdMember.belongsTo(Household, { foreignKey: 'household_id' });
		HouseholdMember.belongsTo(User, { foreignKey: 'user_id' });
		Household.hasMany(HouseholdMember, {
			foreignKey: 'household_id',
			as: 'memberships',
		});
		User.hasMany(HouseholdMember, {
			foreignKey: 'user_id',
			as: 'householdMemberships',
		});

		TasteProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
		User.hasOne(TasteProfile, { foreignKey: 'user_id', as: 'tasteProfile' });

		HouseholdInvite.belongsTo(Household, {
			foreignKey: 'household_id',
			as: 'household',
		});
		Household.hasMany(HouseholdInvite, {
			foreignKey: 'household_id',
			as: 'invites',
		});

		WatchedTogether.belongsTo(Household, {
			foreignKey: 'household_id',
			as: 'household',
		});
		Household.hasMany(WatchedTogether, {
			foreignKey: 'household_id',
			as: 'watchedTogether',
		});

		// Subscription association (one per household)
		Subscription.belongsTo(Household, {
			foreignKey: 'household_id',
			as: 'household',
		});
		Household.hasOne(Subscription, {
			foreignKey: 'household_id',
			as: 'subscription',
		});

		// Pick usage association
		PickUsage.belongsTo(Household, {
			foreignKey: 'household_id',
			as: 'household',
		});
		Household.hasMany(PickUsage, {
			foreignKey: 'household_id',
			as: 'pickUsages',
		});

		PickEvent.belongsTo(Household, {
			foreignKey: 'household_id',
			as: 'household',
		});
		PickEvent.belongsTo(User, {
			foreignKey: 'user_id',
			as: 'user',
		});
		Household.hasMany(PickEvent, {
			foreignKey: 'household_id',
			as: 'pickEvents',
		});
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
	Household,
	HouseholdMember,
	HouseholdInvite,
	TasteProfile,
	WatchedTogether,
	Subscription,
	PickUsage,
	PickEvent,
};
