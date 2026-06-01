import { DataTypes, type QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;

	await sequelize.transaction(async transaction => {
		await queryInterface.createTable(
			'households',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				name: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				created_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
				updated_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{ transaction }
		);

		await queryInterface.createTable(
			'household_members',
			{
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					references: { model: 'households', key: 'id' },
					onDelete: 'CASCADE',
				},
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					references: { model: 'users', key: 'user_id' },
					onDelete: 'CASCADE',
				},
				role: {
					type: DataTypes.ENUM('owner', 'member'),
					allowNull: false,
					defaultValue: 'member',
				},
				joined_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{ transaction }
		);

		await queryInterface.createTable(
			'taste_profiles',
			{
				user_id: {
					type: DataTypes.UUID,
					allowNull: false,
					primaryKey: true,
					references: { model: 'users', key: 'user_id' },
					onDelete: 'CASCADE',
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
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{ transaction }
		);

		await queryInterface.createTable(
			'watched_together',
			{
				id: {
					type: DataTypes.UUID,
					defaultValue: DataTypes.UUIDV4,
					primaryKey: true,
				},
				household_id: {
					type: DataTypes.UUID,
					allowNull: false,
					references: { model: 'households', key: 'id' },
					onDelete: 'CASCADE',
				},
				tmdb_id: {
					type: DataTypes.INTEGER,
					allowNull: false,
				},
				media_type: {
					type: DataTypes.ENUM('movie', 'tv'),
					allowNull: false,
				},
				watched_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
				enjoyed: {
					type: DataTypes.BOOLEAN,
					allowNull: true,
				},
				mood_at_pick: {
					type: DataTypes.STRING,
					allowNull: true,
				},
				minutes_budget_at_pick: {
					type: DataTypes.INTEGER,
					allowNull: true,
				},
			},
			{ transaction }
		);

		await queryInterface.addIndex('watched_together', {
			name: 'idx_watched_together_household_watched_at',
			fields: ['household_id', { name: 'watched_at', order: 'DESC' }],
			transaction,
		});

		await queryInterface.addIndex('watched_together', {
			name: 'idx_watched_together_household_tmdb',
			fields: ['household_id', 'tmdb_id'],
			transaction,
		});

		await queryInterface.addColumn(
			'content',
			'providers',
			{
				type: DataTypes.JSONB,
				allowNull: true,
				defaultValue: {},
			},
			{ transaction }
		);

		await queryInterface.addColumn(
			'content',
			'media_type',
			{
				type: DataTypes.ENUM('movie', 'tv'),
				allowNull: true,
			},
			{ transaction }
		);

		await queryInterface.addColumn(
			'content',
			'year',
			{
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			{ transaction }
		);

		await queryInterface.addColumn(
			'content',
			'poster_path',
			{
				type: DataTypes.STRING,
				allowNull: true,
			},
			{ transaction }
		);

		await sequelize.query(
			`
			INSERT INTO households (id, name, created_at, updated_at)
			SELECT gen_random_uuid(), NULL, NOW(), NOW()
			FROM matches
			WHERE status = 'accepted'
			`,
			{ transaction }
		);

		await sequelize.query(
			`
			WITH accepted AS (
				SELECT
					m.match_id,
					m.user1_id,
					m.user2_id,
					ROW_NUMBER() OVER (ORDER BY m.created_at, m.match_id) AS rn
				FROM matches m
				WHERE m.status = 'accepted'
			),
			new_households AS (
				SELECT
					h.id,
					ROW_NUMBER() OVER (ORDER BY h.created_at, h.id) AS rn
				FROM households h
			)
			INSERT INTO household_members (household_id, user_id, role, joined_at)
			SELECT nh.id, a.user1_id, 'owner', NOW()
			FROM accepted a
			JOIN new_households nh ON nh.rn = a.rn
			UNION ALL
			SELECT nh.id, a.user2_id, 'member', NOW()
			FROM accepted a
			JOIN new_households nh ON nh.rn = a.rn
			ON CONFLICT (household_id, user_id) DO NOTHING
			`,
			{ transaction }
		);

		await sequelize.query(
			`
			INSERT INTO taste_profiles (user_id, weights, embedding, updated_at)
			SELECT u.user_id, '{}'::jsonb, NULL, NOW()
			FROM users u
			ON CONFLICT (user_id) DO NOTHING
			`,
			{ transaction }
		);
	});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;

	await sequelize.transaction(async transaction => {
		await queryInterface.removeColumn('content', 'providers', { transaction });
		await queryInterface.removeColumn('content', 'media_type', { transaction });
		await queryInterface.removeColumn('content', 'year', { transaction });
		await queryInterface.removeColumn('content', 'poster_path', {
			transaction,
		});
		await sequelize.query(`DROP TYPE IF EXISTS "enum_content_media_type"`, {
			transaction,
		});
		await queryInterface.dropTable('watched_together', { transaction });
		await queryInterface.dropTable('taste_profiles', { transaction });
		await queryInterface.dropTable('household_members', { transaction });
		await queryInterface.dropTable('households', { transaction });
		await sequelize.query(
			`DROP TYPE IF EXISTS "enum_watched_together_media_type"`,
			{ transaction }
		);
		await sequelize.query(`DROP TYPE IF EXISTS "enum_household_members_role"`, {
			transaction,
		});
	});
}
