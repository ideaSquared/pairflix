import { Button, Card, Flex, Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableHeaderCell, TableRow, Typography } from '@pairflix/components'
import React from 'react';
;
;
;
;
;
;
import { User } from './types';

interface UserActivityModalProps {
	isOpen: boolean;
	onClose: () => void;
	user: User | null;
	activities: any[]; // Changed to any[] to handle backend response format
}

const UserActivityModal: React.FC<UserActivityModalProps> = ({
	isOpen,
	onClose,
	user,
	activities,
}) => {
	if (!user) return null;

	// Format date safely to prevent "Invalid Date"
	const formatDate = (dateString: string | undefined) => {
		if (!dateString) return 'N/A';

		try {
			const date = new Date(dateString);
			// Check if date is valid before formatting
			return date instanceof Date && !isNaN(date.getTime())
				? date.toLocaleString()
				: 'Invalid date';
		} catch (error) {
			return 'Invalid date';
		}
	};

	// Function to format metadata for display
	const formatMetadata = (metadata: any) => {
		if (!metadata) return 'No details available';

		try {
			if (typeof metadata === 'string') return metadata;

			// Format the metadata object for display
			return JSON.stringify(metadata, null, 2);
		} catch (error) {
			return 'Error displaying details';
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title='User Activity' size='large'>
			<div style={{ marginBottom: '20px' }}>
				<Typography variant='h4' gutterBottom>
					{user.username}
				</Typography>
				<Typography>Showing recent activity for this user</Typography>
			</div>

			{activities.length === 0 ? (
				<Typography>No activity found for this user.</Typography>
			) : (
				<Card>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableHeaderCell>Date</TableHeaderCell>
									<TableHeaderCell>Activity Type</TableHeaderCell>
									<TableHeaderCell>Details</TableHeaderCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{activities.map((activity) => (
									<TableRow key={activity.log_id || activity.id}>
										<TableCell>{formatDate(activity.created_at)}</TableCell>
										<TableCell>{activity.action}</TableCell>
										<TableCell>
											<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
												{formatMetadata(activity.metadata)}
											</pre>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</Card>
			)}

			<Flex justifyContent='end' gap='md' style={{ marginTop: '20px' }}>
				<Button variant='secondary' onClick={onClose}>
					Close
				</Button>
			</Flex>
		</Modal>
	);
};

export default UserActivityModal;
