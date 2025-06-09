import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import type { WatchlistEntry as WatchlistEntryInterface } from '../types';
import User from './User';

interface WatchlistEntryAttributes extends WatchlistEntryInterface {
	entry_id: string;
	created_at: Date;
	updated_at: Date;
}

interface WatchlistEntryCreationAttributes {
	user_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status: WatchlistEntryInterface['status'];
	rating?: number;
	notes?: string;
	tags?: string[];
}

class WatchlistEntry extends Model<
	WatchlistEntryAttributes,
	WatchlistEntryCreationAttributes
> {
	declare entry_id: string;

	declare user_id: string;

	declare tmdb_id: number;

	declare media_type: 'movie' | 'tv';

	declare status: WatchlistEntryInterface['status'];

	declare rating?: number;

	declare notes?: string;

	declare tags?: string[];

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<WatchlistEntry> {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to WatchlistEntry.initialize(). ' +
					'Make sure the Sequelize instance is properly configured.'
			);
		}

		return WatchlistEntry.init(
			{
				entry_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
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
				status: {
					type: DataTypes.ENUM(
						'to_watch',
						'watch_together_focused',
						'watch_together_background',
						'watching',
						'finished',
						'flagged',
						'removed',
						'active'
					),
					allowNull: false,
					defaultValue: 'to_watch',
				},
				rating: {
					type: DataTypes.INTEGER,
					allowNull: true,
					validate: {
						min: 1,
						max: 5,
					},
				},
				notes: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				tags: {
					type: DataTypes.ARRAY(DataTypes.STRING),
					allowNull: true,
					defaultValue: [],
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
				modelName: 'WatchlistEntry',
				tableName: 'watchlist_entries',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default WatchlistEntry;
