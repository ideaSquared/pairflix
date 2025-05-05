import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';
import User from './User';

class WatchlistEntry extends Model {
	declare entry_id: string;
	declare user_id: string;
	declare tmdb_id: number;
	declare media_type: 'movie' | 'tv';
	declare status: 'to_watch' | 'watching' | 'finished';
	declare rating: number | null;
	declare notes: string | null;
	declare created_at: Date;
	declare updated_at: Date;
}

WatchlistEntry.init(
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
			type: DataTypes.ENUM('to_watch', 'watching', 'finished'),
			allowNull: false,
		},
		rating: {
			type: DataTypes.INTEGER,
			allowNull: true,
			validate: {
				min: 0,
				max: 10,
			},
		},
		notes: {
			type: DataTypes.TEXT,
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
		modelName: 'WatchlistEntry',
		tableName: 'watchlist_entries',
		timestamps: true,
		createdAt: 'created_at',
		updatedAt: 'updated_at',
	}
);

WatchlistEntry.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(WatchlistEntry, { foreignKey: 'user_id' });

export default WatchlistEntry;
