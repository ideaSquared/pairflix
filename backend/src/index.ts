import dotenv from 'dotenv';

import createApp from './app';

import { initDatabase } from './db/connection';

import { seedDatabase } from './db/seeders';

import { initScheduledTasks } from './scheduler';

import { auditLogService } from './services/audit.service';

// Load environment variables

dotenv.config();

const port = process.env.PORT ?? 3000;

async function startServer() {
	try {
		// Connect to database first

		await initDatabase();

		console.warn('Database connection established successfully.');

		// Log application startup

		await auditLogService.info('Application starting', 'server-init', {
			environment: process.env.NODE_ENV ?? 'development',

			timestamp: new Date(),
		});

		// Log successful database connection

		await auditLogService.info(
			'Database connection established',

			'server-init',

			{
				timestamp: new Date(),
			}
		);

		// Seed database in development

		if (process.env.NODE_ENV === 'development') {
			await seedDatabase();

			console.warn('Development database seeded successfully.');

			await auditLogService.info('Development database seeded', 'server-init', {
				timestamp: new Date(),
			});
		}

		// Initialize scheduled tasks

		initScheduledTasks();

		// Create Express app

		const app = createApp();

		// Start server

		const server = app.listen(port, () => {
			console.warn(`Server running on port ${port}`);

			// Log server startup

			void (async () => {
				try {
					await auditLogService.info(
						`Server started on port ${port}`,

						'server-init',

						{
							port,

							environment: process.env.NODE_ENV ?? 'development',

							timestamp: new Date(),
						}
					);
				} catch (error) {
					console.warn('Failed to log server start:', error);
				}
			})();
		});

		// Handle server errors

		server.on('error', async error => {
			console.error('Server error:', error);

			try {
				await auditLogService.error('Server error', 'server-init', {
					error: error instanceof Error ? error.message : 'Unknown error',

					timestamp: new Date(),
				});
			} catch (logError) {
				console.warn('Failed to log server error:', logError);
			}
		});

		// Graceful shutdown

		process.on('SIGTERM', () => {
			console.log('SIGTERM received, shutting down gracefully');

			server.close(() => {
				console.log('Process terminated');
			});
		});
	} catch (error) {
		console.error('Unable to start server:', error);

		try {
			await auditLogService.error('Failed to start server', 'server-init', {
				error: error instanceof Error ? error.message : 'Unknown error',

				stack: error instanceof Error ? error.stack : undefined,

				timestamp: new Date(),
			});
		} catch (logError) {
			console.warn('Failed to log server start failure:', logError);
		}

		process.exit(1);
	}
}

// Start the server

void startServer();
