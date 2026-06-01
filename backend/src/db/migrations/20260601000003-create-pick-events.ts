import { DataTypes, type QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;

	await sequelize.transaction(async transaction => {
		await queryInterface.createTable(
			'pick_events',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: sequelize.literal('gen_random_uuid()'),
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: 'households', key: 'id' },
					onDelete: 'CASCADE',
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: true,
					references: { model: 'users', key: 'user_id' },
					onDelete: 'SET NULL',
				},
				tmdb_id: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				media_type: {
					type: DataTypes.ENUM('movie', 'tv'),
					allowNull: false,
				},
				kind: {
					type: DataTypes.ENUM(
						'proposed',
						'accepted',
						'swapped',
						'dismissed',
						'provider_launched'
					),
					allowNull: false,
				},
				mood: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				minutes_budget: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
				provider_slug: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				region: {
					type: DataTypes.STRING(2),
					allowNull: true,
				},
				occurred_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: sequelize.literal('NOW()'),
				},
			},
			{ transaction }
		);

		await queryInterface.addIndex('pick_events', {
			name: 'pick_events_household_occurred_at_idx',
			fields: [
				{ name: 'household_id' },
				{ name: 'occurred_at', order: 'DESC' },
			],
			transaction,
		});

		await queryInterface.addIndex('pick_events', {
			name: 'pick_events_household_kind_idx',
			fields: ['household_id', 'kind'],
			transaction,
		});
	});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.dropTable('pick_events');
	await queryInterface.sequelize.query(
		'DROP TYPE IF EXISTS "enum_pick_events_kind";'
	);
	await queryInterface.sequelize.query(
		'DROP TYPE IF EXISTS "enum_pick_events_media_type";'
	);
}
