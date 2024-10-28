<script lang="ts">
	import cart from '$lib/Cart.svelte.js';
	import { fade } from 'svelte/transition';
	import CartItem from './CartItem.svelte';
	const { data } = $props();
</script>

<!-- Cart -->
{#if cart.cartopen}
	<div
		class="absolute right-0 top-28 rounded-md bg-white shadow-lg"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		<div class="relative p-4">
			<h2 class="text-lg font-bold">Your cart</h2>
			<button
				class="absolute right-2 top-3 rounded-full p-1 font-bold hover:bg-gray-100"
				aria-label="close cart"
				onclick={() => (cart.cartopen = false)}>×</button
			>

			<!-- Cart items -->
			{#if cart.cartStats.quantity}
				{#each cart.cartItems as item, i}
					<CartItem {item} />
				{/each}
				<div class="mt-3">
					<p class="font-semibold">Total: {cart.cartStats.total.toFixed(2)}</p>
				</div>

				<button
					class="rounded-md border border-gray-300 px-2 py-1 transition-colors hover:bg-primary hover:text-white"
				>
					Proceed to checkout
				</button>
			{:else}
				<div>
					<i class="text-sm">Your cart is empty</i>
				</div>
			{/if}
		</div>
	</div>
{/if}
<main class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
