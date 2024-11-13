<script lang="ts">
	import { goto } from '$app/navigation';
	import { getCartState } from '$lib/Cart.svelte.js';

	// import cart from '$lib/Cart.svelte';
	const { data } = $props();

	const cart = getCartState();

	let errors = $state('');

	const createOrder = async () => {
		if (!confirm('Are you sure you want to purchase these items?')) return;
		const res = await fetch('/api/order', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(
				cart.cartItems.map((item) => ({
					quantity: item.quantity,
					product: item.product
				}))
			)
		});

		const resData = await res.json();

		if (res.ok) {
			console.log(resData.message, resData.order);
			cart.cartItems = [];
		} else if (res.status === 401) {
			console.error('Unauthorized');
			await goto(`/login?redirect=${window.location.pathname}`);
		} else if (res.status === 400) {
			console.error('Bad order request');
			errors = resData.message;
			console.log(resData.message);
		} else {
			console.error('Failed to create order');
		}
	};
</script>

<svelte:head>
	<title>Checkout</title>
</svelte:head>

<!-- Checkout page -->
<main class="m-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
	<section class="col-span-2">
		<h1 class="text-4xl">Checkout</h1>
		<hr />
		<ul>
			{#each cart.cartItems as item, i}
				<li class="my-3 flex items-center rounded-md border p-1 hover:shadow-sm">
					<span class="m-5">{i + 1}</span>
					<img
						src={item.product.Image[0]?.url || '/kLawPillers.png'}
						alt={item.product.name}
						class="mr-4 size-14"
					/>
					<div class="flex-grow">
						<h2 class="text-lg font-semibold">{item.product.name}</h2>
						<p>Price: KES {item.product.price}</p>
						<p>Quantity: {item.quantity}</p>
					</div>

					<div class="flex space-x-2"></div>
				</li>
			{/each}
		</ul>
	</section>
	<section class="">
		<div class="h-fit rounded-md border p-6">
			<h2 class="mb-4 text-xl font-semibold">Order Summary</h2>

			{#if errors}
				<p class="text-red-600">{errors}</p>
			{/if}

			<div class="space-y-2">
				<div class="flex justify-between">
					<span class="text-gray-600">Subtotal</span>
					<span class="font-medium">KES {cart.cartStats.total.toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Tax</span>
					<span class="font-medium">KES 0</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Shipping</span>
					<span class="font-medium">KES 0</span>
				</div>
				<div class="my-2 border-t"></div>
				<div class="flex justify-between">
					<span class="font-semibold">Total</span>
					<span class="font-bold">KES {cart.cartStats.total.toLocaleString()}</span>
				</div>
			</div>
			<hr />
			<button
				class="transition-color m-1 w-full rounded bg-green-600 p-1 text-white hover:opacity-90"
				onclick={createOrder}>Pay</button
			>
		</div>
	</section>
</main>
