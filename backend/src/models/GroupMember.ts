import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Group from './Group';
import User from './User';

type MemberRole = 'owner' | 'admin' | 'member';
type MemberStatus = 'pending' | 'active' | 'inactive' | 'removed';

interface GroupMemberAttributes {
	membership_id: string;
	group_id: string;
	user_id: string;
	role: MemberRole;
	status: MemberStatus;
	joined_at: Date;
	invited_by?: string;
	created_at: Date;
	updated_at: Date;
}

interface GroupMemberCreationAttributes {
	group_id: string;
	user_id: string;
	role?: MemberRole;
	status?: MemberStatus;
	invited_by?: string;
}

class GroupMember extends Model<
	GroupMemberAttributes,
	GroupMemberCreationAttributes
> {
	declare membership_id: string;
	declare group_id: string;
	declare user_id: string;
	declare role: MemberRole;
	declare status: MemberStatus;
	declare joined_at: Date;
	declare invited_by: string | null;
	declare created_at: Date;
	declare updated_at: Date;

	// Association properties
	declare group?: Group;
	declare user?: User;
	declare inviter?: User;

	static initialize(sequelize: Sequelize): ModelStatic<GroupMember> {
		return GroupMember.init(
			{
				membership_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				group_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: Group,
						key: 'group_id',
					},
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				role: {
					type: DataTypes.ENUM('owner', 'admin', 'member'),
					allowNull: false,
					defaultValue: 'member',
				},
				status: {
					type: DataTypes.ENUM('pending', 'active', 'inactive', 'removed'),
					allowNull: false,
					defaultValue: 'pending',
				},
				joined_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
				invited_by: {
					type: DataTypes.UUID,
					allowNull: true,
					references: {
						model: User,
						key: 'user_id',
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
				modelName: 'GroupMember',
				tableName: 'group_members',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
				indexes: [
					{
						unique: true,
						fields: ['group_id', 'user_id'],
					},
				],
			}
		);
	}
}

export default GroupMember;
