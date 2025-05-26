import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Alert } from '../../../../components/common/Alert';
import { Button } from '../../../../components/common/Button';
import { Card, CardContent } from '../../../../components/common/Card';
import { Grid } from '../../../../components/common/Layout';
import { Loading } from '../../../../components/common/Loading';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableHeaderCell,
} from '../../../../components/common/Table';
import { H3 } from '../../../../components/common/Typography';
import { adminStatsService } from '../../../../services/adminStats.service';

// Styled components
const Section = styled.section`
	margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatsTable = styled(Card)`
	overflow: hidden;
`;

/**
 * SystemStatsContent component provides detailed system statistics
 * for the UnifiedDashboard's System Details tab
 */
const SystemStatsContent: React.FC = () => {
	const [statsData, setStatsData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		fetchSystemStats();
	}, []);

	const fetchSystemStats = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Get system stats from the service
			const data = await adminStatsService.getSystemStats(true);

			// Check if data is available and set it to state
			if (!data) {
				throw new Error('Failed to retrieve system statistics data');
			}

			setStatsData(data);
		} catch (err) {
			setError(
				`Failed to load system stats: ${err instanceof Error ? err.message : String(err)}`
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleExportStats = () => {
		try {
			// Create a JSON blob and initiate download
			const dataStr = JSON.stringify(statsData, null, 2);
			const blob = new Blob([dataStr], { type: 'application/json' });
			const url = URL.createObjectURL(blob);

			const a = document.createElement('a');
			a.href = url;
			a.download = `system-stats-${new Date().toISOString().split('T')[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			setSuccessMessage('Stats exported successfully');
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			setError(
				`Failed to export stats: ${err instanceof Error ? err.message : String(err)}`
			);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	const formatDuration = (seconds: number) => {
		const days = Math.floor(seconds / (24 * 60 * 60));
		const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
		const minutes = Math.floor((seconds % (60 * 60)) / 60);

		let result = '';
		if (days > 0) result += `${days}d `;
		if (hours > 0 || days > 0) result += `${hours}h `;
		result += `${minutes}m`;

		return result;
	};

	if (isLoading && !statsData) {
		return <Loading message='Loading system statistics...' />;
	}

	if (error) {
		return (
			<Alert variant='error' onClose={() => setError(null)}>
				{error}
			</Alert>
		);
	}

	return (
		<>
			{successMessage && (
				<Alert variant='success' onClose={() => setSuccessMessage(null)}>
					{successMessage}
				</Alert>
			)}

			{statsData && (
				<>
					<Section>
						<SectionHeader>
							<H3>System Information</H3>
							<Button variant='secondary' onClick={handleExportStats}>
								Export Stats
							</Button>
						</SectionHeader>

						<Grid columns={2} gap='md'>
							<Card>
								<CardContent>
									<H3 gutterBottom>Server</H3>
									<Table>
										<TableBody>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Hostname
												</TableCell>
												<TableCell>{statsData.system.hostname}</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Platform
												</TableCell>
												<TableCell>{statsData.system.platform}</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Architecture
												</TableCell>
												<TableCell>{statsData.system.arch}</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Server Uptime
												</TableCell>
												<TableCell>
													{formatDuration(statsData.system.uptime)}
												</TableCell>
											</tr>
										</TableBody>
									</Table>
								</CardContent>
							</Card>

							<Card>
								<CardContent>
									<H3 gutterBottom>Application</H3>
									<Table>
										<TableBody>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Node Version
												</TableCell>
												<TableCell>
													{statsData.application?.nodeVersion || 'N/A'}
												</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													App Version
												</TableCell>
												<TableCell>
													{statsData.application?.version || 'N/A'}
												</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Process Uptime
												</TableCell>
												<TableCell>
													{statsData.application?.uptime
														? formatDuration(statsData.application.uptime)
														: 'N/A'}
												</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Process ID
												</TableCell>
												<TableCell>
													{statsData.application?.pid || 'N/A'}
												</TableCell>
											</tr>
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</Grid>
					</Section>

					<Section>
						<H3 gutterBottom>Environment Variables</H3>
						<Card>
							<CardContent>
								<TableContainer>
									<Table>
										<TableHead>
											<tr>
												<TableHeaderCell>Variable</TableHeaderCell>
												<TableHeaderCell>Value</TableHeaderCell>
											</tr>
										</TableHead>
										<TableBody>
											{Object.entries(statsData.environment || {}).map(
												([key, value]) => (
													<tr key={key}>
														<TableCell style={{ fontWeight: 'bold' }}>
															{key}
														</TableCell>
														<TableCell>
															{typeof value === 'string' &&
															(value.includes('SECRET') ||
																value.includes('KEY') ||
																value.includes('PASSWORD'))
																? '********' // Mask sensitive values
																: String(value)}
														</TableCell>
													</tr>
												)
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</CardContent>
						</Card>
					</Section>

					<Section>
						<H3 gutterBottom>Database Stats</H3>
						<Grid columns={2} gap='md'>
							<Card>
								<CardContent>
									<H3 gutterBottom>Connection</H3>
									<Table>
										<TableBody>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Status
												</TableCell>
												<TableCell>
													<span
														style={{
															color:
																statsData.database.status === 'connected'
																	? 'var(--color-success)'
																	: 'var(--color-error)',
															fontWeight: 'bold',
														}}
													>
														{statsData.database.status}
													</span>
												</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Type
												</TableCell>
												<TableCell>{statsData.database.type}</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Version
												</TableCell>
												<TableCell>{statsData.database.version}</TableCell>
											</tr>
										</TableBody>
									</Table>
								</CardContent>
							</Card>

							<Card>
								<CardContent>
									<H3 gutterBottom>Performance</H3>
									<Table>
										<TableBody>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Connections
												</TableCell>
												<TableCell>
													{statsData.database?.connections?.current || 'N/A'} /{' '}
													{statsData.database?.connections?.max || 'N/A'}
												</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Avg. Query Time
												</TableCell>
												<TableCell>
													{statsData.database?.performance?.avgQueryTime ||
														'N/A'}{' '}
													ms
												</TableCell>
											</tr>
											<tr>
												<TableCell style={{ fontWeight: 'bold' }}>
													Slow Queries (24h)
												</TableCell>
												<TableCell>
													{statsData.database?.performance?.slowQueries || 0}
												</TableCell>
											</tr>
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</Grid>
					</Section>

					<Section>
						<H3 gutterBottom>Installed Dependencies</H3>
						<StatsTable>
							<CardContent noPadding>
								<TableContainer>
									<Table>
										<TableHead>
											<tr>
												<TableHeaderCell>Package</TableHeaderCell>
												<TableHeaderCell>Version</TableHeaderCell>
												<TableHeaderCell>Latest</TableHeaderCell>
												<TableHeaderCell>Status</TableHeaderCell>
											</tr>
										</TableHead>
										<TableBody>
											{statsData.dependencies ? (
												statsData.dependencies.map((dep: any) => (
													<tr key={dep.name}>
														<TableCell>{dep.name}</TableCell>
														<TableCell>{dep.currentVersion}</TableCell>
														<TableCell>{dep.latestVersion}</TableCell>
														<TableCell>
															<span
																style={{
																	color:
																		dep.status === 'up-to-date'
																			? 'var(--color-success)'
																			: dep.status === 'outdated'
																				? 'var(--color-warning)'
																				: 'var(--color-error)',
																	fontWeight: 'bold',
																}}
															>
																{dep.status}
															</span>
														</TableCell>
													</tr>
												))
											) : (
												<tr>
													<TableCell
														colSpan={4}
														style={{ textAlign: 'center' }}
													>
														No dependency information available
													</TableCell>
												</tr>
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</CardContent>
						</StatsTable>
					</Section>

					<Section>
						<H3 gutterBottom>System Events (Last 24 Hours)</H3>
						<StatsTable>
							<CardContent noPadding>
								<TableContainer>
									<Table>
										<TableHead>
											<tr>
												<TableHeaderCell>Event Type</TableHeaderCell>
												<TableHeaderCell>Description</TableHeaderCell>
												<TableHeaderCell>Time</TableHeaderCell>
												<TableHeaderCell>Status</TableHeaderCell>
											</tr>
										</TableHead>
										<TableBody>
											{!statsData.events || statsData.events.length === 0 ? (
												<tr>
													<TableCell
														colSpan={4}
														style={{ textAlign: 'center' }}
													>
														No events recorded in the last 24 hours
													</TableCell>
												</tr>
											) : (
												statsData.events.map((event: any, index: number) => (
													<tr key={index}>
														<TableCell>{event.type}</TableCell>
														<TableCell>{event.description}</TableCell>
														<TableCell>{formatDate(event.timestamp)}</TableCell>
														<TableCell>
															<span
																style={{
																	color:
																		event.status === 'success'
																			? 'var(--color-success)'
																			: event.status === 'warning'
																				? 'var(--color-warning)'
																				: 'var(--color-error)',
																	fontWeight: 'bold',
																}}
															>
																{event.status}
															</span>
														</TableCell>
													</tr>
												))
											)}
										</TableBody>
									</Table>
								</TableContainer>
							</CardContent>
						</StatsTable>
					</Section>
				</>
			)}

			<Button
				variant='primary'
				onClick={fetchSystemStats}
				style={{ marginTop: '1rem' }}
			>
				Refresh Stats
			</Button>
		</>
	);
};

export default SystemStatsContent;
