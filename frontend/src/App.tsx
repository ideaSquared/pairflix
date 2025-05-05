import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import Routes from './components/layout/Routes';

const AppContainer = styled.div`
	min-height: 100vh;
	background-color: #121212;
	color: white;
`;

const queryClient = new QueryClient();

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AppContainer>
					<Routes />
				</AppContainer>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
