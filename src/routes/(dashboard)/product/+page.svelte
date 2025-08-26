<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getCartState } from '$lib/Cart.svelte.js';
	import { getToastState } from '$lib/Toast.svelte';
	import { slide } from 'svelte/transition';
	import ProductFilterSidebar from '$lib/components/ProductFilterSidebar.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	const { data } = $props();
	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);
	const totalResults = $derived(data.totalResults || 0);

	let selectedCategories = $state<number[]>([]);
	let selectedYear = $state('all');
	let itemsPerPage = $state('10');
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
		const newItemsPerPage = page.url.searchParams.get('limit') || '10';
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
		limit: string = '10',
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
			<div class="grid grid-cols-2 gap-4 sm:gap-7 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
				{#if products.length === 0}
					<div class="col-span-full text-center text-gray-600">No products found</div>
				{:else}
					{#each products as product (product.id)}
						<div
							class="group relative overflow-visible rounded-sm border bg-white px-3 transition-all hover:shadow-md"
						>
							<!-- Mobile (original vertical) layout -->
							<div class="flex h-full flex-col md:hidden">
								<a
									href="/product/{product.id}?categories={selectedCategories.join(
										','
									)}&year={selectedYear}&page={currentPage}&limit={itemsPerPage}&search={encodeURIComponent(
										searchQuery
									)}"
									class="block flex-1"
								>
									<div
										class="flex aspect-square items-center justify-center overflow-hidden rounded-sm bg-gray-50"
									>
										<img
											src={product.Image[0]?.url || '/coat-of-arms.jpg'}
											alt={product.name}
											class="h-full w-full object-cover transition-transform group-hover:scale-105"
										/>
									</div>
									<div class="pt-2">
										<h3 class="line-clamp-2 text-sm font-semibold">{product.name}</h3>
										<p class="mt-1 line-clamp-2 text-xs text-gray-600">{product.description}</p>
									</div>
								</a>
								<div class="mt-auto flex items-center justify-between pt-2">
									<span class="text-sm font-bold">
										{#if product.discountedPrice}
											<span class="mr-1 text-gray-500 line-through">KES {product.price.toLocaleString()}</span>
											<span class="text-primary">KES {product.discountedPrice.toLocaleString()}</span>
										{:else}
											KES {product.price.toLocaleString()}
										{/if}
									</span>
									<button
										class="rounded-md px-2 py-1 text-xs text-white transition-colors {product.quantity > 0
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

							<!-- Desktop / tablet horizontal layout -->
							<div class="hidden gap-3 md:flex">
								<a
									href="/product/{product.id}?categories={selectedCategories.join(
										','
									)}&year={selectedYear}&page={currentPage}&limit={itemsPerPage}&search={encodeURIComponent(
										searchQuery
									)}"
									class="relative block w-24 shrink-0"
								>
									<!-- Reason: keep layout height stable; use transform for visual lift instead of negative margin which collapsed column height -->
									<span class="block h-36 -translate-y-6 rounded-sm bg-gray-50 ring-1 ring-gray-200">
										<img
											src={product.Image[0]?.url || '/coat-of-arms.jpg'}
											alt={product.name}
											class="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
										/>
									</span>
								</a>
								<div class="flex h-32 min-h-32 flex-1 flex-col justify-between">
									<a
										href="/product/{product.id}?categories={selectedCategories.join(
											','
										)}&year={selectedYear}&page={currentPage}&limit={itemsPerPage}&search={encodeURIComponent(
											searchQuery
										)}"
										class="block"
									>
										<h3 class="line-clamp-2 pr-1 text-sm leading-snug font-semibold md:text-base">
											{product.name}
										</h3>
										<p class="mt-1 line-clamp-2 text-[11px] text-gray-600 md:text-xs">{product.description}</p>
									</a>
									<div class="flex items-center justify-between gap-2 pt-2">
										<span class="text-sm font-bold md:text-base">
											{#if product.discountedPrice}
												<span class="mr-1 text-gray-500 line-through text-sm ">KES {product.price.toLocaleString()}</span>
												<span class="text-primary">KES {product.discountedPrice.toLocaleString()}</span>
											{:else}
												KES {product.price.toLocaleString()}
											{/if}
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
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Pagination -->
			<div class="mt-8">
				<Pagination {currentPage} {totalPages} onPageChange={handlePageChange} />
			</div>
		</main>
	</div>
</div>
