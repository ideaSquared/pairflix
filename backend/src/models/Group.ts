import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import User from './User';

type GroupType = 'couple' | 'friends' | 'watch_party';
type GroupStatus = 'active' | 'inactive' | 'archived';

interface GroupAttributes {
	group_id: string;
	name: string;
	description?: string;
	type: GroupType;
	status: GroupStatus;
	created_by: string;
	max_members?: number;
	settings: {
		isPublic: boolean;
		requireApproval: boolean;
		allowInvites: boolean;
		scheduleSettings?: {
			recurringDay?: string; // 'monday', 'tuesday', etc. for weekly watch parties
			recurringTime?: string; // '19:00' format
		};
	};
	created_at: Date;
	updated_at: Date;
}

interface GroupCreationAttributes {
	name: string;
	description?: string;
	type: GroupType;
	created_by: string;
	max_members?: number;
	settings?: {
		isPublic?: boolean;
		requireApproval?: boolean;
		allowInvites?: boolean;
		scheduleSettings?: {
			recurringDay?: string;
			recurringTime?: string;
		};
	};
	status?: GroupStatus;
}

class Group extends Model<GroupAttributes, GroupCreationAttributes> {
	declare group_id: string;
	declare name: string;
	declare description: string | null;
	declare type: GroupType;
	declare status: GroupStatus;
	declare created_by: string;
	declare max_members: number | null;
	declare settings: GroupAttributes['settings'];
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<Group> {
		return Group.init(
			{
				group_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING(100),
					allowNull: false,
				},
				description: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				type: {
					type: DataTypes.ENUM('couple', 'friends', 'watch_party'),
					allowNull: false,
				},
				status: {
					type: DataTypes.ENUM('active', 'inactive', 'archived'),
					allowNull: false,
					defaultValue: 'active',
				},
				created_by: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				max_members: {
					type: DataTypes.INTEGER,
					allowNull: true,
					validate: {
						min: 2,
						max: 50, // Reasonable limit for watch parties
					},
				},
				settings: {
					type: DataTypes.JSONB,
					allowNull: false,
					defaultValue: {
						isPublic: false,
						requireApproval: true,
						allowInvites: true,
					},
				},
				created_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
				updated_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'Group',
				tableName: 'groups',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default Group;
