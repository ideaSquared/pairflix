import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';

interface UserSessionAttributes {
	session_id: string;
	user_id: string;
	token_hash: string;
	device_info?: string;
	ip_address?: string;
	user_agent?: string;
	expires_at: Date;
	last_activity: Date;
	created_at: Date;
	updated_at: Date;
}

interface UserSessionCreationAttributes {
	user_id: string;
	token_hash: string;
	device_info?: string;
	ip_address?: string;
	user_agent?: string;
	expires_at: Date;
	last_activity?: Date;
}

class UserSession extends Model<
	UserSessionAttributes,
	UserSessionCreationAttributes
> {
	declare session_id: string;
	declare user_id: string;
	declare token_hash: string;
	declare device_info?: string;
	declare ip_address?: string;
	declare user_agent?: string;
	declare expires_at: Date;
	declare last_activity: Date;
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<UserSession> {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to UserSession.initialize(). ' +
					'Make sure the Sequelize instance is properly configured.'
			);
		}

		return UserSession.init(
			{
				session_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: 'users',
						key: 'user_id',
					},
				},
				token_hash: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				device_info: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				ip_address: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				user_agent: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				expires_at: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				last_activity: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
				created_at: DataTypes.DATE,
				updated_at: DataTypes.DATE,
			},
			{
				sequelize,
				modelName: 'UserSession',
				tableName: 'user_sessions',
				timestamps: true,
				underscored: true,
				indexes: [
					{
						fields: ['user_id'],
					},
					{
						fields: ['expires_at'],
					},
					{
						fields: ['token_hash'],
					},
				],
			}
		);
	}
}

export default UserSession;
