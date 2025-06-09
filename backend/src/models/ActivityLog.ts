import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';
import User from './User';

// Base interface with all properties required
interface ActivityLogAttributes {
	log_id: string;
	user_id: string;
	action: string;
	context: string;
	metadata?: Record<string, unknown>;
	ip_address: string | null; // Using null instead of undefined for DB fields
	user_agent: string | null; // Using null instead of undefined for DB fields
	created_at: Date;
}

// Interface for creation where some fields are optional
type ActivityLogCreationAttributes = Optional<
	ActivityLogAttributes,
	'log_id' | 'created_at' | 'context' | 'metadata' | 'ip_address' | 'user_agent'
>;

export class ActivityLog extends Model<
	ActivityLogAttributes,
	ActivityLogCreationAttributes
> {
	declare log_id: string;

	declare user_id: string;

	declare action: string;

	declare context: string;

	declare metadata: Record<string, unknown>;

	declare ip_address: string | null;

	declare user_agent: string | null;

	declare created_at: Date;

	static initialize(sequelize: Sequelize) {
		ActivityLog.init(
			{
				log_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: 'users',
						key: 'user_id',
					},
				},
				action: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				context: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: 'system', // Default context
				},
				metadata: {
					type: DataTypes.JSONB,
					allowNull: true,
				},
				ip_address: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				user_agent: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				created_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				tableName: 'activity_log',
				timestamps: false,
				underscored: true,
			}
		);

		// Define associations
		ActivityLog.belongsTo(User, {
			foreignKey: 'user_id',
			as: 'user',
		});

		User.hasMany(ActivityLog, {
			foreignKey: 'user_id',
			as: 'activities',
		});
	}
}

export default ActivityLog;
