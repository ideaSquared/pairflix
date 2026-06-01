import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';

type WatchedMediaType = 'movie' | 'tv';

interface WatchedTogetherAttributes {
	id: string;
	household_id: string;
	tmdb_id: number;
	media_type: WatchedMediaType;
	watched_at: Date;
	enjoyed: boolean | null;
	mood_at_pick: string | null;
	minutes_budget_at_pick: number | null;
}

interface WatchedTogetherCreationAttributes {
	household_id: string;
	tmdb_id: number;
	media_type: WatchedMediaType;
	watched_at?: Date;
	enjoyed?: boolean | null;
	mood_at_pick?: string | null;
	minutes_budget_at_pick?: number | null;
}

class WatchedTogether extends Model<
	WatchedTogetherAttributes,
	WatchedTogetherCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare tmdb_id: number;

	declare media_type: WatchedMediaType;

	declare watched_at: Date;

	declare enjoyed: boolean | null;

	declare mood_at_pick: string | null;

	declare minutes_budget_at_pick: number | null;

	static initialize(sequelize: Sequelize): ModelStatic<WatchedTogether> {
		return WatchedTogether.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: Household,
						key: 'id',
					},
				},
				tmdb_id: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				media_type: {
					type: DataTypes.ENUM('movie', 'tv'),
					allowNull: false,
				},
				watched_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
				enjoyed: {
					type: DataTypes.BOOLEAN,
					allowNull: true,
				},
				mood_at_pick: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				minutes_budget_at_pick: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
			},
			{
				sequelize,
				modelName: 'WatchedTogether',
				tableName: 'watched_together',
				timestamps: false,
				indexes: [
					{
						name: 'idx_watched_together_household_watched_at',
						fields: [
							'household_id',
							{ name: 'watched_at', order: 'DESC' },
						],
					},
					{
						name: 'idx_watched_together_household_tmdb',
						fields: ['household_id', 'tmdb_id'],
					},
				],
			}
		);
	}
}

export default WatchedTogether;
