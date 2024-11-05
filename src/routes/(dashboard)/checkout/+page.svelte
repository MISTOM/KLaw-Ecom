<script lang="ts">
	import cart from '$lib/Cart.svelte';
	const { data } = $props();
	let price = $state(300);
</script>

<!-- Checkout page -->
<main class="m-4 grid grid-cols-1 lg:grid-cols-3">
	<section class="col-span-2">
		<h1 class="text-4xl">Order Summary</h1>
		<hr />
		<ul>
			{#each cart.cartItems as item, i}
				<div class="flex items-center">
					<img src={item.product.thumbnail} alt="Product" class="mr-4 size-12 rounded object-cover" />
					<div>
						<h4>{item.product.title}</h4>
						<span class="text-sm"><strong>KES</strong> {item.product.price}</span>
						<span class="text-sm">Quantity: {item.quantity} </span>
					</div>
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
