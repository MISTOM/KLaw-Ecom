<script lang="ts">
	import type { PageData, ActionData } from './$types';

	const { data, form } = $props();
</script>

<svelte:head>
	<title>My Subscription</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-8 text-4xl font-bold">My Subscription</h1>

	{#if data.subscription}
		<div class="rounded-lg border border-gray-200 bg-white p-8 shadow-lg">
			<h2 class="text-2xl font-bold text-gray-800">{data.subscription.plan.name}</h2>
			<p class="mt-2 text-gray-600">Status: <span class="font-semibold">{data.subscription.status}</span></p>
			<p class="mt-2 text-gray-600">Subscribed on: {new Date(data.subscription.startsAt).toLocaleDateString()}</p>
			{#if data.subscription.endsAt}
				<p class="mt-2 text-gray-600">Expires on: {new Date(data.subscription.endsAt).toLocaleDateString()}</p>
			{/if}

			{#if data.subscription.status === 'ACTIVE'}
				<form action="?/cancelSubscription" method="POST" class="mt-8">
					<button type="submit" class="btn btn-error">Cancel Subscription</button>
				</form>
			{/if}
		</div>
	{:else}
		<div class="text-center">
			<p class="text-lg text-gray-600">You do not have any subscriptions.</p>
			<a href="/pricing" class="text-primary hover:underline">View pricing plans</a>
		</div>
	{/if}
</div>
