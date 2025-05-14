import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import User from './User';

interface ActivityLogAttributes {
	log_id: string;
	user_id: string;
	action: string;
	metadata?: any;
	created_at: Date;
}

interface ActivityLogCreationAttributes
	extends Optional<ActivityLogAttributes, 'log_id' | 'created_at'> {}

export class ActivityLog extends Model<
	ActivityLogAttributes,
	ActivityLogCreationAttributes
> {
	declare log_id: string;
	declare user_id: string;
	declare action: string;
	declare metadata: any;
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
				metadata: {
					type: DataTypes.JSONB,
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
