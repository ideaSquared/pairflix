import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import User from './User';
import WatchlistEntry from './WatchlistEntry';

type MatchStatus = 'pending' | 'accepted' | 'rejected';

interface MatchAttributes {
	match_id: string;
	user1_id: string;
	user2_id: string;
	entry_id: string | null;
	status: MatchStatus;
	created_at: Date;
	updated_at: Date;
}

interface MatchCreationAttributes {
	user1_id: string;
	user2_id: string;
	entry_id?: string;
	status?: MatchStatus;
}

class Match extends Model<MatchAttributes, MatchCreationAttributes> {
	declare match_id: string;

	declare user1_id: string;

	declare user2_id: string;

	declare entry_id: string | null;

	declare status: MatchStatus;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<Match> {
		return Match.init(
			{
				match_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				user1_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				user2_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				entry_id: {
					type: DataTypes.UUID,
					allowNull: true,
					references: {
						model: WatchlistEntry,
						key: 'entry_id',
					},
				},
				status: {
					type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
					allowNull: false,
					defaultValue: 'pending',
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
				modelName: 'Match',
				tableName: 'matches',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default Match;
