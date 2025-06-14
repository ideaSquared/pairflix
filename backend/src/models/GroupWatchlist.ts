import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Group from './Group';
import User from './User';

type GroupWatchlistStatus =
	| 'suggested'
	| 'voting'
	| 'approved'
	| 'watching'
	| 'finished'
	| 'rejected';

interface GroupWatchlistAttributes {
	group_entry_id: string;
	group_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status: GroupWatchlistStatus;
	suggested_by: string;
	votes_for: number;
	votes_against: number;
	notes?: string;
	scheduled_date?: Date;
	created_at: Date;
	updated_at: Date;
}

interface GroupWatchlistCreationAttributes {
	group_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	suggested_by: string;
	status?: GroupWatchlistStatus;
	notes?: string;
	scheduled_date?: Date;
}

class GroupWatchlist extends Model<
	GroupWatchlistAttributes,
	GroupWatchlistCreationAttributes
> {
	declare group_entry_id: string;
	declare group_id: string;
	declare tmdb_id: number;
	declare media_type: 'movie' | 'tv';
	declare status: GroupWatchlistStatus;
	declare suggested_by: string;
	declare votes_for: number;
	declare votes_against: number;
	declare notes: string | null;
	declare scheduled_date: Date | null;
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<GroupWatchlist> {
		return GroupWatchlist.init(
			{
				group_entry_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				group_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: Group,
						key: 'group_id',
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
						'suggested',
						'voting',
						'approved',
						'watching',
						'finished',
						'rejected'
					),
					allowNull: false,
					defaultValue: 'suggested',
				},
				suggested_by: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				votes_for: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				votes_against: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				notes: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				scheduled_date: {
					type: DataTypes.DATE,
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
				modelName: 'GroupWatchlist',
				tableName: 'group_watchlist',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
				indexes: [
					{
						unique: true,
						fields: ['group_id', 'tmdb_id'],
					},
				],
			}
		);
	}
}

export default GroupWatchlist;
