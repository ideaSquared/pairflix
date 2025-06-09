import { DataTypes, Model, type ModelStatic, type Sequelize } from 'sequelize';

// Type for JSON values that can be stored in JSONB
type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

// Interface that defines the structure of AppSettings
interface AppSettingsAttributes {
	key: string;
	value: JsonValue;
	category: string;
	description: string | null;
	created_at: Date;
	updated_at: Date;
}

// Interface for creation attributes where some fields are optional
interface AppSettingsCreationAttributes {
	key: string;
	value: JsonValue;
	category: string;
	description?: string | null;
}

class AppSettings extends Model<
	AppSettingsAttributes,
	AppSettingsCreationAttributes
> {
	declare key: string;

	declare value: JsonValue;

	declare category: string;

	declare description: string | null;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize): ModelStatic<AppSettings> {
		return AppSettings.init(
			{
				key: {
					type: DataTypes.STRING,
					allowNull: false,
					primaryKey: true,
				},
				value: {
					type: DataTypes.JSONB,
					allowNull: false,
				},
				category: {
					type: DataTypes.STRING,
					allowNull: false,
					defaultValue: 'general',
				},
				description: {
					type: DataTypes.STRING,
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
				modelName: 'AppSettings',
				tableName: 'app_settings',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default AppSettings;
