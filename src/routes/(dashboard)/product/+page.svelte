<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { getCartState } from '$lib/Cart.svelte.js';
	import { getToastState } from '$lib/Toast.svelte';

	// import cart from '$lib/Cart.svelte.js';
	const { data } = $props();

	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);

	let selectedCategoryId = $state('all');

	const cart = getCartState();
	const toast = getToastState();

	// Initialize selected category from URL
	onMount(() => {
		const urlCategoryId = page.url.searchParams.get('category') || 'all';
		selectedCategoryId = urlCategoryId;
	});

	let filteredProducts = $derived.by(() => {
		// Update the URL with the selected category changes
		if (selectedCategoryId && typeof window !== 'undefined') {
			const url = new URL(window.location.href);
			if (url.searchParams.get('category') !== selectedCategoryId) {
				url.searchParams.set('category', selectedCategoryId);
				window.history.replaceState({}, '', url); // TODO
			}
		}
		if (selectedCategoryId === 'all') return products;
		return products.filter((product) =>
			product.categories.some((category) => category.id === parseInt(selectedCategoryId))
		);
	});
	// TODO - Save the selected category in the URL

	// let selectedCategoryIds = $state<number[]>([]);
	// Allow filtering by multiple categories
	//   let filteredProducts = $derived.by(() => {
	//     if (selectedCategoryIds.length === 0) {
	//       return products;
	//     } else {
	//       return products.filter(product =>
	//         product.categories.some(category => selectedCategoryIds.includes(category.id))
	//       );
	//     }
	//   });
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
			class="focus:border-primary focus:ring-primary rounded-lg border border-gray-200 bg-white px-4 py-2 focus:ring-1 focus:outline-hidden"
		>
			<option value="all">All Categories</option>
			{#each categories as category}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>

		<!-- Allow filtering by multiple categories -->
		<!-- <div>
			<label class="text-sm font-medium text-gray-700">Filter by Categories</label>
			<div class="mt-2 space-y-2">
				{#each categories as category}
					<div class="flex items-center">
						<input
							type="checkbox"
							bind:group={selectedCategoryIds}
							value={category.id}
							id={`category-${category.id}`}
							class="h-4 w-4 rounded-sm border-gray-300 text-primary focus:ring-primary"
						/>
						<label for={`category-${category.id}`} class="ml-2 text-sm text-gray-700">
							{category.name}
						</label>
					</div>
				{/each}
			</div>
		</div> -->
	</div>
	<main class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#if filteredProducts.length === 0}
			<div class="col-span-full text-center text-gray-600">No products found</div>
		{:else}
			{#each filteredProducts as product (product.id)}
				<div
					class="group flex flex-col justify-between overflow-hidden rounded-sm border transition-all hover:shadow-lg"
				>
					<div>
						<a href="/product/{product.id}?category={selectedCategoryId}">
							<div class="flex aspect-square items-center justify-center overflow-hidden">
								<img
									src={product.Image[0]?.url || '/noImage.jpg'}
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
									toast.add('Error', 'Product is out of stock', 'warning', 2000);
									return;
								}
								if (await cart.addItem(product)) {
									toast.add('Success', 'Product added to cart', 'success', 2000);
								} else {
									console.log('product not added to cart');
									if (data.user) toast.add('Error', 'Failed to Save Cart', 'error', 2000);
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
</div>
