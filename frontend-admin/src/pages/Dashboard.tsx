import React from 'react';
import { H1 } from '../components/common/Typography';

const Dashboard: React.FC = () => {
	return (
		<div>
			<H1>Admin Dashboard</H1>
			<p>
				Welcome to the PairFlix Admin Dashboard. Select a section from the
				sidebar to manage your application.
			</p>

			{/* Dashboard content would go here */}
			<div style={{ marginTop: '20px' }}>
				<p>
					Quick stats and links will appear here once connected to your backend
					API.
				</p>
			</div>
		</div>
	);
};

export default Dashboard;
