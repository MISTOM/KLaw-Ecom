<script lang="ts">
	import type { PageData, ActionData } from './$types';

	const { data, form } = $props();

	// Helper function to format dates in a more intuitive way
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	// Helper function to get relative time (e.g., "in 5 days", "2 days ago")
	const getRelativeTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) return 'Today';
		if (diffInDays === 1) return 'Tomorrow';
		if (diffInDays === -1) return 'Yesterday';
		if (diffInDays > 1) return `in ${diffInDays} days`;
		if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`;

		return formatDate(dateString);
	};
</script>

<svelte:head>
	<title>My Subscription</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
	<div class="mx-auto max-w-4xl px-6">
		<!-- Header Section -->
		<div class="mb-12">
			<h1 class="text-3xl font-light text-gray-900">Subscription</h1>
			<div class="mt-2 h-px bg-gradient-to-r from-gray-300 via-gray-200 to-transparent"></div>
		</div>

		{#if data.subscription}
			<!-- Active Subscription Layout -->
			<div class="space-y-8">
				<!-- Plan Header -->
				<div class="flex items-start justify-between">
					<div>
						<h2 class="text-2xl font-medium text-gray-900">{data.subscription.plan.name}</h2>
						{#if data.subscription.plan.description}
							<p class="mt-1 text-gray-500">{data.subscription.plan.description}</p>
						{/if}
					</div>
					<div class="flex items-center space-x-2">
						<div
							class="h-2 w-2 rounded-full {data.subscription.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}"
						></div>
						<span
							class="text-sm font-medium {data.subscription.status === 'ACTIVE'
								? 'text-green-600'
								: 'text-red-600'}"
						>
							{data.subscription.status}
						</span>
					</div>
				</div>

				<!-- Subscription Details Grid -->
				<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
					<!-- Timeline Section -->
					<div class="lg:col-span-2">
						<h3 class="mb-4 text-lg font-medium text-gray-900">Timeline</h3>
						<div class="space-y-4">
							<div class="flex items-center space-x-4">
								<div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
									<i class="bi bi-play-fill text-blue-600"></i>
								</div>
								<div>
									<p class="text-sm font-medium text-gray-900">Started</p>
									<p class="text-sm text-gray-500">{formatDate(data.subscription.startsAt)}</p>
								</div>
							</div>

							{#if data.subscription.endsAt}
								<div class="flex items-center space-x-4">
									<div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
										<i class="bi bi-clock text-orange-600"></i>
									</div>
									<div>
										<p class="text-sm font-medium text-gray-900">Expires</p>
										<p class="text-sm text-gray-500">{formatDate(data.subscription.endsAt)}</p>
										<p class="text-xs text-gray-400">{getRelativeTime(data.subscription.endsAt)}</p>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Stats Section -->
					<div>
						<h3 class="mb-4 text-lg font-medium text-gray-900">Details</h3>
						<div class="space-y-6">
							{#if data.subscription.endsAt}
								<div>
									<p class="text-3xl font-light text-gray-900">
										{Math.max(
											0,
											Math.ceil(
												(new Date(data.subscription.endsAt).getTime() - new Date().getTime()) /
													(1000 * 60 * 60 * 24)
											)
										)}
									</p>
									<p class="text-sm text-gray-500">days remaining</p>
								</div>
							{/if}

							<div>
								<p class="text-lg font-medium text-gray-900">
									KES {data.subscription.plan.price.toLocaleString()}
								</p>
								<p class="text-sm text-gray-500">{data.subscription.plan.duration} days total</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Actions -->
				{#if data.subscription.status === 'ACTIVE'}
					<div class="border-t border-gray-200 pt-8">
						<form action="?/cancelSubscription" method="POST">
							<button
								type="submit"
								class="text-sm font-medium text-red-600 transition-colors hover:text-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
							>
								Cancel Subscription
							</button>
						</form>
					</div>
				{/if}
			</div>
		{:else}
			<!-- No Subscription State -->
			<div class="py-16 text-center">
				<div class="mx-auto mb-6 h-16 w-16 text-gray-300">
					<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="h-full w-full">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.5"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						></path>
					</svg>
				</div>
				<h3 class="text-xl font-light text-gray-900">No Active Subscription</h3>
				<p class="mt-2 text-gray-500">Start your journey with our subscription plans</p>

				<div class="mt-8">
					<a
						href="/subscription"
						class="inline-flex items-center space-x-2 text-blue-600 transition-colors hover:text-blue-700"
					>
						<span class="font-medium">View Plans</span>
						<i class="bi bi-arrow-right"></i>
					</a>
				</div>
			</div>
		{/if}
	</div>
</div>
