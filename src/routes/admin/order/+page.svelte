<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';
	import { fade } from 'svelte/transition';
	const { data } = $props();
	const orders = $derived(data?.orders || []);

	const toast = getToastState();

	let searchQuery = $state('');
	let expandedOrders = $state(new Set());
	// let selectedItems = $state(new Set());

	// Reactive statement for filtered orders
	let filteredOrders = $derived.by(() =>
		orders.filter((order) => order.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);

	// Toggle order expansion
	function toggleOrderExpansion(orderId: number) {
		expandedOrders = new Set(expandedOrders);
		if (expandedOrders.has(orderId)) {
			expandedOrders.delete(orderId);
		} else {
			expandedOrders.add(orderId);
		}
	}

	// // Toggle item selection
	// function toggleItemSelection(orderId: number, productId: number) {
	// 	selectedItems = new Set(selectedItems);
	// 	const key = `${orderId}-${productId}`;
	// 	if (selectedItems.has(key)) {
	// 		selectedItems.delete(key);
	// 	} else {
	// 		selectedItems.add(key);
	// 	}
	// }

	// Handle bulk issuance
	// async function issueSelectedItems() {
	// 	// Implementation for issuing selected items
	// 	console.log('Issuing items:', selectedItems);
	// }

	const issueProduct = async (orderId: number, productId: number, isIssued: boolean) => {
		if (!confirm(`Are you sure you want to ${isIssued ? 'withdraw' : 'issued'} this product?`)) return;

		const response = await fetch(`/api/order/${orderId}/product/${productId}/issue`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ isIssued: !isIssued })
		});

		if (response.ok) {
			await invalidate('update:order');
			console.log('Product issued successfully');
			toast.add('', `Product ${isIssued ? 'withdrawed' : 'issued'} successfully`, 'info', 2000);
		} else if (response.status === 401) {
			await goto(`/login?redirect=${window.location.pathname}`);
		} else {
			console.error('Failed to issue product');
		}
	};

	function formatDate(dateString: Date) {
		return new Date(dateString).toLocaleDateString('en-UK', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>
<svelte:head>
	<title>Purchases</title>
</svelte:head>

<main class="container mx-auto p-6">
	<div class="mb-8 grid gap-6 md:grid-cols-3">
		<!-- Orders List Section -->
		<div class="md:col-span-2">
			<div class="mb-6 flex items-center justify-between">
				<h1 class="text-3xl font-bold">Orders Management</h1>
				<div class="relative">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search by customer name..."
						class="w-full rounded-lg border border-gray-200 bg-white p-2 px-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>

			<!-- {#if selectedItems.size > 0}
				<div class="mb-4 flex items-center justify-between rounded-lg bg-primary/10 p-4">
					<span class="text-sm">
						{selectedItems.size}
						{selectedItems.size === 1 ? 'item' : 'items'} selected
					</span>
					<button
						onclick={issueSelectedItems}
						class="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
					>
						Issue Selected Items
					</button>
				</div>
			{/if} -->

			<div class="space-y-4">
				{#if filteredOrders.length > 0}
					{#each filteredOrders as order (order.id)}
						<div class="overflow-hidden rounded-lg border border-gray-200 bg-white">
							<!-- Order Header -->
							<button
								type="button"
								aria-expanded={expandedOrders.has(order.id)}
								class="flex w-full items-center justify-between bg-gray-50 p-4 text-left"
								onclick={() => toggleOrderExpansion(order.id)}
							>
								<div class="flex-grow">
									<h3 class="font-semibold">Order #{order.id}</h3>
									<p class="text-sm text-gray-600">
										Ordered by {order.user.name} on {formatDate(order.createdAt)}
									</p>
								</div>
								<div class="text-right">
									<p class="font-medium">KES {order.totalPrice.toLocaleString()}</p>
									<p class="text-sm text-gray-600">
										{order.ProductOnOrder.length}
										{order.ProductOnOrder.length === 1 ? 'Item' : 'Items'}
									</p>
								</div>
							</button>

							<!-- Order Details -->
							{#if expandedOrders.has(order.id)}
								<div class="p-4" transition:fade={{ duration: 150 }}>
									<div class="space-y-3">
										{#each order.ProductOnOrder as ProductOnOrder}
											<div class="flex items-center justify-between border-b border-gray-100 pb-3">
												<div class="flex items-center space-x-4">
													<input
														type="checkbox"
														class="h-4 w-4 rounded border-gray-300"
														checked={ProductOnOrder.isIssued}
														onchange={async () =>
															await issueProduct(order.id, ProductOnOrder.product.id, ProductOnOrder.isIssued)}
													/>
													<div>
														<p class="font-medium">{ProductOnOrder.product.name}</p>
														<p class="text-sm text-gray-600">
															Quantity: {ProductOnOrder.quantity}
														</p>
													</div>
												</div>
												<div class="text-right">
													<p class="font-medium">
														KES {(ProductOnOrder.product.price * ProductOnOrder.quantity).toLocaleString()}
													</p>
													<span
														class:bg-green-100={ProductOnOrder.isIssued}
														class:text-green-800={ProductOnOrder.isIssued}
														class:bg-yellow-100={!ProductOnOrder.isIssued}
														class:text-yellow-800={!ProductOnOrder.isIssued}
														class="inline-block rounded-full px-2 py-1 text-xs"
													>
														{ProductOnOrder.isIssued ? 'Issued' : 'Pending'}
													</span>
												</div>
											</div>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					{/each}
				{:else}
					<div class="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300">
						<p class="text-lg text-gray-500">No orders found</p>
					</div>
				{/if}
			</div>
		</div>
		<!-- Summary Section -->
		<div class="space-y-4">
			<div class="rounded-lg border border-gray-200 bg-white p-6">
				<h2 class="mb-4 text-xl font-semibold">Orders Summary</h2>
				<div class="space-y-3">
					<div class="flex justify-between">
						<span class="text-gray-600">Total Orders</span>
						<span class="font-medium">{orders.length}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Pending Items</span>
						<span class="font-medium">
							{orders.reduce((acc, order) => acc + order.ProductOnOrder.filter((p) => !p.isIssued).length, 0)}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Issued Items</span>
						<span class="font-medium">
							{orders.reduce((acc, order) => acc + order.ProductOnOrder.filter((p) => p.isIssued).length, 0)}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>

<!-- main class="m-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
	<div>
		<h1 class="text-4xl">All Purchases</h1>
		<hr />
		{#if href={`/admin/ord}{#each d}`}>
 as order, i}<a href={ flex items-center rounded}>
					<div
						class="my-3 flex items-center rounded-md border p-1 transition-colors hover:bg-amber-50 hover:shadow"
					>
						<span class="m-5">{3 class=}</span>
						<div class="flex-grow">
							<h3 class="font-semibold">Ordered by {								Order D}</h3>
							<h2 class="font-semibold">
								Order Date: {									day: 'numeric',
									month: 'short',
									year: 'numeric'
								})}
							</h2>
							<p>Total Price: KES {order.totalPr}
							</h2>
							<p>Total Price: KES {ngth} {order.Pro}</p>
							<p>{h > 1 ? 'Items' : 'Item'}</} {						</div>
					</div>
				</a>
			{/each}
		{:e}</p>
						</div>
					</div>
				</a>{/each}{:else}<div class="flex h-full items-center justify-center">
				<p class="text-4xl font-thin">No orders</p>
			</div>{/if}
	</div>
	<div>
		<-- Search box
		<div class="flex items-center">
			<input
				type="text"
				placeholder="Search for a purchase"
				class="w-full rounded-md border border-gray-300 p-2"
			/>
			<button class="rounded-md border px-2 py-1 hover:border-primary">Search</button>
		</div>
	</div>
</main -->
