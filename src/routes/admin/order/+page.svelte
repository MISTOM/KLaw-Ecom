<script lang="ts">
	const { data } = $props();
	$inspect(data.orders);

	const orders = $derived(data?.orders || []);
</script>

<main class="m-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
	<div>
		<h1 class="text-4xl">All Purchases</h1>
		<hr />
		{#if orders.length > 0}
			{#each orders as order, i}
				<a href={`/admin/order/${order.id}`}>
					<div class="my-3 flex items-center rounded-md border p-1 hover:shadow-sm">
						<h3 class="text-xl font-semibold">Ordered by {order.user.name}</h3>
						<div class="flex-grow">
							<h2 class="text-lg font-semibold">Order Date: ${new Date(order.createdAt).toLocaleString()}</h2>
							<p>Total Price: KES {order.totalPrice}</p>
							<p>${order.ProductOnOrder.length} Items</p>
						</div>

						<div class="flex space-x-2">
							<button class="rounded-md border px-2 py-1 hover:border-primary">Issue</button>
						</div>
					</div>
				</a>
			{/each}
		{:else}
		<div class="flex items-center justify-center h-full">
			<p class="text-4xl font-thin">No orders</p>
		</div>
		{/if}
	</div>
	<div>
		<!-- Search box -->
		<div class="flex items-center">
			<input
				type="text"
				placeholder="Search for a purchase"
				class="w-full rounded-md border border-gray-300 p-2"
			/>
			<button class="rounded-md border px-2 py-1 hover:border-primary">Search</button>
		</div>
	</div>
</main>
