import React from 'react';
import { H1 } from '@pairflix/components';

const ContentModeration: React.FC = () => {
	return (
		<div>
			<H1>Content Moderation</H1>
			<p>Manage and moderate content across the PairFlix platform.</p>

			<div
				style={{
					marginTop: '20px',
					padding: '20px',
					backgroundColor: '#f5f5f5',
					borderRadius: '4px',
				}}
			>
				Content moderation features will be displayed here.
			</div>
		</div>
	);
};

export default ContentModeration;
