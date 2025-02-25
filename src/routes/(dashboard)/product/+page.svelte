<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getCartState } from '$lib/Cart.svelte.js';
	import { getToastState } from '$lib/Toast.svelte';

	const { data } = $props();
	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);

	let selectedCategoryId = $state('all');
	const cart = getCartState();
	const toast = getToastState();

	// Initialize selected category from URL
	onMount(() => {
		selectedCategoryId = $page.url.searchParams.get('category') || 'all';
	});

	function updateURL(category: string, page: number = 1) {
		const url = new URL(window.location.href);
		url.searchParams.set('category', category);
		url.searchParams.set('page', page.toString());
		return goto(url.toString(), { keepFocus: true });
	}

	function handleCategoryChange(category: string) {
		selectedCategoryId = category;
		updateURL(category, 1); // Reset to page 1 when category changes
	}

	function handlePageChange(page: number) {
		updateURL(selectedCategoryId, page);
	}
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Our Products</h1>

	<!-- Filters Section -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
		<select
			bind:value={selectedCategoryId}
			onchange={() => handleCategoryChange(selectedCategoryId)}
			class="focus:border-primary focus:ring-primary rounded-lg border border-gray-200 bg-white px-4 py-2 focus:ring-1 focus:outline-hidden"
		>
			<option value="all">All Categories</option>
			{#each categories as category}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
	</div>

	<!-- Products Grid -->
	<main class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#if products.length === 0}
			<div class="col-span-full text-center text-gray-600">No products found</div>
		{:else}
			{#each products as product (product.id)}
				<div
					class="group flex flex-col justify-between overflow-hidden rounded-sm border transition-all hover:shadow-lg"
				>
					<div>
						<a href="/product/{product.id}?category={selectedCategoryId}">
							<div class="flex aspect-square items-center justify-center overflow-hidden">
								<img
									src={product.Image[0]?.url || '/coat-of-arms.jpg'}
									alt={product.name}
									class="h-full bg-gray-100 object-cover transition-transform group-hover:scale-105"
								/>
							</div>
						</a>

						<div class="p-4">
							<h3 class="line-clamp-2 text-lg font-semibold">{product.name}</h3>
							<p class="mt-2 line-clamp-1 text-sm text-gray-600">{product.description}</p>
						</div>
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
	</main>

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
					class="rounded-md px-4 py-2 text-sm {currentPage === i + 1 ? 'bg-primary text-white' : 'bg-gray-100'}"
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
</div>
