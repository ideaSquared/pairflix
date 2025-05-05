import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';
import User from './User';

class Match extends Model {
    declare match_id: string;
    declare user1_id: string;
    declare user2_id: string;
    declare status: 'pending' | 'accepted' | 'rejected';
    declare created_at: Date;
    declare updated_at: Date;
}

Match.init(
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

// Set up associations
Match.belongsTo(User, { as: 'user1', foreignKey: 'user1_id' });
Match.belongsTo(User, { as: 'user2', foreignKey: 'user2_id' });
User.hasMany(Match, { as: 'initiatedMatches', foreignKey: 'user1_id' });
User.hasMany(Match, { as: 'receivedMatches', foreignKey: 'user2_id' });

export default Match;