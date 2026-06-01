import { DataTypes, type QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
	const sequelize = queryInterface.sequelize;

	await sequelize.transaction(async transaction => {
		await queryInterface.createTable(
			'household_invites',
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
					references: { model: 'users', key: 'user_id' },
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
					references: { model: 'users', key: 'user_id' },
				},
				created_at: {
					type: DataTypes.DATE,
					allowNull: false,
					defaultValue: DataTypes.NOW,
				},
			},
			{ transaction }
		);

		await queryInterface.addIndex('household_invites', {
			name: 'idx_household_invites_token',
			fields: ['token'],
			unique: true,
			transaction,
		});

		await queryInterface.addIndex('household_invites', {
			name: 'idx_household_invites_household',
			fields: ['household_id'],
			transaction,
		});
	});
}

export async function down(queryInterface: QueryInterface): Promise<void> {
	await queryInterface.dropTable('household_invites');
}
