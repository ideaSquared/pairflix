import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';

interface PickUsageAttributes {
	id: string;
	household_id: string;
	picked_at: Date;
}

interface PickUsageCreationAttributes {
	household_id: string;
	picked_at?: Date;
}

class PickUsage extends Model<
	PickUsageAttributes,
	PickUsageCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare picked_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<PickUsage> {
		return PickUsage.init(
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
				picked_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'PickUsage',
				tableName: 'pick_usage',
				timestamps: false,
				indexes: [
					{
						name: 'pick_usage_household_picked_at_idx',
						fields: [
							{ name: 'household_id' },
							{ name: 'picked_at', order: 'DESC' },
						],
					},
				],
			}
		);
	}
}

export default PickUsage;
