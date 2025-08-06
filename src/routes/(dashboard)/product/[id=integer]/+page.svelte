<script lang="ts">
	import { page } from '$app/state';
	import { getCartState } from '$lib/Cart.svelte';
	import { getToastState } from '$lib/Toast.svelte';

	const { data } = $props();
	const product = $derived(data.product);
	const cart = getCartState();
	const toast = getToastState();

	let categoriesParam = $derived.by(() => page.url.searchParams.get('categories') || '');
	let selectedYear = $derived.by(() => page.url.searchParams.get('year') || 'all');
	let currentPage = $derived.by(() => parseInt(page.url.searchParams.get('page') || '1', 10));
	let itemsPerPage = $derived.by(() => parseInt(page.url.searchParams.get('limit') || '12', 10));
	let searchQuery = $derived.by(() => page.url.searchParams.get('search') || '');

	let showMoreDetails = $state(false);
</script>

<div class="container mx-auto px-4 py-8">
	<!-- Back Navigation -->
	<div class="mb-6">
		<a
			href="/product/?categories={categoriesParam}&year={selectedYear}&page={currentPage}&limit={itemsPerPage}&search={searchQuery}"
			class="inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200"
		>
			<i class="bi bi-arrow-left"></i>
			Back to Products
		</a>
	</div>

	{#if product}
		<div class="grid gap-8 lg:grid-cols-5">
			<!-- Product Image -->
			<div class="lg:col-span-2">
				<div class="mx-auto aspect-square max-w-md overflow-hidden rounded-lg border">
					<img
						src={product.Image[0]?.url || '/coat-of-arms.jpg'}
						alt={product.name}
						class="h-full w-full object-contain"
					/>
				</div>
			</div>

			<!-- Product Details -->
			<div class="space-y-6 lg:col-span-3">
				<!-- Title -->
				<div>
					<h1 class="text-3xl font-bold text-gray-900">{product.name}</h1>
					{#if product.citation}
						<p class="mt-2 text-lg text-gray-600">{product.citation}</p>
					{/if}
				</div>

				<!-- Price -->
				<div class="border-b pb-4">
					<span class="text-primary text-3xl font-bold">KES {product.price.toLocaleString()}</span>
				</div>

				<!-- Add to Cart Button -->
				<div class="space-y-3">
					<button
						class="cursor-pointer rounded-lg px-6 py-3 text-lg font-medium text-white transition-colors {product.quantity >
						0
							? 'bg-primary hover:bg-primary/90'
							: 'cursor-not-allowed bg-gray-400'}"
						onclick={async () => {
							if (product.quantity <= 0) {
								toast.add('Error', 'Product is out of stock', 'warning');
								return;
							}

							const result = await cart.addItem(product);
							if (result.success) {
								toast.add('Success', 'Product added to cart', 'success');
							} else if (result.error) {
								toast.add('Stock Limited', result.error, 'warning');
							} else {
								if (data.user) toast.add('Error', 'Failed to Save Cart', 'error');
							}
						}}
					>
						<i class="bi {product.quantity > 0 ? 'bi-cart-plus' : 'bi-exclamation-triangle'} mr-2"></i>
						{product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
					</button>

					<!-- Stock Status -->
					<div class="flex items-center gap-2">
						{#if product.quantity > 0}
							<i class="bi bi-check-circle text-green-600"></i>
							<span class="font-medium text-green-600">In Stock ({product.quantity} available)</span>
						{:else}
							<i class="bi bi-x-circle text-red-600"></i>
							<span class="font-medium text-red-600">Out of Stock</span>
						{/if}
					</div>
				</div>

				<!-- Description -->
				<div class="border-b pb-4">
					<h3 class="mb-3 text-lg font-semibold text-gray-900">Product Description</h3>
					<p class="leading-relaxed text-gray-700">{product.description}</p>
				</div>

				<!-- Basic Product Details -->
				<div class="space-y-3">
					<!-- <h3 class="text-lg font-semibold text-gray-900">Product Details</h3> -->
					<div class="grid gap-3 sm:grid-cols-2">
						<div class="flex items-center gap-3">
							<i class="bi bi-person text-gray-500"></i>
							<span class="text-sm font-medium text-gray-600">Author:</span>
							<span class="text-sm text-gray-900">{product.author}</span>
						</div>

						<div class="flex items-center gap-3">
							<i class="bi bi-calendar3 text-gray-500"></i>
							<span class="text-sm font-medium text-gray-600">Publication Date:</span>
							<span class="text-sm text-gray-900">
								{product.publicationDate?.toLocaleDateString('en-KE', {
									year: 'numeric'
								})}
							</span>
						</div>

						<div class="flex items-center gap-3">
							<i class="bi bi-file-text text-gray-500"></i>
							<span class="text-sm font-medium text-gray-600">Citation:</span>
							<span class="text-sm text-gray-900">{product.citation || '_'}</span>
						</div>

						<div class="flex items-start gap-3">
							<i class="bi bi-tags mt-0.5 text-gray-500"></i>
							<span class="text-sm font-medium text-gray-600">Categories:</span>
							<div class="flex flex-wrap gap-2">
								{#each product.categories as category}
									<span
										class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
									>
										{category.name}
									</span>
								{/each}
							</div>
						</div>

						<!-- ISBN -->

						<div class="flex items-center gap-3">
							<i class="bi bi-upc text-gray-500"></i>
							<span class="text-sm font-medium text-gray-600">ISBN:</span>
							<span class="text-sm text-gray-900">{product.ISBN || 'ISBN'}</span>
						</div>
					</div>
				</div>

				<!-- More Details Toggle -->
				<div class="border-t pt-4">
					<button
						class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
						onclick={() => (showMoreDetails = !showMoreDetails)}
					>
						<i class="bi bi-info-circle"></i>
						More details
						<i class="bi {showMoreDetails ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
					</button>

					<!-- Expanded Details -->
					{#if showMoreDetails}
						<div class="mt-4 space-y-3 border-t pt-4">
							<div class="grid gap-3 sm:grid-cols-2">
								<div class="flex items-center gap-3">
									<i class="bi bi-calendar-plus text-gray-500"></i>
									<span class="text-sm font-medium text-gray-600">Date Created:</span>
									<span class="text-sm text-gray-900">
										{product.createdAt?.toLocaleDateString('en-KE', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</span>
								</div>
								<div class="flex items-center gap-3">
									<i class="bi bi-upc-scan text-gray-500"></i>
									<span class="text-sm font-medium text-gray-600">Service Code:</span>
									<span class="font-mono text-sm text-gray-900">{product.serviceCode}</span>
								</div>


								<!-- <div class="flex items-center gap-3">
									<i class="bi bi-calendar-check text-gray-500"></i>
									<span class="text-sm font-medium text-gray-600">Last Updated:</span>
									<span class="text-sm text-gray-900">
										{product.updatedAt?.toLocaleDateString('en-GB', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</span>
								</div> -->

								<!-- <div class="flex items-center gap-3">
									<i class="bi bi-eye text-gray-500"></i>
									<span class="text-sm font-medium text-gray-600">Publication Status:</span>
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {product.isPublished
											? 'bg-green-100 text-green-800'
											: 'bg-yellow-100 text-yellow-800'}"
									>
										<i class="bi {product.isPublished ? 'bi-check-circle' : 'bi-clock'} mr-1"></i>
										{product.isPublished ? 'Published' : 'Draft'}
									</span>
								</div> -->
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="py-12 text-center">
			<i class="bi bi-exclamation-triangle mb-4 text-6xl text-gray-400"></i>
			<h2 class="mb-2 text-2xl font-semibold text-gray-900">Product Not Found</h2>
			<p class="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
		</div>
	{/if}
</div>
