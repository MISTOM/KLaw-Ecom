<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data, form } = $props();

	let name = $state(data.category?.name || '');
	let id = $state(data.category?.id || '');

	let formErrors = $state();
	// data.category
</script>

<svelte:head>
	<title>Edit Category</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-6 space-y-5">
		<div class="flex items-center space-x-4">
			<a
				href="/admin/category"
				class="rounded-md bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
			>
				← Back to Categories
			</a>
			<h1 class="text-3xl font-bold">Edit Category</h1>
		</div>
		{#if !data.category}
			<p class="text-center text-sm text-gray-500">Category not found</p>
		{:else}
			<!-- Edit Category Form -->
			<form
				method="POST"
				class="rounded-lg bg-white p-6 shadow"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							goto('/admin/category');
						} else if (result.type === 'failure') {
							formErrors = result?.data?.errors ? result.data.errors : 'Error updating category';
						}
					};
				}}
			>
				{#if formErrors}
					<span class="text-sm text-red-600">{formErrors}</span>
				{/if}
				<div class="mb-4">
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Category Name</label>
					<input
						id="name"
						type="text"
						name="name"
						bind:value={name}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>
				<input type="hidden" name="id" bind:value={id} />

				<button type="submit" class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
					Save Changes
				</button>
			</form>
		{/if}
	</div>
</div>
