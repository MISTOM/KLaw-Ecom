<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let users = $derived(data?.users || []);

	const tableHeaderClasses =
		'px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer';
	const formControlClasses =
		' py-2 px-4 rounded-lg border border-gray-200 bg-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';
	const tableDataClasses = 'whitespace-nowrap px-6 py-4 text-sm text-gray-500';

	let searchQuery = $state('');
	let filterRole = $state('all');
	let filterStatus = $state('all');
	let sortBy = $state('name');
	let sortOrder = $state('asc');

	// Reactive statement for filtered and sorted users
	let filteredUsers = $derived.by(() =>
		users
			.filter((user) => {
				const matchesSearch =
					user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					user.email.toLowerCase().includes(searchQuery.toLowerCase());
				const matchesRole = filterRole === 'all' || user.role.name === filterRole;
				const matchesStatus =
					filterStatus === 'all' || user.isVerified === (filterStatus === 'active' ? true : false);
				return matchesSearch && matchesRole && matchesStatus;
			})
			.sort((a, b) => {
				const factor = sortOrder === 'asc' ? 1 : -1;
				return a[sortBy] > b[sortBy] ? factor : -factor;
			})
	);

	function formatDate(dateString: Date) {
		return new Date(dateString).toLocaleDateString('en-UK', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function handleSort(field: string) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'asc';
		}
	}
</script>

<!-- <div class="container mx-auto p-6">
	<div class="mb-8">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Users Management</h1>
			<a href="/admin/users/new" class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
				Add New User
			</a>
		</div>

		<-- Filters Section --
		<div class="mb-6 grid gap-4 md:grid-cols-4">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search users..."
					class="w-full rounded-lg border border-gray-200 bg-white py-2 pl-4 pr-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
				/>
			</div>

			<select
				bind:value={filterRole}
				class="rounded-lg border border-gray-200 bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			>
				<option value="all">All Roles</option>
				<option value="ADMIN">Admin</option>
				<option value="USER">Customer</option>
			</select>

			<select
				bind:value={filterStatus}
				class="rounded-lg border border-gray-200 bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
			>
				<option value="all">All Status</option>
				<option value="active">Active</option>
				<option value="inactive">Inactive</option>
			</select>
		</div>

		<-- Users Table --
		<div class="overflow-scroll rounded-md border border-gray-200 bg-white">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							onclick={() => handleSort('name')}
						>
							<div class="flex cursor-pointer items-center">
								Name
								{#if sortBy === 'name'}
									<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</th>

						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"> Role </th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Status
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
							onclick={() => handleSort('createdAt')}
						>
							<div class="flex cursor-pointer items-center">
								Joined Date
								{#if sortBy === 'createdAt'}
									<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200 bg-white">
					{#each filteredUsers as user (user.id)}
						<tr class="hover:bg-gray-50">
							<td class="whitespace-nowrap px-6 py-4">
								<div class="flex items-center">
									<div class="h-10 w-10 flex-shrink-0">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
										>
											{user.name.charAt(0)}
										</div>
									</div>
									<div class="ml-4">
										<div class="font-medium text-gray-900">{user.name}</div>
										<div class="text-sm text-gray-500">{user.email}</div>
									</div>
								</div>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								<span
									class="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
									class:bg-purple-100={user.role.name === 'ADMIN'}
									class:text-purple-800={user.role.name === 'ADMIN'}
									class:bg-green-100={user.role.name === 'USER'}
									class:text-green-800={user.role.name === 'USER'}
								>
									{user.role.name}
								</span>
							</td>
							<td class="whitespace-nowrap px-6 py-4">
								<span
									class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
										user.isVerified === true
											? 'bg-green-100 text-green-800'
											: user.isVerified === false
												? 'bg-gray-100 text-gray-800'
												: 'bg-red-100 text-red-800'
									}`}
								>
									{user.isVerified ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
								{formatDate(user.createdAt)}
							</td>
							<td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
								<a href={`/admin/users/${user.id}`} class="text-primary hover:text-primary/80"> View Details </a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div> -->

<div class="container mx-auto p-6">
	<div class="mb-6">
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Users Management</h1>
			<a href="/admin/users/new" class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
				Add New User
			</a>
		</div>

		<!-- Filters Section -->
		<div class="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
			<div class="relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search users..."
					class={`w-full ${formControlClasses}`}
				/>
			</div>

			<select bind:value={filterRole} class={`${formControlClasses}`}>
				<option value="all">All Roles</option>
				<option value="ADMIN">Admin</option>
				<option value="USER">Customer</option>
			</select>

			<select bind:value={filterStatus} class={` ${formControlClasses}`}>
				<option value="all">All Status</option>
				<option value="active">Active</option>
				<option value="inactive">Inactive</option>
			</select>
		</div>

		<!-- Users Table -->
		<div class="overflow-x-auto rounded-md border border-gray-200 bg-white">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class={tableHeaderClasses} onclick={() => handleSort('name')}>
							<div class="flex items-center">
								Name
								{#if sortBy === 'name'}
									<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</th>

						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"> Role </th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Status
						</th>
						<th class={tableHeaderClasses} onclick={() => handleSort('createdAt')}>
							<div class="flex items-center">
								Joined Date
								{#if sortBy === 'createdAt'}
									<span class="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
								{/if}
							</div>
						</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
							Actions
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#each filteredUsers as user (user.id)}
						<tr class="hover:bg-gray-50">
							<td class={tableDataClasses}>
								<div class="flex items-center">
									<div class="h-10 w-10 flex-shrink-0">
										<div
											class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
										>
											{user.name.charAt(0)}
										</div>
									</div>
									<div class="ml-4">
										<div class="font-medium text-gray-900">{user.name}</div>
										<div class="text-sm text-gray-500">{user.email}</div>
									</div>
								</div>
							</td>
							<td class={tableDataClasses}>
								<span
									class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
										user.role.name === 'ADMIN'
											? 'bg-purple-100 text-purple-800'
											: user.role.name === 'USER'
												? 'bg-green-100 text-green-800'
												: ''
									}`}
								>
									{user.role.name}
								</span>
							</td>
							<td class={tableDataClasses}>
								<span
									class={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
										user.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
									}`}
								>
									{user.isVerified ? 'Active' : 'Inactive'}
								</span>
							</td>
							<td class={`${tableDataClasses} text-sm text-gray-500`}>
								{formatDate(user.createdAt)}
							</td>
							<td class={`whitespace-nowrap px-6 py-4 text-right text-sm font-medium`}>
								<a href={`/admin/users/${user.id}`} class="text-primary hover:text-primary/80"> View Details </a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
