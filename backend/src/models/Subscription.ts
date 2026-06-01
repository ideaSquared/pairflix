import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import Household from './Household';

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled';

interface SubscriptionAttributes {
	id: string;
	household_id: string;
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	stripe_customer_id: string | null;
	stripe_subscription_id: string | null;
	current_period_end: Date | null;
	created_at: Date;
	updated_at: Date;
}

interface SubscriptionCreationAttributes {
	household_id: string;
	tier?: SubscriptionTier;
	status?: SubscriptionStatus;
	stripe_customer_id?: string | null;
	stripe_subscription_id?: string | null;
	current_period_end?: Date | null;
}

class Subscription extends Model<
	SubscriptionAttributes,
	SubscriptionCreationAttributes
> {
	declare id: string;

	declare household_id: string;

	declare tier: SubscriptionTier;

	declare status: SubscriptionStatus;

	declare stripe_customer_id: string | null;

	declare stripe_subscription_id: string | null;

	declare current_period_end: Date | null;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<Subscription> {
		return Subscription.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					unique: true,
					references: { model: Household, key: 'id' },
				},
				tier: {
					type: DataTypes.ENUM('free', 'premium'),
					allowNull: false,
					defaultValue: 'free',
				},
				status: {
					type: DataTypes.ENUM('active', 'past_due', 'canceled'),
					allowNull: false,
					defaultValue: 'active',
				},
				stripe_customer_id: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				stripe_subscription_id: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				current_period_end: {
					type: DataTypes.DATE,
					allowNull: true,
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
				modelName: 'Subscription',
				tableName: 'subscriptions',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default Subscription;
