<script lang="ts">
	import { goto, invalidate } from '$app/navigation';

	const { data } = $props();

	const order = $derived(data?.order);
	const user = $derived(data?.order?.user);
	const productsOnOrder = $derived(data?.order?.ProductOnOrder || []);

	const issueProduct = async (productId: number, isIssued: boolean) => {
		if (!order) return;
		const response = await fetch(`/api/order/${order.id}/product/${productId}/issue`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ isIssued: !isIssued })
		});

		if (response.ok) {
			await invalidate('update:order');
			console.log('Product issued successfully');
		} else if (response.status === 401) {
			await goto(`/login?redirect=${window.location.pathname}`);
		} else {
			console.error('Failed to issue product');
		}
	};
	const formatDate = (date: Date) => {
		return new Date(date).toLocaleString('en-UK', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	};
</script>

{#if order}
	<main class="m-4 p-4">
		<h1 class="mb-4 text-4xl font-bold">Order Details</h1>
		<div class="mb-6">
			<h2 class="text-2xl font-semibold">User Information</h2>
			<p><strong>Name:</strong> {user?.name}</p>
			<p><strong>Email:</strong> {user?.email}</p>
			<p><strong>Order Date:</strong> {order ? formatDate(order.createdAt) : null}</p>
			<p><strong>Total Price:</strong> KES {order?.totalPrice}</p>
		</div>
		<div>
			{#each productsOnOrder as productOnOrder}
				<div class="mb-4 rounded-md border p-4 shadow-xs">
					<h3 class="text-xl font-semibold">{productOnOrder.product.name}</h3>
					<p><strong>Price:</strong> KES {productOnOrder.product.price}</p>
					<p><strong>Quantity:</strong> {productOnOrder.quantity}</p>
					<div class="flex items-center space-x-2">
						<label for="issue-{productOnOrder.product.id}">
							<strong>{productOnOrder.isIssued ? 'Issued' : 'Issue'}</strong>
						</label>
						<input
							type="checkbox"
							id="issue-{productOnOrder.product.id}"
							checked={productOnOrder.isIssued}
							onchange={() => issueProduct(productOnOrder.productId, productOnOrder.isIssued)}
							class="h-4 w-4"
						/>
					</div>
				</div>
			{/each}
		</div>
	</main>
{:else}
	<div class="flex h-full items-center justify-center">
		<p class="text-4xl font-thin">No orders</p>
	</div>
{/if}
