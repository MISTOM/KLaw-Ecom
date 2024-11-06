<!-- Purchase Details -->
<script lang="ts">
	const { data } = $props();
	const order = $derived(data.order);

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('en-KE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

{#if order}
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8 flex items-center gap-4">
			<a href="/purchases" class="rounded-md bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200">
				← Back to Orders
			</a>
			<h1 class="text-3xl font-bold">Order #{order.id}</h1>
		</div>

		<div class="grid gap-8 md:grid-cols-3">
			<div class="md:col-span-2">
				<div class="rounded-md border p-6">
					<h2 class="mb-4 text-xl font-semibold">Order Details</h2>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<p class="text-sm text-gray-500">Order Date</p>
							<p class="font-medium">{formatDate(order.createdAt)}</p>
						</div>

						<div>
							<p class="text-sm text-gray-500">Status</p>
							<p class="font-medium"> NOT/Issued</p>
						</div>
					</div>
				</div>

				<div class="mt-8 rounded-md border p-6">
					<h2 class="mb-4 text-xl font-semibold">Products</h2>

					<div class="space-y-4">
						{#each order.ProductOnOrder as product }
							<div class="rounded-md border p-4">
								<div class="flex items-center justify-between">
									<div>
										<h3 class="font-semibold">{product.product.name}</h3>
										<p class="text-sm text-gray-600">Quantity: {product.quantity}</p>
										<p class="mt-1 text-sm">
											Status:
											<span class={product.isIssued ? 'text-green-600' : 'text-orange-600'}>
												{product.isIssued ? 'Issued' : 'Pending'}
											</span>
										</p>
									</div>
									<div class="text-right">
										<p class="font-semibold">
											KES {(product.product.price * product.quantity).toLocaleString()}
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="h-fit rounded-md border p-6">
				<h2 class="mb-4 text-xl font-semibold">Order Summary</h2>

				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-gray-600">Subtotal</span>
						<span class="font-medium">KES {order.totalPrice.toLocaleString()}</span>
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
						<span class="font-bold">KES {order.totalPrice.toLocaleString()}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto px-4 py-8">
		<h1 class="text-3xl font-bold">Order not found</h1>
	</div>
{/if}
