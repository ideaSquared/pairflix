import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';
import User from './User';

interface HouseholdInviteAttributes {
	id: string;
	household_id: string;
	token: string;
	invited_email: string | null;
	invited_by: string;
	expires_at: Date;
	accepted_at: Date | null;
	accepted_by: string | null;
	created_at: Date;
}

interface HouseholdInviteCreationAttributes {
	household_id: string;
	token: string;
	invited_email?: string | null;
	invited_by: string;
	expires_at: Date;
	accepted_at?: Date | null;
	accepted_by?: string | null;
}

class HouseholdInvite extends Model<
	HouseholdInviteAttributes,
	HouseholdInviteCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare token: string;

	declare invited_email: string | null;

	declare invited_by: string;

	declare expires_at: Date;

	declare accepted_at: Date | null;

	declare accepted_by: string | null;

	declare created_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<HouseholdInvite> {
		return HouseholdInvite.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: Household, key: 'id' },
					onDelete: 'CASCADE',
				},
				token: {
					type: DataTypes.STRING(64),
					allowNull: false,
					unique: true,
				},
				invited_email: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				invited_by: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: User, key: 'user_id' },
				},
				expires_at: {
					type: DataTypes.DATE,
					allowNull: false,
				},
				accepted_at: {
					type: DataTypes.DATE,
					allowNull: true,
				},
				accepted_by: {
					type: DataTypes.UUID,
					allowNull: true,
					references: { model: User, key: 'user_id' },
				},
				created_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'HouseholdInvite',
				tableName: 'household_invites',
				timestamps: false,
				indexes: [
					{ fields: ['token'], unique: true },
					{ fields: ['household_id'] },
				],
			}
		);
	}
}

export default HouseholdInvite;
