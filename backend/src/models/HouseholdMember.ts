// TODO: replace on merge with Phase A's full HouseholdMember model.
import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';
import User from './User';

interface HouseholdMemberAttributes {
	id: string;
	household_id: string;
	user_id: string;
	role: 'owner' | 'member';
	created_at: Date;
}

interface HouseholdMemberCreationAttributes {
	household_id: string;
	user_id: string;
	role?: 'owner' | 'member';
}

class HouseholdMember extends Model<
	HouseholdMemberAttributes,
	HouseholdMemberCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare user_id: string;

	declare role: 'owner' | 'member';

	declare created_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<HouseholdMember> {
		return HouseholdMember.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: Household, key: 'household_id' },
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: User, key: 'user_id' },
				},
				role: {
					type: DataTypes.ENUM('owner', 'member'),
					allowNull: false,
					defaultValue: 'member',
				},
				created_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'HouseholdMember',
				tableName: 'household_members',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: false,
				indexes: [{ unique: true, fields: ['household_id', 'user_id'] }],
			}
		);
	}
}

export default HouseholdMember;
