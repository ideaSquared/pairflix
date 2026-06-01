import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';

interface HouseholdAttributes {
	id: string;
	name: string | null;
	created_at: Date;
	updated_at: Date;
}

interface HouseholdCreationAttributes {
	name?: string | null;
}

class Household extends Model<
	HouseholdAttributes,
	HouseholdCreationAttributes
> {
	declare id: string;

	declare name: string | null;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<Household> {
		return Household.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING,
					allowNull: true,
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
