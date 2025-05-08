import { DataTypes, Model, ModelStatic } from 'sequelize';
import { User as UserInterface } from '../types';

interface UserAttributes extends UserInterface {
	password_hash: string;
	updated_at: Date;
	username: string;
}

interface UserCreationAttributes {
	email: string;
	password_hash: string;
	username: string;
}

class User extends Model<UserAttributes, UserCreationAttributes> {
	declare user_id: string;
	declare email: string;
	declare username: string;
	declare password_hash: string;
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: any): ModelStatic<User> {
		return User.init(
			{
				user_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				username: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: {
						len: [3, 30],
						is: /^[a-zA-Z0-9_-]+$/,
						notNull: {
							msg: 'Username is required',
						},
					},
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
				updated_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'User',
				tableName: 'users',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default User;
