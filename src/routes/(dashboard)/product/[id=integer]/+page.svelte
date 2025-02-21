<script lang="ts">
	import { page } from '$app/state';
	import { getCartState } from '$lib/Cart.svelte';
	import { getToastState } from '$lib/Toast.svelte';

	const { data } = $props();
	const product = $derived(data.product);
	const cart = getCartState();
	const toast = getToastState();

	let categoryParam = $derived.by(() => page.url.searchParams.get('category') || 'all');
</script>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 flex items-center gap-4">
		<a
			href="/product/?category={categoryParam}"
			class="rounded-md bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200"
		>
			← Back to Products
		</a>
		<h1 class="text-3xl font-bold">{product?.name}</h1>
	</div>

	{#if product}
		<div class="grid gap-8 md:grid-cols-2">
			<div class="aspect-square overflow-hidden rounded-md">
				<img
					src={product.Image[0]?.url || '/coat-of-arms.jpg'}
					alt={product.name}
					class="h-full w-full object-contain transition-transform"
				/>
			</div>

			<div>
				<p class="mb-4 text-lg text-gray-600">{product.description}</p>

				<div class="mb-4 flex items-center justify-between">
					<span class="text-2xl font-bold">KES {product.price.toLocaleString()}</span>
					<button
						class="rounded-md px-3 py-2 text-sm text-white transition-colors {product.quantity > 0
							? 'bg-primary hover:bg-primary/90'
							: 'cursor-not-allowed bg-gray-400'}"
						onclick={async () => {
							if (product.quantity <= 0) {
								toast.add('Error', 'Product is out of stock', 'warning', 2000);
								return;
							}
							if (await cart.addItem(product)) {
								toast.add('Success', 'Product added to cart', 'success', 2000);
							} else {
								console.log('product not added to cart');
								if (data.user) toast.add('Error', 'Failed to Save Cart', 'error', 2000);
							}
						}}
					>
						{product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
					</button>
				</div>

				<div class="space-y-4 border-t pt-4">
					{#if product.quantity > 0}
						<p class="text-green-600">In Stock</p>
					{:else}
						<p class="text-red-600">Out of Stock</p>
					{/if}

					<div>
						<p class="mb-2 font-medium">Product Details</p>
						<ul class="space-y-1 text-sm text-gray-600">
							<li>Author: {product.author}</li>
							<li>Pages: {product.pageCount}</li>
							<li>
								Publication Date: {product.publicationDate?.toLocaleDateString('en-uk', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</li>
							<!-- Categories -->
							<li>
								Categories:
								{#each product.categories as category}
									<span>{category.name} </span>
								{/each}
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p>No product found</p>
	{/if}
</div>
