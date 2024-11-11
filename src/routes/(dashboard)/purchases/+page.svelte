<script lang="ts">
	import type { Order } from '@prisma/client';

	const { data } = $props();
	const orders = $derived(data?.orders || []);
	// $inspect(orders);

	function getIssuedProducts(order: any) {
		if (order) return order.ProductOnOrder.filter((product: any) => product.isIssued);
	}

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('en-KE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-3xl font-bold">My Orders</h1>

	<div class="grid gap-6">
		{#if orders.length === 0}
			<p class="text-lg text-gray-600">You have no orders yet.</p>
		{/if}
		{#each orders as order (order.id)}
			<div class="rounded-md border p-6 transition-all hover:shadow-lg">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div>
						<span class="text-sm text-gray-500">Order #{order.id}</span>
						<p class="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
					</div>

					<div class="text-right">
						<p class="text-lg font-bold">KES {order.totalPrice.toLocaleString()}</p>
						<p class="text-sm text-gray-600">
							{order.ProductOnOrder.filter((product) => !product.isIssued).length} items pending
						</p>
					</div>
				</div>

				<div class="mt-4">
					<h4 class="mb-2 font-semibold">Issued Products</h4>
					<div class="space-y-2">
						{#each getIssuedProducts(order) as product}
							<div class="rounded-md bg-gray-50 p-3">
								<div class="flex items-center justify-between">
									<div>
										<p class="font-medium">{product.product.name}</p>
										<p class="text-sm text-gray-600">Quantity: {product.quantity}</p>
									</div>
									<p class="font-semibold">
										KES {(product.product.price * product.quantity).toLocaleString()}
									</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-4 flex justify-end">
					<a
						href="/purchases/{order.id}"
						class="rounded-md bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary/90"
					>
						View Order
					</a>
				</div>
			</div>
		{/each}
	</div>
</div>
