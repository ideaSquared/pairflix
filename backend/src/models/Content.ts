import { DataTypes, Model, type Optional, type Sequelize } from 'sequelize';
import type { ProvidersByRegion } from '../services/tmdb.service';

// TODO: replace with Phase A model on merge
export interface ContentProviders {
	last_updated_at: string;
	regions: ProvidersByRegion;
}

interface ContentAttributes {
	id: string;
	title: string;
	type: 'movie' | 'show' | 'episode';
	status: 'active' | 'pending' | 'flagged' | 'removed';
	tmdb_id: number;
	media_type?: 'movie' | 'tv';
	year?: number | null;
	poster_path?: string | null;
	reported_count: number;
	removal_reason?: string;
	providers?: ContentProviders | null;
	created_at: Date;
	updated_at: Date;
}

type ContentCreationAttributes = Optional<
	ContentAttributes,
	| 'id'
	| 'reported_count'
	| 'created_at'
	| 'updated_at'
	| 'removal_reason'
	| 'media_type'
	| 'year'
	| 'poster_path'
	| 'providers'
>;

class Content extends Model<ContentAttributes, ContentCreationAttributes> {
	declare id: string;

	declare title: string;

	declare type: 'movie' | 'show' | 'episode';

	declare status: 'active' | 'pending' | 'flagged' | 'removed';

	declare tmdb_id: number;

	declare reported_count: number;

	declare removal_reason?: string;

	declare media_type?: 'movie' | 'tv';

	declare year?: number | null;

	declare poster_path?: string | null;

	declare providers?: ContentProviders | null;

	declare created_at: Date;

	declare updated_at: Date;

	static initialize(sequelize: Sequelize) {
		if (!sequelize || typeof sequelize.define !== 'function') {
			throw new Error(
				'Invalid Sequelize instance provided to Content.initialize(). ' +
					'Make sure the Sequelize instance is properly configured.'
			);
		}

		return Content.init(
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				title: {
					type: DataTypes.STRING,
					allowNull: false,
				},
				type: {
					type: DataTypes.ENUM('movie', 'show', 'episode'),
					allowNull: false,
				},
				status: {
					type: DataTypes.ENUM('active', 'pending', 'flagged', 'removed'),
					allowNull: false,
					defaultValue: 'pending',
				},
				tmdb_id: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				reported_count: {
					type: DataTypes.INTEGER,
					allowNull: false,
					defaultValue: 0,
				},
				removal_reason: {
					type: DataTypes.TEXT,
					allowNull: true,
				},
				media_type: {
					type: DataTypes.ENUM('movie', 'tv'),
					allowNull: true,
				},
				year: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				poster_path: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				providers: {
					type: DataTypes.JSONB,
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
				tableName: 'content',
				modelName: 'Content',
				timestamps: true,
				createdAt: 'created_at',
				updatedAt: 'updated_at',
			}
		);
	}
}

export default Content;
