<!-- UserDetails.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	let user = $derived(data?.user);

	let loading = true;
	let error: string | null = null;

	function formatDate(dateString: string | Date) {
		return new Date(dateString).toLocaleDateString('en-UK', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	async function resetPassword() {
		try {
			const response = await fetch(`/api/admin/users/${user?.id}/reset-password`, {
				method: 'POST'
			});
			if (!response.ok) {
				throw new Error('Failed to send password reset email.');
			}
			alert('Password reset email sent successfully.');
		} catch (err) {
			//@ts-ignore
			alert(err.message);
		}
	}
</script>

{#if !user}
	<div class="text-center">
		<p class="text-2xl font-semibold">User not found</p>
		<p class="text-gray-500">The user you are looking for does not exist.</p>
	</div>
{:else}
	<div class="container mx-auto p-6">
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<a
					href="/admin/users"
					class="rounded-md bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
				>
					← Back to Users
				</a>
				<h1 class="text-3xl font-bold">User Details</h1>
			</div>
			<div class="flex space-x-2">
				<button
					onclick={() => console.log('activating user')}
					class={`rounded-lg px-4 py-2 ${
						user.isVerified
							? 'bg-red-500 text-white hover:bg-red-600'
							: 'bg-green-500 text-white hover:bg-green-600'
					}`}
				>
					{user.isVerified ? 'Deactivate User' : 'Activate User'}
				</button>
				<button
					onclick={resetPassword}
					class="border-primary text-primary hover:bg-primary/10 rounded-lg border px-4 py-2"
				>
					Reset Password
				</button>
			</div>
		</div>

		<div class="grid gap-6 md:grid-cols-3">
			<!-- User Profile Card -->
			<div class="col-span-2 space-y-6">
				<div class="rounded-lg border border-gray-200 bg-white p-6">
					<div class="mb-6 flex items-center space-x-4">
						<div
							class="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full text-2xl capitalize"
						>
							{user.name.charAt(0)}
						</div>
						<div>
							<h2 class="text-2xl font-semibold">{user.name}</h2>
							<p class="text-gray-600">{user.email}</p>
						</div>
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<div>
							<h3 class="mb-2 font-semibold">Contact Information</h3>
							<div class="space-y-2 text-sm">
								<p><span class="text-gray-500">Email:</span> {user.email}</p>
								<p><span class="text-gray-500">Phone:</span> N/A</p>
								<p><span class="text-gray-500">Address:</span> N/A</p>
							</div>
						</div>
						<div>
							<h3 class="mb-2 font-semibold">Account Details</h3>
							<div class="space-y-2 text-sm">
								<p><span class="text-gray-500">Member Since:</span> {formatDate(user.createdAt)}</p>
								<p><span class="text-gray-500">Last Login:</span> {formatDate(user.updatedAt)}</p>
								<p>
									<span class="text-gray-500">Status:</span>
									<span
										class={`ml-1 inline-flex rounded-full px-2 text-xs font-semibold ${
											user.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
										}`}
									>
										{user.isVerified ? 'Active' : 'Inactive'}
									</span>
								</p>
								<p>
									<span class="text-gray-500">Role:</span>
									<span
										class={`ml-1 inline-flex rounded-full px-2 text-xs font-semibold ${
											user.role.name === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
										}`}
									>
										{user.role.name}
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Recent Orders -->
				<div class="rounded-lg border border-gray-200 bg-white p-6">
					<h3 class="mb-4 text-lg font-semibold">Recent Orders</h3>
					{#if user.Order.length > 0}
						<div class="overflow-x-auto">
							<table class="min-w-full">
								<thead>
									<tr>
										<th class="border-b px-4 py-2 text-left">Order ID</th>
										<th class="border-b px-4 py-2 text-left">Date</th>
										<th class="border-b px-4 py-2 text-left">Amount</th>
										<th class="border-b px-4 py-2 text-left">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each user.Order as order}
										<tr class="hover:bg-gray-50">
											<td class="border-b px-4 py-2">{order.id}</td>
											<td class="border-b px-4 py-2">{formatDate(order.createdAt)}</td>
											<td class="border-b px-4 py-2">${order.totalPrice.toFixed(2)}</td>
											<td class="border-b px-4 py-2">
												<span
													class={`inline-flex rounded-full px-2 text-xs font-semibold ${
														order.ProductOnOrder.some((product) => !product.isIssued)
															? 'bg-red-100 text-red-800'
															: 'bg-green-100 text-green-800'
													}`}
												>
													{order.ProductOnOrder.some((product) => !product.isIssued) ? 'Pending' : 'Issued'}
												</span>
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<p>No orders found for this user.</p>
					{/if}
				</div>
			</div>

			<!-- User Image or Additional Info -->
			<div class="space-y-6">
				<!-- User Image Card -->
				{#if user.imageId}
					<div class="rounded-lg border border-gray-200 bg-white p-6">
						<h3 class="mb-4 text-lg font-semibold">Profile Image</h3>
						<img src={user.profileImage?.url} alt={`${user.name}'s Profile`} class="w-full rounded-md" />
					</div>
				{:else}
					<div class="rounded-lg border border-gray-200 bg-white p-6">
						<h3 class="mb-4 text-lg font-semibold">Profile Image</h3>
						<div class="flex h-48 items-center justify-center rounded-md bg-gray-100">
							<p class="text-gray-500">No image uploaded</p>
						</div>
					</div>
				{/if}

				<!-- Additional Sections (Optional) -->
				<!-- Add more sections as needed -->
			</div>
		</div>
	</div>
{/if}
