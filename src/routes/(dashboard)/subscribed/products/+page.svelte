<script lang="ts">
	import { getCartState } from '$lib/Cart.svelte.js';
	import { getToastState } from '$lib/Toast.svelte';

	const { data } = $props();
	const products = $derived(data.products || []);
	const cart = getCartState();
	const toast = getToastState();

	// Add to cart functionality
	const addToCart = async (productId: number, productName: string) => {
		try {
			const response = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ productId, quantity: 1 })
			});

			if (response.ok) {
				// await cart.refreshCart();
				toast.add('Success', `${productName} added to cart`, 'success');
			} else {
				const error = await response.json();
				throw new Error(error.message || 'Failed to add item to cart');
			}
		} catch (error: any) {
			toast.add('Error', error.message || 'Failed to add item to cart', 'error');
		}
	};
</script>

<svelte:head>
	<title>Premium Legal Resources - Kenya Law</title>
	<meta
		name="description"
		content="Access exclusive premium legal documents available only to Kenya Law subscribers."
	/>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
		<!-- Header Section -->
		<div class="mb-8">
			<!-- Breadcrumb -->
			<nav class="mb-4 flex text-sm text-gray-500" aria-label="Breadcrumb">
				<ol class="inline-flex items-center space-x-1 md:space-x-3">
					<li class="inline-flex items-center">
						<a href="/" class="hover:text-primary transition-colors">Home</a>
					</li>
					<li>
						<div class="flex items-center">
							<i class="bi bi-chevron-right mx-2"></i>
							<span class="font-medium text-gray-900">Premium Products</span>
						</div>
					</li>
				</ol>
			</nav>

			<!-- Header -->
			<div class="flex justify-between items-center space-x-4">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Premium Legal Resources</h1>
					<p class="mt-2 text-gray-600">Exclusive access to advanced legal documents and specialized content</p>
				</div>
				<div class="relative flex-1">
						<input
							type="text"
							placeholder="Search Content..."
							
							class="focus:border-primary focus:ring-primary/30 w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:ring-5 focus:outline-hidden"
						/>
						<i class="bi bi-search absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"></i>
					</div>
					<button
						type="submit"
						class="bg-primary hover:bg-primary/90 rounded-lg px-6 py-2 text-white transition-colors"
					>
						Search
					</button>
			</div>
		</div>

		<!-- Products Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{#each products as product (product.id)}
				<div
					class="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
				>
					<!-- Product Image -->
					<div class="aspect-[4/5] overflow-hidden bg-gray-100">
						<img
							src={product.Image[0]?.url || '/coat-of-arms.jpg'}
							alt={product.name}
							class="h-full w-full object-cover transition-transform"
							loading="lazy"
						/>
					</div>

					<!-- Product Info -->
					<div class="flex flex-1 flex-col p-4">
						<div class="flex-1">
							<h3 class="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">
								{product.name}
							</h3>
							<p class="mb-2 line-clamp-3 text-xs text-gray-600">{product.description}</p>
							<p class="mb-4 text-xs text-gray-500">By {product.author}</p>
						</div>

						<!-- Price and Add to Cart -->
						<div class="mt-auto space-y-3">
							<button
								class="bg-primary hover:bg-primary/90 w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
							>
								View Document
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
