<script lang="ts">
	import cart from '$lib/Cart.svelte.js';
	const { data } = $props();
</script>

<main class="grid grid-cols-1 gap-4 font-optima sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#each data.products as product, i}
		<div class=" m-3 overflow-hidden rounded-md border border-gray-300 p-4">
			<img src={product.thumbnail} alt={product.title} class="m-auto h-36 object-cover" />
			<div class="p-4">
				<h4 class="text-xl text-fadeblack">{product.title}</h4>
				<p class="m-1 truncate text-sm">{product.description}</p>
				<div class="flex items-center justify-between">
					<span class="font-semibold">KES {product.price}</span>
					<button
						class="rounded-lg bg-primary px-4 py-1 text-white duration-300 hover:bg-primary"
						onclick={() => cart.cartItems.push({ id: crypto.randomUUID(), quantity: 1, product })}
						>Add to cart</button
					>
				</div>
			</div>
		</div>
	{/each}
</main>
