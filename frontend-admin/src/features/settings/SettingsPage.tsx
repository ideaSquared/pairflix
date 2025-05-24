import { useEffect, useState } from 'react';

type AppSetting = {
	id: string;
	key: string;
	value: string | number | boolean | object;
	category: string;
	description: string;
	dataType: 'string' | 'number' | 'boolean' | 'json';
	isVisible: boolean;
	isEditable: boolean;
};

type SettingsGroup = {
	category: string;
	settings: AppSetting[];
};

export const SettingsPage = () => {
	const [settingsGroups, setSettingsGroups] = useState<SettingsGroup[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [editedSettings, setEditedSettings] = useState<Record<string, any>>({});
	const [selectedCategory, setSelectedCategory] = useState<string>('all');

	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			setIsLoading(true);
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/settings', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch settings');
			}

			const data = await response.json();

			// Group settings by category
			const settingsByCategory = data.settings.reduce(
				(acc: Record<string, AppSetting[]>, setting: AppSetting) => {
					if (!acc[setting.category]) {
						acc[setting.category] = [];
					}
					acc[setting.category].push(setting);
					return acc;
				},
				{}
			);

			// Convert to array of groups
			const groups = Object.keys(settingsByCategory).map((category) => ({
				category,
				settings: settingsByCategory[category],
			}));

			setSettingsGroups(groups);
		} catch (err) {
			setError('Error loading settings');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSettingChange = (setting: AppSetting, newValue: any) => {
		let parsedValue = newValue;

		// Parse value based on data type
		if (setting.dataType === 'number') {
			parsedValue = Number(newValue);
		} else if (setting.dataType === 'boolean') {
			parsedValue = newValue === 'true';
		} else if (setting.dataType === 'json') {
			try {
				parsedValue = JSON.parse(newValue);
			} catch (err) {
				// Keep as string if not valid JSON
				console.error('Invalid JSON:', err);
			}
		}

		setEditedSettings({
			...editedSettings,
			[setting.key]: parsedValue,
		});
	};

	const handleSaveSettings = async () => {
		if (Object.keys(editedSettings).length === 0) {
			return;
		}

		try {
			setIsLoading(true);
			const token = localStorage.getItem('admin_token');
			const response = await fetch('/api/admin/settings', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ settings: editedSettings }),
			});

			if (!response.ok) {
				throw new Error('Failed to update settings');
			}

			setSuccessMessage('Settings updated successfully');
			setEditedSettings({});

			// Refresh settings after update
			fetchSettings();

			// Clear success message after 3 seconds
			setTimeout(() => {
				setSuccessMessage(null);
			}, 3000);
		} catch (err) {
			setError('Error updating settings');
			console.error(err);

			// Clear error message after 5 seconds
			setTimeout(() => {
				setError(null);
			}, 5000);
		} finally {
			setIsLoading(false);
		}
	};

	// Render form input based on setting type
	const renderSettingInput = (setting: AppSetting) => {
		const currentValue =
			editedSettings[setting.key] !== undefined
				? editedSettings[setting.key]
				: setting.value;

		if (!setting.isEditable) {
			return (
				<div style={{ opacity: 0.7 }}>
					{setting.dataType === 'boolean'
						? currentValue
							? 'True'
							: 'False'
						: setting.dataType === 'json'
							? JSON.stringify(currentValue, null, 2)
							: String(currentValue)}
					<em style={{ marginLeft: '10px', fontSize: '0.85rem' }}>
						(Read-only)
					</em>
				</div>
			);
		}

		switch (setting.dataType) {
			case 'boolean':
				return (
					<select
						className='form-control'
						value={String(currentValue)}
						onChange={(e) => handleSettingChange(setting, e.target.value)}
						disabled={!setting.isEditable}
					>
						<option value='true'>True</option>
						<option value='false'>False</option>
					</select>
				);
			case 'number':
				return (
					<input
						type='number'
						className='form-control'
						value={currentValue}
						onChange={(e) => handleSettingChange(setting, e.target.value)}
						disabled={!setting.isEditable}
					/>
				);
			case 'json':
				return (
					<textarea
						className='form-control'
						rows={5}
						value={
							typeof currentValue === 'object'
								? JSON.stringify(currentValue, null, 2)
								: String(currentValue)
						}
						onChange={(e) => handleSettingChange(setting, e.target.value)}
						disabled={!setting.isEditable}
					/>
				);
			default:
				return (
					<input
						type='text'
						className='form-control'
						value={String(currentValue)}
						onChange={(e) => handleSettingChange(setting, e.target.value)}
						disabled={!setting.isEditable}
					/>
				);
		}
	};

	const categories = ['all', ...settingsGroups.map((group) => group.category)];

	const filteredGroups =
		selectedCategory === 'all'
			? settingsGroups
			: settingsGroups.filter((group) => group.category === selectedCategory);

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<h1>Application Settings</h1>
				<div>
					<button
						className='btn btn-primary'
						onClick={handleSaveSettings}
						disabled={Object.keys(editedSettings).length === 0 || isLoading}
					>
						Save Changes
					</button>
				</div>
			</div>

			{successMessage && (
				<div className='alert alert-success'>{successMessage}</div>
			)}
			{error && <div className='alert alert-error'>{error}</div>}

			<div style={{ marginTop: '20px' }}>
				<div className='admin-card' style={{ marginBottom: '20px' }}>
					<h3>Filter by Category</h3>
					<div
						style={{
							display: 'flex',
							gap: '10px',
							flexWrap: 'wrap',
							marginTop: '10px',
						}}
					>
						{categories.map((category) => (
							<button
								key={category}
								onClick={() => setSelectedCategory(category)}
								className={`btn ${selectedCategory === category ? 'btn-primary' : ''}`}
								style={{ textTransform: 'capitalize' }}
							>
								{category}
							</button>
						))}
					</div>
				</div>

				{isLoading && <div>Loading settings...</div>}

				{!isLoading &&
					filteredGroups.map((group) => (
						<div
							key={group.category}
							className='admin-card'
							style={{ marginBottom: '20px' }}
						>
							<h2 style={{ textTransform: 'capitalize', marginBottom: '20px' }}>
								{group.category}
							</h2>

							<div style={{ display: 'grid', gap: '20px' }}>
								{group.settings
									.filter((setting) => setting.isVisible)
									.map((setting) => (
										<div
											key={setting.id}
											style={{
												borderBottom: '1px solid #eee',
												paddingBottom: '15px',
											}}
										>
											<div
												style={{
													display: 'flex',
													justifyContent: 'space-between',
													alignItems: 'baseline',
												}}
											>
												<label
													htmlFor={setting.key}
													style={{ fontWeight: 'bold' }}
												>
													{setting.key}
													<span
														style={{
															fontSize: '0.75rem',
															marginLeft: '8px',
															padding: '2px 6px',
															borderRadius: '4px',
															backgroundColor: '#e0e0e0',
														}}
													>
														{setting.dataType}
													</span>
												</label>
											</div>
											<p
												style={{
													margin: '4px 0 8px',
													opacity: 0.7,
													fontSize: '0.9rem',
												}}
											>
												{setting.description}
											</p>
											{renderSettingInput(setting)}
										</div>
									))}
							</div>
						</div>
					))}

				{Object.keys(editedSettings).length > 0 && (
					<div
						style={{
							position: 'fixed',
							bottom: '20px',
							right: '20px',
							padding: '15px',
							backgroundColor: 'var(--white)',
							boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
							borderRadius: '4px',
							zIndex: 100,
						}}
					>
						<p>You have unsaved changes</p>
						<button
							className='btn btn-primary'
							onClick={handleSaveSettings}
							style={{ marginTop: '10px', width: '100%' }}
						>
							Save Changes
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
