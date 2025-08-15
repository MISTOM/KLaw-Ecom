<script lang="ts">
	import { fade } from 'svelte/transition';
	import CartItem from '../../lib/components/CartItem.svelte';
	import { goto } from '$app/navigation';
	import { setCartState } from '$lib/Cart.svelte';
	// import { getUserState } from '$lib/state.svelte';
	// import cart from '$lib/Cart.svelte';
	const { children, data } = $props();

	const cart = setCartState(data.cartItems || []);

	const user = $derived(data.user);

	// const UserState = getUserState();
	// const { user, name } = UserState;
	// $inspect(data.user, ' ::dashboard layout state');

	const handleLogout = async () => {
		const response = await fetch('/api/logout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			console.error('Failed to log out');
		}

		// UserState.user = null;
		console.log(await response.json());
		await goto('/', { invalidateAll: true });
	};
</script>

<div class="m-5">
	<a href="/"><img src="/kLawLogo.png" alt="logo" class="h-10 md:h-12 lg:h-20" /> </a>
</div>

<header class="bg-fadeblack flex justify-between p-2 text-white">
	<nav class="flex items-center">
		<ul class="flex">
			<li class="hover:text-secondary mx-4 transition-colors">
				<a href="/product">Products</a>
			</li>
			<li class="hover:text-secondary mx-4 transition-colors">
				<a href="/subscription">Subscription</a>
			</li>

			{#if user}
				<li class="hover:text-secondary mx-4 transition-colors">
					<a href="/purchases">Purchases</a>
				</li>
			{/if}
		</ul>
	</nav>
	<div class="flex items-center">
		{#if user}
			<a class="hover:text-secondary mx-4 transition-colors" href="/profile">My Account</a>
		{/if}
		<button
			class="hover:border-secondary rounded-md p-1 transition-colors hover:border-b"
			onclick={() => (cart.cartopen = !cart.cartopen)}
		>
			My Cart: {cart.cartStats.quantity}</button
		>
		{#if user}
			<button
				class="hover:text-secondary mx-4 transition-colors"
				onclick={() => {
					handleLogout();
				}}>Logout</button
			>
		{:else}
			<div class="mx-4 transition-colors">
				<a href="/login" class="hover:text-secondary">Login</a> or
				<a href="/register" class="hover:text-secondary">Register</a>
			</div>
		{/if}
	</div>
</header>

<!-- CART -->
{#if cart.cartopen}
	<div
		class="absolute top-28 right-0 z-10 rounded-md bg-white shadow-lg"
		in:fade={{ duration: 200 }}
		out:fade={{ duration: 100 }}
	>
		<div class="fixed inset-0" aria-hidden="true" onclick={() => (cart.cartopen = false)}></div>
		<div class="relative p-4">
			<h2 class="text-lg font-bold">Your cart</h2>
			<button
				class="absolute top-3 right-2 rounded-full p-1 font-semibold hover:bg-gray-100"
				aria-label="close cart"
				onclick={() => (cart.cartopen = false)}>X</button
			>

			<!-- Cart items -->
			{#if cart.cartStats.quantity}
				{#each cart.cartItems as item, i}
					<CartItem {item} />
				{/each}
				<div class="mt-3">
					<p class="font-semibold">Total: {cart.cartStats.total.toFixed(2)}</p>
				</div>

				<a href={user ? '/checkout' : '/login'} onclick={() => (cart.cartopen = false)}>
					<button
						class="hover:bg-primary rounded-md border border-gray-300 px-2 py-1 transition-colors hover:text-white"
					>
						Proceed to checkout
					</button>
				</a>
			{:else}
				<div>
					<i class="text-sm">Your cart is empty</i>
				</div>
			{/if}
		</div>
	</div>
{/if}

<div class="min-h-screen bg-gray-50">
	{@render children?.()}
</div>
