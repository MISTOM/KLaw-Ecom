<script lang="ts">
	import { getCartState } from '$lib/Cart.svelte.js';

	// import cart from '$lib/Cart.svelte.js';
	const { data } = $props();
	const products = $derived(data.products || []);
	const cart = getCartState();
</script>

<main class="grid grid-cols-1 gap-4 font-optima sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
</main>
