<script lang="ts">
	import { getCartState } from '$lib/Cart.svelte.js';

	// import cart from '$lib/Cart.svelte';
	const { data } = $props();

	const cart = getCartState()
</script>

<!-- Checkout page -->
<main class="m-4 grid grid-cols-1 lg:grid-cols-3">
	<section class="col-span-2">
		<h1 class="text-4xl">Order Summary</h1>
		<hr />
		<ul>
			{#each cart.cartItems as item, i}
				<div class="my-3 flex items-center rounded-md border p-1 hover:shadow-sm">
					<span class="m-5">{i}</span>
					<img src={item.product.Image[0]?.url} alt={item.product.name} class="mr-4 size-14" />
					<div class="flex-grow">
						<h2 class="text-lg font-semibold">{item.product.name}</h2>
						<p>Price: KES {item.product.price}</p>
						<p>Quantity: {item.quantity}</p>
					</div>

					<div class="flex space-x-2"></div>
				</div>
			{/each}
		</ul>
	</section>
	<section class="flex flex-col">
		<h1 class="flex justify-between text-4xl font-semibold">
			<span>Total:</span>
			<span>KES {cart.cartStats.total.toFixed(2)}</span>
		</h1>
		<hr />
		<button class="m-1 w-full rounded bg-green-500 p-1 transition-colors hover:bg-green-600 hover:text-white"
			>Pay</button
		>
	</section>
</main>
