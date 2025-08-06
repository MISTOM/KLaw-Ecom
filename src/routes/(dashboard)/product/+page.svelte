<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getCartState } from '$lib/Cart.svelte.js';
	import { getToastState } from '$lib/Toast.svelte';
	import { slide } from 'svelte/transition';
	import ProductFilterSidebar from '$lib/components/ProductFilterSidebar.svelte';

	const { data } = $props();
	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);
	const totalResults = $derived(data.totalResults || 0);

	let selectedCategories = $state<number[]>([]);
	let selectedYear = $state('all');
	let itemsPerPage = $state('12');
	let searchQuery = $state('');
	let isMobileFiltersOpen = $state(false);
	const cart = getCartState();
	const toast = getToastState();

	// Generate years from 1960 to current year
	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: currentYear - 1960 + 1 }, (_, i) => currentYear - i);

	// Items per page options
	const itemsPerPageOptions = [
		{ value: '10', label: '10 records' },
		{ value: '12', label: '12 records' },
		{ value: '20', label: '20 records' },
		{ value: '50', label: '50 records' },
		{ value: '100', label: '100 records' },
		{ value: '1000', label: '1000 records' }
	];

	// Reactive effect to sync state with URL parameters
	$effect(() => {
		const categoriesParam = page.url.searchParams.get('categories') || '';
		const newSelectedCategories = categoriesParam
			? categoriesParam
					.split(',')
					.map((id) => parseInt(id))
					.filter((id) => !isNaN(id))
			: [];
		const newSelectedYear = page.url.searchParams.get('year') || 'all';
		const newItemsPerPage = page.url.searchParams.get('limit') || '12';
		const newSearchQuery = page.url.searchParams.get('search') || '';

		selectedCategories = newSelectedCategories;
		selectedYear = newSelectedYear;
		itemsPerPage = newItemsPerPage;
		searchQuery = newSearchQuery;
	});

	function updateURL(
		categories: number[] = [],
		year: string = 'all',
		page: number = 1,
		limit: string = '12',
		search: string = ''
	) {
		const url = new URL(window.location.href);
		url.searchParams.set('categories', categories.join(','));
		url.searchParams.set('year', year);
		url.searchParams.set('page', page.toString());
		url.searchParams.set('limit', limit);
		url.searchParams.set('search', search);
		return goto(url.toString(), { keepFocus: true });
	}

	function handleCategoryToggle(categoryId: number) {
		let newSelectedCategories;
		if (selectedCategories.includes(categoryId)) {
			newSelectedCategories = selectedCategories.filter((id) => id !== categoryId);
		} else {
			newSelectedCategories = [...selectedCategories, categoryId];
		}
		updateURL(newSelectedCategories, selectedYear, 1, itemsPerPage, searchQuery); // Reset to page 1 when categories change
	}

	function handleYearChange(year: string) {
		updateURL(selectedCategories, year, 1, itemsPerPage, searchQuery); // Reset to page 1 when year changes
	}

	function handlePageChange(page: number) {
		updateURL(selectedCategories, selectedYear, page, itemsPerPage, searchQuery);
	}

	function handleItemsPerPageChange(limit: string) {
		updateURL(selectedCategories, selectedYear, 1, limit, searchQuery); // Reset to page 1 when limit changes
	}

	function clearFilters() {
		updateURL([], 'all', 1, '20', '');
	}

	function handleSearch() {
		// When searching, reset to page 1 and set items per page to highest value (1000)
		updateURL(selectedCategories, selectedYear, 1, '1000', searchQuery);
	}

	function toggleMobileFilters() {
		isMobileFiltersOpen = !isMobileFiltersOpen;
	}
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Product Catalogue</h1>

	<div class="flex gap-8">
		<ProductFilterSidebar
			{categories}
			{selectedCategories}
			{selectedYear}
			{years}
			{isMobileFiltersOpen}
			onCategoryToggle={handleCategoryToggle}
			onYearChange={handleYearChange}
			onClearFilters={clearFilters}
			onToggleMobileFilters={toggleMobileFilters}
		/>

		<!-- Main Content -->
		<main class="flex-1">
			<!-- Search Box -->
			<div class="mb-6">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSearch();
					}}
					class="flex gap-2"
				>
					<div class="relative flex-1">
						<input
							type="text"
							placeholder="Search products..."
							bind:value={searchQuery}
							class="focus:border-primary focus:ring-primary/30 w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:ring-5 focus:outline-hidden"
						/>
						<i class="bi bi-search absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"></i>
					</div>
					<button
						type="submit"
						class="bg-primary hover:bg-primary/90 rounded-lg px-6 py-2 text-white transition-colors"
					>
						Search
					</button>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => {
								searchQuery = '';
								updateURL(selectedCategories, selectedYear, currentPage, '20', '');
							}}
							class="rounded-lg bg-gray-100 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-200"
						>
							Clear
						</button>
					{/if}
				</form>
			</div>

			<!-- Results Header -->
			<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<!-- Mobile Filter Toggle Button -->
					<button
						class="rounded-lg bg-gray-100 p-2 md:hidden"
						onclick={toggleMobileFilters}
						aria-label="Toggle filters"
					>
						<i class="bi bi-funnel text-sm"></i>
					</button>
					<span class="text-sm text-gray-600">{totalResults} results</span>
					{#if selectedCategories.length > 0 || selectedYear !== 'all' || page.url.searchParams.get('search')} 
						<button class="text-primary hover:text-primary/80 text-sm underline" onclick={clearFilters}>
							Clear All Filters
						</button>
					{/if}
				</div>

				<div class="flex items-center gap-2">
					<label for="items-per-page" class="text-sm text-gray-600">Show:</label>
					<select
						id="items-per-page"
						bind:value={itemsPerPage}
						onchange={() => handleItemsPerPageChange(itemsPerPage)}
						class="focus:border-primary focus:ring-primary/30 rounded border border-gray-200 px-2 py-1 text-sm focus:ring-5 focus:outline-hidden"
					>
						{#each itemsPerPageOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Products Grid -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
				{#if products.length === 0}
					<div class="col-span-full text-center text-gray-600">No products found</div>
				{:else}
					{#each products as product (product.id)}
						<div
							class="group flex flex-col justify-between overflow-hidden rounded-sm border transition-all hover:shadow-md"
						>
							<div>
								<a
									href="/product/{product.id}?categories={selectedCategories.join(
										','
									)}&year={selectedYear}&page={currentPage}&limit={itemsPerPage}&search={encodeURIComponent(
										searchQuery
									)}"
								>
									<div class="flex aspect-square items-center justify-center overflow-hidden">
										<img
											src={product.Image[0]?.url || '/coat-of-arms.jpg'}
											alt={product.name}
											class="h-full bg-gray-100 object-cover transition-transform group-hover:scale-105"
										/>
									</div>

									<div class="p-4">
										<h3 class="line-clamp-2 text-lg font-semibold">{product.name}</h3>
										<p class="mt-2 line-clamp-1 text-sm text-gray-600">{product.description}</p>
									</div>
								</a>
							</div>

							<div class="flex items-center justify-between p-4">
								<span class="text-lg font-bold">
									KES {product.price.toLocaleString()}
								</span>
								<button
									class="rounded-md px-3 py-2 text-sm text-white transition-colors {product.quantity > 0
										? 'bg-primary hover:bg-primary/90'
										: 'cursor-not-allowed bg-gray-400'}"
									onclick={async () => {
										if (product.quantity <= 0) {
											toast.add('Error', 'Product is out of stock', 'warning');
											return;
										}

										const result = await cart.addItem(product);
										if (result.success) {
											toast.add('Success', 'Product added to cart', 'success');
										} else if (result.error) {
											toast.add('Stock Limited', result.error, 'warning');
										} else {
											if (data.user) toast.add('Error', 'Failed to Save Cart', 'error');
										}
									}}
								>
									{product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
								</button>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<div class="mt-8 flex justify-center gap-2">
					<button
						class="rounded-md bg-gray-100 px-4 py-2 text-sm disabled:opacity-50"
						disabled={currentPage === 1}
						onclick={() => handlePageChange(currentPage - 1)}
					>
						Previous
					</button>

					{#each Array(totalPages) as _, i}
						<button
							class="rounded-md px-4 py-2 text-sm {currentPage === i + 1
								? 'bg-primary text-white'
								: 'bg-gray-100'}"
							onclick={() => handlePageChange(i + 1)}
						>
							{i + 1}
						</button>
					{/each}

					<button
						class="rounded-md bg-gray-100 px-4 py-2 text-sm disabled:opacity-50"
						disabled={currentPage === totalPages}
						onclick={() => handlePageChange(currentPage + 1)}
					>
						Next
					</button>
				</div>
			{/if}
		</main>
	</div>
</div>
