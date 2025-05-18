import React from 'react';
import { Typography } from '../../../../../components/common/Typography';

interface MessageProps {
	message: string;
}

export const SuccessMessage: React.FC<MessageProps> = ({ message }) => {
	if (!message) return null;
	return (
		<div
			style={{
				marginBottom: '20px',
				padding: '10px 20px',
				backgroundColor: '#dff0d8',
				borderColor: '#d6e9c6',
				borderRadius: '4px',
				border: '1px solid #d6e9c6',
			}}
		>
			<Typography style={{ color: '#3c763d' }}>{message}</Typography>
		</div>
	);
};

export const ErrorMessage: React.FC<MessageProps> = ({ message }) => {
	if (!message) return null;
	return (
		<div
			style={{
				marginBottom: '20px',
				padding: '10px 20px',
				backgroundColor: '#f2dede',
				borderColor: '#ebccd1',
				borderRadius: '4px',
				border: '1px solid #ebccd1',
			}}
		>
			<Typography style={{ color: '#a94442' }}>{message}</Typography>
		</div>
	);
};
