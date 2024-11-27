<script lang="ts">
	import { enhance } from '$app/forms';
	import { slide } from 'svelte/transition';

	let { data } = $props();
	let categories = $derived(data.categories || []);

	// State variables
	let showAddForm = $state(false);
	let newCategoryName = $state('');
	let formErrors = $state();

	// Functions
	function toggleAddForm() {
		showAddForm = !showAddForm;
		newCategoryName = '';
		formErrors = '';
	}
</script>

<svelte:head>
	<title>Categories</title>
</svelte:head>
<!-- Categories -->

<div class="container mx-auto p-6">
	<div class="mb-6">
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Categories Management</h1>
			<button class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90" onclick={toggleAddForm}>
				{showAddForm ? 'Cancel' : 'Add Category'}
			</button>
		</div>

		{#if showAddForm}
			<!-- Add Category Form -->
			<form
				action="?/add_category"
				method="POST"
				class="mb-6 rounded-lg bg-white p-6 shadow"
				in:slide
				out:slide={{ duration: 150 }}
				use:enhance={() => {
					return async ({ update, result }) => {
						if (result.type === 'success') {
							toggleAddForm();
						} else if (result.type === 'failure') {
							formErrors = result?.data?.errors ? result.data.errors : 'Error adding category';
						}
						await update();
					};
				}}
			>
				<h2 class="mb-4 text-xl font-semibold">Add New Category</h2>

				{#if formErrors}
					<span class="text-sm text-red-600">{formErrors}</span>
				{/if}
				<div class="mb-4">
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700">Category Name</label>
					<input
						id="name"
						type="text"
						name="name"
						bind:value={newCategoryName}
						class="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
						oninput={() => (formErrors ? (formErrors = '') : null)}
						required
					/>
				</div>
				<button type="submit" class="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90">
					Save Category
				</button>
			</form>
		{/if}

		<!-- Categories Table -->
		<div class="overflow-x-auto rounded-md border border-gray-200 bg-white">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
						<th class="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-200">
					{#if categories.length === 0}
						<tr>
							<td class="px-6 py-4 text-center text-sm text-gray-500" colspan="2">No categories found</td>
						</tr>
					{:else}
						{#each categories as category (category.id)}
							<tr class="hover:bg-gray-50">
								<td class="px-6 py-4">
									<div class="text-sm font-medium text-gray-900">{category.name}</div>
								</td>
								<td class="px-6 py-4">
									<div class="flex space-x-5">
										<a href={`/admin/category/${category.id}`} class="text-primary hover:text-primary/80">
											Edit
										</a>
										<!-- Delete Category Form -->
										<form
											method="POST"
											action="?/delete_category"
											use:enhance={({ cancel }) => {
												if (!confirm('Are you sure you want to delete this category?')) {
													cancel();
												}
											}}
										>
											<input type="hidden" name="id" value={category.id} />
											<button type="submit" class="text-red-600 hover:text-red-800"> Delete </button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</div>
