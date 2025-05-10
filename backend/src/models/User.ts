import { DataTypes, Model, ModelStatic } from 'sequelize';
import { User as UserInterface } from '../types';

interface UserAttributes extends UserInterface {
	password_hash: string;
	updated_at: Date;
	username: string;
	preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
}

interface UserCreationAttributes {
	email: string;
	password_hash: string;
	username: string;
	preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
}

class User extends Model<UserAttributes, UserCreationAttributes> {
	declare user_id: string;
	declare email: string;
	declare username: string;
	declare password_hash: string;
	declare preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};
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
				email: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: {
						isEmail: true,
					},
				},
				username: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
					validate: {
						len: [3, 30],
						is: /^[a-zA-Z0-9_-]+$/,
					},
				},
				password_hash: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				preferences: {
					type: DataTypes.JSONB,
					allowNull: false,
					defaultValue: {
						theme: 'dark',
						viewStyle: 'grid',
						emailNotifications: true,
						autoArchiveDays: 30,
						favoriteGenres: [],
					},
				},
				created_at: DataTypes.DATE,
				updated_at: DataTypes.DATE,
			},
			{
				sequelize,
				modelName: 'User',
				tableName: 'users',
				timestamps: true,
				underscored: true,
			}
		);
	}
}

export default User;
