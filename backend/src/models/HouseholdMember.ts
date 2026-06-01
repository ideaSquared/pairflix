import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';
import User from './User';

type HouseholdRole = 'owner' | 'member';

interface HouseholdMemberAttributes {
	household_id: string;
	user_id: string;
	role: HouseholdRole;
	joined_at: Date;
}

interface HouseholdMemberCreationAttributes {
	household_id: string;
	user_id: string;
	role?: HouseholdRole;
	joined_at?: Date;
}

class HouseholdMember extends Model<
	HouseholdMemberAttributes,
	HouseholdMemberCreationAttributes
> {
	declare household_id: string;

	declare user_id: string;

	declare role: HouseholdRole;

	declare joined_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<HouseholdMember> {
		return HouseholdMember.init(
			{
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					references: {
						model: Household,
						key: 'id',
					},
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				role: {
					type: DataTypes.ENUM('owner', 'member'),
					allowNull: false,
					defaultValue: 'member',
				},
				joined_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'HouseholdMember',
				tableName: 'household_members',
				timestamps: false,
			}
		);
	}
}

export default HouseholdMember;
