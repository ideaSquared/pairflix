import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';
import User from './User';

export interface TasteWeights {
	genres?: Record<string, number>;
	runtime_pref?: number | null;
	era?: Record<string, number>;
	tone?: Record<string, number>;
}

interface TasteProfileAttributes {
	user_id: string;
	weights: TasteWeights;
	embedding: number[] | null;
	updated_at: Date;
}

interface TasteProfileCreationAttributes {
	user_id: string;
	weights?: TasteWeights;
	embedding?: number[] | null;
}

class TasteProfile extends Model<
	TasteProfileAttributes,
	TasteProfileCreationAttributes
> {
	declare user_id: string;

	declare weights: TasteWeights;

	declare embedding: number[] | null;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<TasteProfile> {
		return TasteProfile.init(
			{
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				weights: {
					type: DataTypes.JSONB,
					allowNull: false,
					defaultValue: {},
				},
				embedding: {
					type: DataTypes.JSONB,
					allowNull: true,
				},
				updated_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				modelName: 'TasteProfile',
				tableName: 'taste_profiles',
				timestamps: true,
				createdAt: false,
				updatedAt: 'updated_at',
			}
		);
	}
}

export default TasteProfile;
