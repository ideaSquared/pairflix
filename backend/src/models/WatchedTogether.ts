// TODO: replace with Phase A model on merge
import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';

interface WatchedTogetherAttributes {
	id: string;
	household_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	watched_at: Date;
	enjoyed: boolean | null;
	mood_at_pick: string | null;
	minutes_budget_at_pick: number | null;
	created_at: Date;
	updated_at: Date;
}

type WatchedTogetherCreationAttributes = Optional<
	WatchedTogetherAttributes,
	| 'id'
	| 'enjoyed'
	| 'mood_at_pick'
	| 'minutes_budget_at_pick'
	| 'created_at'
	| 'updated_at'
>;

class WatchedTogether extends Model<
	WatchedTogetherAttributes,
	WatchedTogetherCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare tmdb_id: number;

	declare media_type: 'movie' | 'tv';

	declare watched_at: Date;

	declare enjoyed: boolean | null;

	declare mood_at_pick: string | null;

	declare minutes_budget_at_pick: number | null;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize) {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to WatchedTogether.initialize().'
			);
		}

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
				tableName: 'watched_together',
				modelName: 'WatchedTogether',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default WatchedTogether;
