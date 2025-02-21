<script lang="ts">
	import OrderCard from '$lib/components/OrderCard.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const { data } = $props();
	const orders = $derived(data.orders || []);
	const currentPage = $derived(data.page || 1);
	const totalPages = $derived(data.totalPages || 1);

	function handlePageChange(page: number) {
		goto(`?page=${page}`, { keepFocus: true });
	}
</script>

<svelte:head>
	<title>My Purchases | Kenya Law</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<div class="mb-8 space-y-2">
		<h1 class="text-3xl font-bold">My Purchases</h1>
		<p class="text-gray-600">Track and manage your orders</p>
	</div>

	<div class="space-y-4">
		{#if orders.length === 0}
			<div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
				<h3 class="text-lg font-medium">No purchases yet</h3>
				<p class="mt-2 text-gray-600">When you make a purchase, it will appear here.</p>
				<a
					href="/products"
					class="bg-primary hover:bg-primary/90 mt-4 inline-block rounded-md px-4 py-2 text-sm text-white"
				>
					Browse Products
				</a>
			</div>
		{/if}

		{#each orders as order (order.id)}
			<OrderCard {order} />
		{/each}

		{#if totalPages > 1}
			<div class="mt-8 flex justify-center gap-2">
				<button
					class="rounded-md bg-gray-100 px-4 py-2 text-sm disabled:opacity-50"
					disabled={currentPage === 1}
					onclick={() => handlePageChange(currentPage - 1)}
				>
					Previous
				</button>

				{#each Array(totalPages) as _, i}
					<button
						class="rounded-md px-4 py-2 text-sm {currentPage === i + 1 ? 'bg-primary text-white' : 'bg-gray-100'}"
						onclick={() => handlePageChange(i + 1)}
					>
						{i + 1}
					</button>
				{/each}

				<button
					class="rounded-md bg-gray-100 px-4 py-2 text-sm disabled:opacity-50"
					disabled={currentPage === totalPages}
					onclick={() => handlePageChange(currentPage + 1)}
				>
					Next
				</button>
			</div>
		{/if}
	</div>
</div>
