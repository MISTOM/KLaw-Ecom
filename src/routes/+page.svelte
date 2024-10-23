<script lang="ts">
	import cart from '$lib/Cart.svelte.js';
	import { fade } from 'svelte/transition';
	import CartItem from './CartItem.svelte';
	const { data } = $props();
</script>

<!-- Cart -->
{#if cart.cartopen}
	<div
		class="absolute right-0 top-15 bg-white rounded-lg shadow-lg"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 200 }}
	>
		<div class="relative p-4">
			<h2 class="text-lg font-bold">Your cart</h2>
			<button
				class="absolute right-2 top-3 rounded-full p-1 hover:bg-gray-100 font-bold"
				aria-label="close cart"
				onclick={() => (cart.cartopen = false)}>×</button
			>

			<!-- Cart items -->
			{#if cart.cartStats.quantity}
				{#each cart.cartItems as item, i}
					<CartItem {item} />
				{/each}
			{:else}
				<div>
					<i class="text-sm">Your cart is empty</i>
				</div>
			{/if}

			<div class="mt-3">
				<p class="font-semibold">Total: {cart.cartStats.total.toFixed(2)}</p>
			</div>
		</div>
	</div>
{/if}
<main class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
	{#each data.products as product, i}
		<div class=" overflow-hidden rounded-xl shadow-lg p-4 m-3">
			<img src={product.thumbnail} alt={product.title} class="object-cover h-36 m-auto" />
			<div class="p-4">
				<h4 class="text-xl text-gray-800">{product.title}</h4>
				<p class="truncate m-1 text-sm">{product.description}</p>
				<div class="flex items-center justify-between">
					<span class="font-semibold">Ksh {product.price}</span>
					<button
						class="bg-red-900 text-white py-1 px-4 rounded-lg hover:bg-red-950 duration-300"
						onclick={() => cart.cartItems.push({ id: crypto.randomUUID(), quantity: 1, product })}
						>Add to cart</button
					>
				</div>
			</div>
		</div>
	{/each}
</main>
