import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { H1 } from './Typography';

const TestContainer = styled.div`
	padding: 20px;
	border: 2px solid #4caf50;
	border-radius: 4px;
	margin: 20px;
`;

const TestComponent: React.FC = () => {
	const location = useLocation();

	useEffect(() => {
		console.log('TestComponent mounted at path:', location.pathname);
		return () => {
			console.log('TestComponent unmounted from path:', location.pathname);
		};
	}, [location.pathname]);

	return (
		<TestContainer>
			<H1>Test Component</H1>
			<p>Current path: {location.pathname}</p>
			<p>If you can see this, navigation is working correctly!</p>
		</TestContainer>
	);
};

export default TestComponent;
