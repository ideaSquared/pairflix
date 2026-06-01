// TODO: replace on merge with Phase A's full Household model.
import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import User from './User';

interface HouseholdAttributes {
	household_id: string;
	owner_id: string;
	name: string;
	created_at: Date;
	updated_at: Date;
}

interface HouseholdCreationAttributes {
	owner_id: string;
	name: string;
}

class Household extends Model<HouseholdAttributes, HouseholdCreationAttributes> {
	declare household_id: string;

	declare owner_id: string;

	declare name: string;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<Household> {
		return Household.init(
			{
				household_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				owner_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: User, key: 'user_id' },
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
				modelName: 'Household',
				tableName: 'households',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default Household;
