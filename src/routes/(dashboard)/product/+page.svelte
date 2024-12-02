<script lang="ts">
	import { getCartState } from '$lib/Cart.svelte.js';
	import { getToastState } from '$lib/Toast.svelte';

	// import cart from '$lib/Cart.svelte.js';
	const { data } = $props();

	const products = $derived(data.products || []);
	const categories = $derived(data.categories || []);

	let selectedCategoryId = $state('all');

	const cart = getCartState();
	const toast = getToastState();

	let filteredProducts = $derived.by(() => {
		if (selectedCategoryId === 'all') return products;
		return products.filter((product) =>
			product.categories.some((category) => category.id === parseInt(selectedCategoryId))
		);
	});
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<!-- <main class="grid grid-cols-1 gap-4 font-optima sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#each products as product, i}
		<div class=" m-3 overflow-hidden rounded-md border border-gray-300 p-4">
			<img src={product.Image[0].url} alt={product.name} class="m-auto h-36 object-cover" />
			<div class="p-4">
				<h4 class="text-xl text-fadeblack">{product.name}</h4>
				<p class="m-1 truncate text-sm">{product.description}</p>
				<div class="flex items-center justify-between">
					<span class="font-semibold">KES {product.price}</span>
					<button
						class="rounded-md border border-primary px-2 py-1 transition-colors hover:bg-primary hover:text-white"
						onclick={() => cart.addItem(product)}
						>Add to cart</button
					>
				</div>
			</div>
		</div>
	{/each}
</main> -->

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">Our Products</h1>
	<!-- Filters Section -->
	<div class="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
		<select
			bind:value={selectedCategoryId}
			class="rounded-lg border border-gray-200 bg-white px-4 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
		>
			<option value="all">All Categories</option>
			{#each categories as category}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
	</div>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
		{#each filteredProducts as product (product.id)}
			<div class="group overflow-hidden rounded-md border transition-all hover:shadow-lg">
				<a href="/product/{product.id}">
					<div class="mx-auto aspect-square overflow-hidden">
						<img
							src={product.Image[0]?.url || '/kLawPillers.png'}
							alt={product.name}
							class="h-full bg-primary object-cover transition-transform group-hover:scale-105"
						/>
					</div>
				</a>
				<div class="p-4">
					<h3 class="text-lg font-semibold">{product.name}</h3>
					<p class="mt-2 line-clamp-2 text-sm text-gray-600">{product.description}</p>

					<div class="mt-4 flex items-center justify-between">
						<span class="text-lg font-bold">
							KES {product.price.toLocaleString()}
						</span>
						<button
							class="rounded-md bg-primary px-3 py-2 text-sm text-white transition-colors hover:bg-primary/90"
							onclick={async () => {
								if (await cart.addItem(product)) {
									console.log('product added to cart');
									toast.add('Success', 'Product added to cart', 'success', 2000);
								} else {
									console.log('product not added to cart');
									// if (data.user) toast.add('Error', 'Failed to add product to cart', 'error', 2000);
								}
							}}
						>
							Add to Cart
						</button>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
