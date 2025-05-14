import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

interface AuditLogAttributes {
	log_id: string;
	level: string;
	message: string;
	context: any;
	source: string;
	created_at: Date;
}

interface AuditLogCreationAttributes
	extends Optional<AuditLogAttributes, 'log_id' | 'created_at'> {}

export class AuditLog extends Model<
	AuditLogAttributes,
	AuditLogCreationAttributes
> {
	declare log_id: string;
	declare level: string;
	declare message: string;
	declare context: any;
	declare source: string;
	declare created_at: Date;

	static initialize(sequelize: Sequelize) {
		AuditLog.init(
			{
				log_id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				level: {
					type: DataTypes.STRING(10),
					allowNull: false,
					validate: {
						isIn: [['info', 'warn', 'error', 'debug']],
					},
				},
				message: {
					type: DataTypes.STRING(255),
					allowNull: false,
				},
				context: {
					type: DataTypes.JSONB,
					allowNull: true,
				},
				source: {
					type: DataTypes.STRING(100),
					allowNull: false,
				},
				created_at: {
					type: DataTypes.DATE,
					defaultValue: DataTypes.NOW,
				},
			},
			{
				sequelize,
				tableName: 'audit_logs',
				timestamps: false,
				underscored: true,
			}
		);
	}
}

export default AuditLog;
