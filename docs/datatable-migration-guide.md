# DataTable Migration Guide

This guide outlines how to migrate existing table components to the new type-safe DataTable component from lib.components.

## Migrated Components ✅

- ✅ app.client/src/features/admin/components/content/user-management/UserTable.tsx
- ✅ app.admin/src/features/admin/components/content/user-management/UserTable.tsx
- ✅ app.admin/src/features/user-management/UserManagementContent.tsx
- ✅ app.client/src/features/admin/components/content/user-management/UserActivityModal.tsx
- ✅ app.client/src/features/admin/components/content/ContentModerationContent.tsx
- ✅ app.client/src/features/admin/components/dashboard/SystemStatsContent.tsx (multiple tables implemented)
- ✅ app.client/src/features/admin/components/activity/UserActivityContent.tsx
- ✅ app.client/src/features/admin/components/activity/AuditLogContent.tsx

## All Components Successfully Migrated! ✅

## Migration Pattern

Follow these steps for each component:

1. **Analyze the existing table structure**:

   - Identify the data structure being rendered
   - Note any custom rendering logic
   - Check for actions/interactions with table rows

2. **Import the required components**:

   ```tsx
   // Import DataTable from lib.components
   import {
   	DataTable,
   	TableColumn,
   	TableProps,
   } from '../../../../../../lib.components/src/components/common/Table';
   ```

3. **Define a type for your table data** (if not already available):

   ```tsx
   interface MyDataType {
   	id: string;
   	// Add other fields as needed
   }
   ```

4. **Create typed column definitions**:

   ```tsx
   const columns: TableColumn<MyDataType>[] = [
     {
       key: 'fieldName',
       header: 'Field Display Name',  // IMPORTANT: Use 'header', not 'label'
       // Optional: Custom renderer for this column
       render: (value: MyDataType['fieldName'], row: MyDataType) => (
         // Your custom rendering logic - notice both parameters are typed
       ),
     },
     // Additional columns...
   ];
   ```

5. **Implement a renderActions function** (if your table has row actions):

   ```tsx
   const renderActions = (row: MyDataType) => (
     // Your action buttons/controls
   );
   ```

6. **Replace the old table implementation with DataTable**:
   ```tsx
   <DataTable<MyDataType>
   	columns={columns}
   	data={yourDataArray}
   	emptyMessage='No data found'
   	getRowId={(row) => row.id}
   	rowActions={renderActions} // If you have row actions
   	minWidth='800px' // Adjust as needed
   	aria-label='Description of your table'
   	stickyHeader // Optional
   />
   ```

## Common Migration Issues

### 1. Column Definition Issues

❌ **Incorrect:**

```tsx
{
  key: 'name',
  label: 'Name',  // Wrong property name
  render: (item) => <span>{item.name}</span>  // Untyped parameters
}
```

✅ **Correct:**

```tsx
{
  key: 'name',
  header: 'Name',  // Correct property name is 'header'
  render: (value: string, row: User) => <span>{row.name}</span>  // Typed parameters
}
```

### 2. Row Actions Implementation

❌ **Incorrect:**

```tsx
<DataTable
	columns={columns}
	data={users}
	actions={(
		user // Wrong property name
	) => <Button onClick={() => handleEdit(user)}>Edit</Button>}
/>
```

✅ **Correct:**

```tsx
<DataTable<User>
	columns={columns}
	data={users}
	rowActions={(
		user // Correct property name is 'rowActions'
	) => <Button onClick={() => handleEdit(user)}>Edit</Button>}
/>
```

### 3. Pagination Integration

❌ **Incorrect:**

```tsx
<DataTable
	columns={columns}
	data={users}
	pagination={{
		// Incorrect - DataTable doesn't accept a pagination object
		currentPage: page,
		totalPages: totalPages,
		onPageChange: setPage,
	}}
/>
```

✅ **Correct:**

```tsx
<>
	<DataTable<User>
		columns={columns}
		data={users}
		// No pagination prop here
	/>

	{/* Separate pagination component */}
	<Pagination
		currentPage={page}
		totalPages={totalPages}
		onPageChange={setPage}
	/>
</>
```

## Benefits of Migration

- **Type Safety**: Compiler checks for data access and function parameters
- **Consistent UI**: Standardized table appearance across the application
- **Better Maintainability**: Clear structure and type definitions
- **Enhanced Features**: Built-in support for sorting, pagination, and more
- **Accessibility**: Improved ARIA support and keyboard navigation

## Example: UserActivityModal Migration

Before:

```tsx
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
```

After:

```tsx
<DataTable<UserActivity>
	columns={[
		{
			key: 'created_at',
			header: 'Date',
			render: (value) => formatDate(value as string),
		},
		{
			key: 'action',
			header: 'Activity Type',
		},
		{
			key: 'metadata',
			header: 'Details',
			render: (value) => (
				<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
					{formatMetadata(value)}
				</pre>
			),
		},
	]}
	data={activities}
	emptyMessage='No activity found for this user'
	getRowId={(row) => row.log_id || row.id || Math.random().toString()}
	minWidth='700px'
	aria-label='User activity table'
/>
```
