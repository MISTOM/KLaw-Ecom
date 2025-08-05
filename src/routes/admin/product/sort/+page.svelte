<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { getToastState } from '$lib/Toast.svelte';
	import { fade, scale } from 'svelte/transition';

	const { data, form } = $props();
	let products = $state(data.products || []);
	const categories = $derived(data.categories || []);
	let selectedCategory = $state(data.selectedCategory || 'all');
	const toast = getToastState();

	let draggedItem: any = $state(null);
	let draggedOverIndex: number | null = $state(null);
	let isDragging = $state(false);
	let hasChanges = $state(false);

	// Create a copy to track changes
	let originalProducts = $state(JSON.parse(JSON.stringify(products)));

	// Update products when data changes (when category filter changes)
	$effect(() => {
		if (data.products) {
			products = [...data.products];
			originalProducts = JSON.parse(JSON.stringify(data.products));
			hasChanges = false;
		}
	});

	// Initialize selected category from URL
	onMount(() => {
		selectedCategory = page.url.searchParams.get('category') || 'all';
	});

	function handleDragStart(event: DragEvent, product: any, index: number) {
		if (!event.dataTransfer) return;

		draggedItem = product;
		isDragging = true;
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.setData('text/html', '');

		// Add visual feedback
		const target = event.target as HTMLElement;
		target.style.opacity = '0.6';
	}

	function handleDragEnd(event: DragEvent) {
		isDragging = false;
		draggedItem = null;
		draggedOverIndex = null;

		// Reset visual feedback
		const target = event.target as HTMLElement;
		target.style.opacity = '1';
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		draggedOverIndex = index;
	}

	function handleDragLeave() {
		draggedOverIndex = null;
	}

	function handleDrop(event: DragEvent, targetIndex: number) {
		event.preventDefault();

		if (!draggedItem) return;

		const draggedIndex = products.findIndex((p) => p.id === draggedItem.id);
		if (draggedIndex === -1 || draggedIndex === targetIndex) return;

		// Reorder the array
		const newProducts = [...products];
		const [draggedProduct] = newProducts.splice(draggedIndex, 1);
		newProducts.splice(targetIndex, 0, draggedProduct);

		// Smart sort order assignment: maintain relative positioning
		// Get the sort orders before and after the target position
		const beforeProduct = targetIndex > 0 ? newProducts[targetIndex - 1] : null;
		const afterProduct = targetIndex < newProducts.length - 1 ? newProducts[targetIndex + 1] : null;

		// Calculate new sort order for the dragged product
		let newSortOrder: number;

		if (!beforeProduct && !afterProduct) {
			// Only one product, keep its original sort order
			newSortOrder = draggedProduct.sortOrder;
		} else if (!beforeProduct) {
			// Moving to the beginning
			newSortOrder = afterProduct!.sortOrder - 1;
		} else if (!afterProduct) {
			// Moving to the end
			newSortOrder = beforeProduct.sortOrder + 1;
		} else {
			// Moving between two products
			const gap = afterProduct.sortOrder - beforeProduct.sortOrder;
			if (gap > 1) {
				// There's space between, use the middle
				newSortOrder = beforeProduct.sortOrder + Math.floor(gap / 2);
			} else {
				// No space, we need to shift other products
				// For now, use decimal increments (we'll handle this in save)
				newSortOrder = beforeProduct.sortOrder + 0.5;
			}
		}

		// Update the dragged product's sort order
		newProducts[targetIndex].sortOrder = newSortOrder;

		products = newProducts;
		draggedOverIndex = null;
		hasChanges = true;
	}

	function moveUp(index: number) {
		if (index === 0) return;

		const newProducts = [...products];
		const movingProduct = newProducts[index];
		const targetProduct = newProducts[index - 1];

		// Swap positions in array
		[newProducts[index], newProducts[index - 1]] = [newProducts[index - 1], newProducts[index]];

		// Smart sort order: moving product takes the position just before the target
		const beforeTarget = index - 2 >= 0 ? newProducts[index - 2] : null;

		let newSortOrder: number;
		if (!beforeTarget) {
			// Moving to the very beginning
			newSortOrder = targetProduct.sortOrder - 1;
		} else {
			// Moving between beforeTarget and targetProduct
			const gap = targetProduct.sortOrder - beforeTarget.sortOrder;
			if (gap > 1) {
				newSortOrder = beforeTarget.sortOrder + Math.floor(gap / 2);
			} else {
				newSortOrder = beforeTarget.sortOrder + 0.5;
			}
		}

		// Update the moving product's sort order
		newProducts[index - 1].sortOrder = newSortOrder;

		products = newProducts;
		hasChanges = true;
	}

	function moveDown(index: number) {
		if (index === products.length - 1) return;

		const newProducts = [...products];
		const movingProduct = newProducts[index];
		const targetProduct = newProducts[index + 1];

		// Swap positions in array
		[newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];

		// Smart sort order: moving product takes the position just after the target
		const afterTarget = index + 2 < newProducts.length ? newProducts[index + 2] : null;

		let newSortOrder: number;
		if (!afterTarget) {
			// Moving to the very end
			newSortOrder = targetProduct.sortOrder + 1;
		} else {
			// Moving between targetProduct and afterTarget
			const gap = afterTarget.sortOrder - targetProduct.sortOrder;
			if (gap > 1) {
				newSortOrder = targetProduct.sortOrder + Math.floor(gap / 2);
			} else {
				newSortOrder = targetProduct.sortOrder + 0.5;
			}
		}

		// Update the moving product's sort order
		newProducts[index + 1].sortOrder = newSortOrder;

		products = newProducts;
		hasChanges = true;
	}

	function resetChanges() {
		products = JSON.parse(JSON.stringify(originalProducts));
		hasChanges = false;
	}

	function prepareSaveData() {
		return products.map((product) => ({
			id: product.id,
			sortOrder: product.sortOrder
		}));
	}

	function handleCategoryChange(category: string) {
		selectedCategory = category;
		const url = new URL(window.location.href);
		url.searchParams.set('category', category);
		goto(url.toString(), { keepFocus: true });
	}
</script>

<svelte:head>
	<title>Sort Products | Admin</title>
</svelte:head>

<div class="container mx-auto p-6">
	<div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold">Sort Products</h1>
			<p class="mt-2 text-gray-600">Drag and drop products to reorder them, or use the arrow buttons</p>
		</div>

		<div class="flex gap-4">
			<a
				href="/admin/product"
				class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
			>
				Back to Products
			</a>

			{#if hasChanges}
				<button
					type="button"
					onclick={resetChanges}
					class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
				>
					Reset Changes
				</button>
			{/if}
		</div>
	</div>

	<!-- Category Filter -->
	<div class="mb-6">
		<label for="category-filter" class="mb-2 block text-sm font-medium text-gray-700">Filter by Category</label>
		<select
			id="category-filter"
			bind:value={selectedCategory}
			onchange={() => handleCategoryChange(selectedCategory)}
			class="w-full max-w-xs rounded-lg border border-gray-200 bg-white px-4 py-2 focus:border-primary focus:ring-5 focus:ring-primary/30 focus:outline-hidden"
		>
			<option value="all">All Categories</option>
			{#each categories as category}
				<option value={category.id.toString()}>{category.name}</option>
			{/each}
		</select>
	</div>

	{#if hasChanges}
		<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4" transition:fade>
			<div class="flex items-center justify-between">
				<div class="flex items-center">
					<svg class="mr-2 h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
							clip-rule="evenodd"
						></path>
					</svg>
					<span class="font-medium text-yellow-800">You have unsaved changes</span>
				</div>
			</div>
		</div>
	{/if}

	<form
		method="POST"
		action="?/updateSort"
		class="space-y-4"
		use:enhance={({ formData }) => {
			const updates = prepareSaveData();
			formData.set('updates', JSON.stringify(updates));

			// Add the current category filter to the form data
			formData.set('category', selectedCategory);

			return async ({ update, result }) => {
				if (result.type === 'success') {
					toast.add('Success', 'Product order updated successfully', 'success', 3000);
					hasChanges = false;
					originalProducts = JSON.parse(JSON.stringify(products));

					// Navigate to preserve the category filter
					if (selectedCategory !== 'all') {
						const url = new URL(window.location.href);
						url.searchParams.set('category', selectedCategory);
						goto(url.toString(), { replaceState: true });
					}
				} else {
					toast.add('Error', 'Failed to update product order', 'error', 5000);
				}
				await update({ reset: false });
			};
		}}
	>
		<div class="rounded-lg border border-gray-200 bg-white">
			<div class="border-b border-gray-200 bg-gray-50 p-4">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold text-gray-900">Products Order</h2>
					{#if hasChanges}
						<button
							type="submit"
							class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
							transition:scale
						>
							Save Changes
						</button>
					{/if}
				</div>
			</div>

			<div class="divide-y divide-gray-200">
				{#if products.length === 0}
					<div class="p-8 text-center text-gray-500">
						<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"
							></path>
						</svg>
						<h3 class="mt-2 text-sm font-medium text-gray-900">No products found</h3>
						<p class="mt-1 text-sm text-gray-500">
							{selectedCategory === 'all'
								? 'No products available to sort.'
								: 'No products found in the selected category.'}
						</p>
						{#if selectedCategory !== 'all'}
							<button
								type="button"
								onclick={() => handleCategoryChange('all')}
								class="mt-3 text-sm text-blue-600 hover:text-blue-500"
							>
								View all products
							</button>
						{/if}
					</div>
				{:else}
					{#each products as product, index (product.id)}
						<div
							class="flex items-center p-4 transition-colors hover:bg-gray-50 {draggedOverIndex === index
								? 'border-blue-200 bg-blue-50'
								: ''} {isDragging && draggedItem?.id === product.id ? 'opacity-50' : ''}"
							draggable="true"
							ondragstart={(e) => handleDragStart(e, product, index)}
							ondragend={handleDragEnd}
							ondragover={(e) => handleDragOver(e, index)}
							ondragleave={handleDragLeave}
							ondrop={(e) => handleDrop(e, index)}
							role="listitem"
						>
							<!-- Drag Handle -->
							<div class="mr-4 cursor-move text-gray-400">
								<svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
									<path
										d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
									></path>
								</svg>
							</div>

							<!-- Sort Order Number -->
							<div class="w-12 text-center">
								<span
									class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600"
								>
									{product.sortOrder}
								</span>
							</div>

							<!-- Product Image -->
							<div class="mr-4 h-16 w-16 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
								<img
									src={product.Image[0]?.url || '/coat-of-arms.jpg'}
									alt={product.name}
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							</div>

							<!-- Product Info -->
							<div class="flex-1">
								<h3 class="font-medium text-gray-900">{product.name}</h3>
								<p class="text-sm text-gray-500">Code: {product.serviceCode}</p>
								{#if product.categories && product.categories.length > 0}
									<div class="mt-1 flex flex-wrap gap-1">
										{#each product.categories as category}
											<span
												class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
											>
												{category.name}
											</span>
										{/each}
									</div>
								{/if}
								<div class="mt-1 flex items-center">
									{#if product.isPublished}
										<span
											class="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
										>
											Published
										</span>
									{:else}
										<span
											class="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800"
										>
											Draft
										</span>
									{/if}
								</div>
							</div>

							<!-- Move Buttons -->
							<div class="flex flex-col gap-1">
								<button
									aria-label="Move Up"
									type="button"
									onclick={() => moveUp(index)}
									disabled={index === 0}
									class="rounded p-1 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
									title="Move up"
								>
									<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
											clip-rule="evenodd"
										></path>
									</svg>
								</button>
								<button
									aria-label="Move Down"
									type="button"
									onclick={() => moveDown(index)}
									disabled={index === products.length - 1}
									class="rounded p-1 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
									title="Move down"
								>
									<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
										<path
											fill-rule="evenodd"
											d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
											clip-rule="evenodd"
										></path>
									</svg>
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		{#if hasChanges}
			<div class="flex justify-end gap-4 pt-6">
				<button
					type="button"
					onclick={resetChanges}
					class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
				>
					Cancel Changes
				</button>
				<button
					type="submit"
					class="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
				>
					Save Order
				</button>
			</div>
		{/if}
	</form>
</div>

<style>
	[draggable='true'] {
		cursor: move;
	}

	[draggable='true']:hover {
		background-color: rgba(0, 0, 0, 0.02);
	}
</style>
