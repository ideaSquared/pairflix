import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';
import User from './User';

export type PickEventKind =
	'proposed' | 'accepted' | 'swapped' | 'dismissed' | 'provider_launched';

interface PickEventAttributes {
	id: string;
	household_id: string;
	user_id: string | null;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	kind: PickEventKind;
	mood: string | null;
	minutes_budget: number | null;
	provider_slug: string | null;
	region: string | null;
	occurred_at: Date;
}

interface PickEventCreationAttributes {
	household_id: string;
	user_id?: string | null;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	kind: PickEventKind;
	mood?: string | null;
	minutes_budget?: number | null;
	provider_slug?: string | null;
	region?: string | null;
	occurred_at?: Date;
}

class PickEvent extends Model<
	PickEventAttributes,
	PickEventCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare user_id: string | null;

	declare tmdb_id: number;

	declare media_type: 'movie' | 'tv';

	declare kind: PickEventKind;

	declare mood: string | null;

	declare minutes_budget: number | null;

	declare provider_slug: string | null;

	declare region: string | null;

	declare occurred_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<PickEvent> {
		return PickEvent.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: Household, key: 'id' },
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: true,
					references: { model: User, key: 'user_id' },
				},
				tmdb_id: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				media_type: {
					type: DataTypes.ENUM('movie', 'tv'),
					allowNull: false,
				},
				kind: {
					type: DataTypes.ENUM(
						'proposed',
						'accepted',
						'swapped',
						'dismissed',
						'provider_launched'
					),
					allowNull: false,
				},
				mood: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				minutes_budget: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				provider_slug: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				region: {
					type: DataTypes.STRING(2),
					allowNull: true,
				},
				occurred_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'PickEvent',
				tableName: 'pick_events',
				timestamps: false,
				indexes: [
					{
						name: 'pick_events_household_occurred_at_idx',
						fields: [
							{ name: 'household_id' },
							{ name: 'occurred_at', order: 'DESC' },
						],
					},
					{
						name: 'pick_events_household_kind_idx',
						fields: ['household_id', 'kind'],
					},
				],
			}
		);
	}
}

export default PickEvent;
