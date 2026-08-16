require('dotenv').config();

const baseConfig = {
	dialect: 'postgres',
	use_env_variable: 'DATABASE_URL',
	dialectOptions:
		process.env.NODE_ENV === 'production'
			? { ssl: { require: true, rejectUnauthorized: false } }
			: {},
	logging: false,
	migrationStorage: 'sequelize',
	migrationStorageTableName: 'sequelize_meta',
};

module.exports = {
	development: baseConfig,
	test: baseConfig,
	production: baseConfig,
};
