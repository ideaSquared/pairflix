import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import type { User as UserInterface } from '../types';

interface UserAttributes extends UserInterface {
	password_hash: string;
	updated_at: Date;
	username: string;
	role: string;
	status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	email_verified: boolean;
	failed_login_attempts: number;
	locked_until?: Date;
	last_login?: Date;
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
	role?: string;
	status?: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	email_verified?: boolean;
	failed_login_attempts?: number;
	locked_until?: Date;
	last_login?: Date;
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

	declare role: string;

	declare status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

	declare email_verified: boolean;

	declare failed_login_attempts: number;

	declare locked_until?: Date;

	declare last_login?: Date;

	declare preferences: {
		theme: 'light' | 'dark';
		viewStyle: 'list' | 'grid';
		emailNotifications: boolean;
		autoArchiveDays: number;
		favoriteGenres: string[];
	};

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<User> {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to User.initialize(). ' +
					'Make sure the Sequelize instance is properly configured.'
			);
		}

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
				role: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: 'user',
				},
				status: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: 'active',
					validate: {
						isIn: [['active', 'inactive', 'pending', 'suspended', 'banned']],
					},
				},
				email_verified: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				failed_login_attempts: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				locked_until: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				last_login: {
					type: DataTypes.DATE,
					allowNull: true,
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
