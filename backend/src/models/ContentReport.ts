import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import Content from './Content';
import User from './User';

interface ContentReportAttributes {
	id: string;
	content_id: string;
	user_id: string;
	reason: string;
	details?: string;
	status: 'pending' | 'dismissed' | 'resolved';
	created_at: Date;
	updated_at: Date;
}

type ContentReportCreationAttributes = Optional<
	ContentReportAttributes,
	'id' | 'details' | 'status' | 'created_at' | 'updated_at'
>;

class ContentReport extends Model<
	ContentReportAttributes,
	ContentReportCreationAttributes
> {
	declare id: string;
	declare content_id: string;
	declare user_id: string;
	declare reason: string;
	declare details?: string;
	declare status: 'pending' | 'dismissed' | 'resolved';
	declare created_at: Date;
	declare updated_at: Date;

	static initialize(sequelize: Sequelize) {
		return ContentReport.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				content_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: Content,
						key: 'id',
					},
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: {
						model: User,
						key: 'user_id',
					},
				},
				reason: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				details: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				status: {
					type: DataTypes.ENUM('pending', 'dismissed', 'resolved'),
					allowNull: false,
					defaultValue: 'pending',
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
				tableName: 'content_reports',
				modelName: 'ContentReport',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default ContentReport;
