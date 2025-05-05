import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/connection';

class User extends Model {
	declare user_id: string;
	declare email: string;
	declare password_hash: string;
	declare created_at: Date;
}

User.init(
	{
		user_id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		password_hash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		created_at: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		sequelize,
		modelName: 'User',
		tableName: 'users',
		timestamps: false,
	}
);

export default User;
