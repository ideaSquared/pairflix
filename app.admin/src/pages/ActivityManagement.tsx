import React from 'react';
import { H1 } from '@pairflix/components';

const ActivityManagement: React.FC = () => {
	return (
		<div>
			<H1>Activity Management</H1>
			<p>Monitor user activity and engagement across the platform.</p>

			<div
				style={{
					marginTop: '20px',
					padding: '20px',
					backgroundColor: '#f5f5f5',
					borderRadius: '4px',
				}}
			>
				Activity tracking and analytics will be displayed here.
			</div>
		</div>
	);
};

export default ActivityManagement;
