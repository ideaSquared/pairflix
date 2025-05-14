import cron from 'node-cron';
import { auditLogService } from './services/audit.service';

/**
 * Initialize scheduled tasks for the application
 */
export const initScheduledTasks = (): void => {
	// Run log rotation at midnight every day
	cron.schedule('0 0 * * *', async () => {
		console.log('Running scheduled audit log cleanup...');
		try {
			const deletedCount = await auditLogService.cleanupOldLogs();
			console.log(`Log rotation complete - removed ${deletedCount} old logs`);
		} catch (error) {
			console.error('Error during scheduled log cleanup:', error);
		}
	});

	console.log('Scheduled tasks initialized');
};
