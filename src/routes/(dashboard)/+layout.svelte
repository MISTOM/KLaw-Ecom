<script lang="ts">
	import cart from '$lib/Cart.svelte';
	import { fade } from 'svelte/transition';
	import CartItem from '../../lib/components/CartItem.svelte';

	const { children } = $props();
</script>

<div class="m-5">
	<img src="/kLawLogo.png" alt="logo" class="h-10 md:h-12 lg:h-20" />
</div>

<header class="flex justify-between bg-fadeblack p-2 text-white">
	<nav class="flex items-center">
		<ul class="flex">
			<li class="mx-4 transition-colors hover:text-secondary"><a href="/">Home</a></li>
			<li class="mx-4 transition-colors hover:text-secondary"><a href="/products">Products</a></li>
			<li class="mx-4 transition-colors hover:text-secondary">
				<a href="/purchases">Purchases</a>
			</li>
		</ul>
	</nav>
	<div class="flex items-center">
		<a class="mx-4 transition-colors hover:text-secondary" href="/profile">Profile</a>
		<button
			class="rounded bg-secondary p-2 transition-colors hover:bg-secondary"
			onclick={() => (cart.cartopen = !cart.cartopen)}
		>
			Cart: {cart.cartStats.quantity}</button
		>
		<button
			class="mx-3 rounded border border-transparent p-1 transition-colors hover:border-primary"
			>Log out</button
		>
	</div>
</header>
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

{@render children?.()}
