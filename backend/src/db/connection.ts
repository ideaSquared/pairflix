import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { initializeModels } from '../models';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL ?? '', {
	dialect: 'postgres',
	logging: process.env.NODE_ENV === 'development' ? console.warn : false,
	dialectOptions: {
		...(process.env.NODE_ENV === 'production' && {
			ssl: {
				require: true,
				rejectUnauthorized: false,
			},
		}),
	},
});

// Function to initialize database
export async function initDatabase() {
	try {
		// Add retry mechanism for database connection
		let retries = 5;
		while (retries > 0) {
			try {
				await sequelize.authenticate();
				console.warn('Database connection established successfully.');
				break;
			} catch (error) {
				retries -= 1;
				console.warn(`Failed to connect to database. ${retries} retries left.`);
				if (retries === 0) throw error;
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}

		// Initialize models and their associations
		initializeModels(sequelize);

		// Sync models
		await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
		console.warn('Database models synchronized.');

		return sequelize;
	} catch (error) {
		console.error('Unable to connect to the database:', error);
		throw error;
	}
}

export default sequelize;
