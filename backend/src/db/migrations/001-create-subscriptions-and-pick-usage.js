'use strict';

/**
 * Phase E migration: subscriptions + pick_usage.
 *
 * Creates the subscriptions table (one row per household) and pick_usage
 * (one row per successful pick) and backfills a free/active subscription
 * for every existing household.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('subscriptions', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.literal('gen_random_uuid()'),
				primaryKey: true,
			},
			household_id: {
				type: Sequelize.UUID,
				allowNull: false,
				unique: true,
				references: { model: 'households', key: 'household_id' },
				onDelete: 'CASCADE',
			},
			tier: {
				type: Sequelize.ENUM('free', 'premium'),
				allowNull: false,
				defaultValue: 'free',
			},
			status: {
				type: Sequelize.ENUM('active', 'past_due', 'canceled'),
				allowNull: false,
				defaultValue: 'active',
			},
			stripe_customer_id: { type: Sequelize.STRING, allowNull: true },
			stripe_subscription_id: { type: Sequelize.STRING, allowNull: true },
			current_period_end: { type: Sequelize.DATE, allowNull: true },
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('NOW()'),
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('NOW()'),
			},
		});

		await queryInterface.createTable('pick_usage', {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.literal('gen_random_uuid()'),
				primaryKey: true,
			},
			household_id: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: 'households', key: 'household_id' },
				onDelete: 'CASCADE',
			},
			picked_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal('NOW()'),
			},
		});

		await queryInterface.addIndex('pick_usage', {
			name: 'pick_usage_household_picked_at_idx',
			fields: [
				{ name: 'household_id' },
				{ name: 'picked_at', order: 'DESC' },
			],
		});

		// Backfill: every existing household gets a free/active subscription.
		await queryInterface.sequelize.query(`
			INSERT INTO subscriptions (id, household_id, tier, status, created_at, updated_at)
			SELECT gen_random_uuid(), h.household_id, 'free', 'active', NOW(), NOW()
			FROM households h
			LEFT JOIN subscriptions s ON s.household_id = h.household_id
			WHERE s.id IS NULL;
		`);
	},

	async down(queryInterface) {
		await queryInterface.dropTable('pick_usage');
		await queryInterface.dropTable('subscriptions');
		await queryInterface.sequelize.query(
			'DROP TYPE IF EXISTS "enum_subscriptions_tier";'
		);
		await queryInterface.sequelize.query(
			'DROP TYPE IF EXISTS "enum_subscriptions_status";'
		);
	},
};
