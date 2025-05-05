import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
	console.error('Unexpected error on idle client', err);
	process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
	try {
		const result = await pool.query(text, params);
		return result;
	} catch (error) {
		console.error('Database query error:', error);
		throw error;
	}
};

export default pool;
