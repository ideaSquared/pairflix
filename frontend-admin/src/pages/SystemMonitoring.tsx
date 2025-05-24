import React from 'react';
import { H1 } from '../components/common/Typography';

const SystemMonitoring: React.FC = () => {
	return (
		<div>
			<H1>System Monitoring</H1>
			<p>Monitor system performance and health metrics.</p>

			<div
				style={{
					marginTop: '20px',
					padding: '20px',
					backgroundColor: '#f5f5f5',
					borderRadius: '4px',
				}}
			>
				System monitoring metrics and charts will be displayed here.
			</div>
		</div>
	);
};

export default SystemMonitoring;
