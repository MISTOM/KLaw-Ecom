<script lang="ts">
	import { slide } from 'svelte/transition';
	// import { Icon } from '$lib/components';

	export let order: any;
	let isExpanded = false;

	function formatDate(date: Date) {
		return new Date(date).toLocaleDateString('en-KE', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function getOrderStatusColor(status: string) {
		switch (status) {
			case 'COMPLETED':
				return 'bg-green-50 text-green-700 border-green-200';
			case 'PENDING':
				return 'bg-yellow-50 text-yellow-700 border-yellow-200';
			case 'CANCELLED':
				return 'bg-red-50 text-red-700 border-red-200';
			default:
				return 'bg-gray-50 text-gray-700 border-gray-200';
		}
	}
</script>

<div class="rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
	<div class="p-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center gap-3">
					<span class="text-lg font-semibold">Order #{order.id}</span>
					<span class={`rounded-full border px-3 py-1 text-sm ${getOrderStatusColor(order.status)}`}>
						{order.status}
					</span>
				</div>
				<p class="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
				{#if order.ProductOnOrder.some((item: any) => !item.isIssued)}
					<p class="text-xs text-gray-600">Order is being consolidated for dispatch</p>
				{/if}
			</div>
			<div class="text-right">
				<p class="text-primary text-xl font-bold">KES {order.totalPrice.toLocaleString()}</p>
				<p class="text-sm text-gray-600">
					{order.ProductOnOrder.length} item{order.ProductOnOrder.length !== 1 ? 's' : ''}
				</p>
			</div>
		</div>

		<div class="mt-4 flex items-center justify-between">
			<button
				class="hover:text-primary flex cursor-pointer items-center gap-2 rounded-sm bg-gray-200 p-2 text-sm"
				onclick={() => (isExpanded = !isExpanded)}
			>
				<!-- <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size="18" /> -->
				{isExpanded ? 'Hide' : 'View'} Products
			</button>
			<!-- <a
				href="/purchases/{order.id}"
				class="rounded-md bg-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-200"
			>
				Order Details
			</a> -->
		</div>
	</div>

	{#if isExpanded}
		<div class="border-t" transition:slide>
			<div class="divide-y">
				{#each order.ProductOnOrder as item}
					<div class="flex items-center justify-between p-4">
						<div class="space-y-1">
							<p class="font-medium">{item.product.name}</p>
							<p class="text-sm text-gray-600">Quantity: {item.quantity}</p>
							<span
								class={`inline-flex rounded-full px-2 py-1 text-xs
                                ${item.isIssued ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}
							>
								{item.isIssued ? 'Issued' : 'Not issued'}
							</span>
						</div>
						<p class="font-semibold">
							KES {(item.product.price * item.quantity).toLocaleString()}
						</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
