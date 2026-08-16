import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';

interface PasswordResetAttributes {
	id: string;
	user_id: string;
	token: string;
	expires_at: Date;
	used: boolean;
	forced_by_admin?: boolean;
	created_at: Date;
	updated_at: Date;
}

interface PasswordResetCreationAttributes {
	user_id: string;
	token: string;
	expires_at: Date;
	used?: boolean;
	forced_by_admin?: boolean;
}

class PasswordReset extends Model<
	PasswordResetAttributes,
	PasswordResetCreationAttributes
> {
	declare id: string;
	declare user_id: string;
	declare token: string;
	declare expires_at: Date;
	declare used: boolean;
	declare forced_by_admin?: boolean;
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<PasswordReset> {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to PasswordReset.initialize(). ' +
					'Make sure the Sequelize instance is properly configured.'
			);
		}

		return PasswordReset.init(
			{
				id: {
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
				token: {
					type: DataTypes.STRING,
					allowNull: false,
					unique: true,
				},
				expires_at: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				used: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				forced_by_admin: {
					type: DataTypes.BOOLEAN,
					allowNull: true,
				},
				created_at: DataTypes.DATE,
				updated_at: DataTypes.DATE,
			},
			{
				sequelize,
				modelName: 'PasswordReset',
				tableName: 'password_resets',
				timestamps: true,
				underscored: true,
			}
		);
	}
}

export default PasswordReset;
