import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';

interface EmailVerificationAttributes {
	id: string;
	user_id: string;
	token: string;
	expires_at: Date;
	verified: boolean;
	created_at: Date;
	updated_at: Date;
}

interface EmailVerificationCreationAttributes {
	user_id: string;
	token: string;
	expires_at: Date;
	verified?: boolean;
}

class EmailVerification extends Model<
	EmailVerificationAttributes,
	EmailVerificationCreationAttributes
> {
	declare id: string;
	declare user_id: string;
	declare token: string;
	declare expires_at: Date;
	declare verified: boolean;
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<EmailVerification> {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to EmailVerification.initialize(). ' +
					'Make sure the Sequelize instance is properly configured.'
			);
		}

		return EmailVerification.init(
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
				verified: {
					type: DataTypes.BOOLEAN,
					allowNull: false,
					defaultValue: false,
				},
				created_at: DataTypes.DATE,
				updated_at: DataTypes.DATE,
			},
			{
				sequelize,
				modelName: 'EmailVerification',
				tableName: 'email_verifications',
				timestamps: true,
				underscored: true,
			}
		);
	}
}

export default EmailVerification;
