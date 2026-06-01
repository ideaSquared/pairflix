// TODO: replace with Phase A model on merge
import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

interface HouseholdAttributes {
	id: string;
	name: string;
	created_at: Date;
	updated_at: Date;
}

type HouseholdCreationAttributes = Optional<
	HouseholdAttributes,
	'id' | 'created_at' | 'updated_at'
>;

class Household extends Model<
	HouseholdAttributes,
	HouseholdCreationAttributes
> {
	declare id: string;

	declare name: string;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize) {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to Household.initialize().'
			);
		}

		return Household.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING,
					allowNull: false,
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
				tableName: 'households',
				modelName: 'Household',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

// TODO: replace with Phase A model on merge
interface HouseholdMemberAttributes {
	id: string;
	household_id: string;
	user_id: string;
	created_at: Date;
}

type HouseholdMemberCreationAttributes = Optional<
	HouseholdMemberAttributes,
	'id' | 'created_at'
>;

class HouseholdMember extends Model<
	HouseholdMemberAttributes,
	HouseholdMemberCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare user_id: string;

	declare created_at: Date;

	static initialize(sequelize: Sequelize) {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to HouseholdMember.initialize().'
			);
		}

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
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
				},
				created_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				tableName: 'household_members',
				modelName: 'HouseholdMember',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: false,
			}
		);
	}
}

export { Household, HouseholdMember };
export default Household;
