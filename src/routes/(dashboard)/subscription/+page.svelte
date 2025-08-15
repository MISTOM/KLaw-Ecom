<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Modal from '$lib/components/Modal.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { getToastState } from '$lib/Toast.svelte.js';

	const { data } = $props();
	const toast = getToastState();

	type plan = (typeof data.plans)[0];

	// Modal states
	let showConfirmModal = $state(false);
	let showPaymentModal = $state(false);
	let loading = $state(false);
	let paymentStatus = $state('initial'); // 'initial' | 'processing' | 'failed'
	let paymentError = $state('');
	let selectedPlan = $state<plan | null>(null);
	let paymentDetails = $state(null);

	// Helper function to get plan features (you can customize this based on your data structure)
	const getPlanFeatures = (plan: any) => {
		// If features are stored in the plan object, return them
		// Otherwise, return default features based on plan type
		return (
			plan.features || [
				'Access to all legal documents',
				'Premium content library',
				'24/7 customer support',
				'Advanced search functionality'
			]
		);
	};

	// Helper to determine if a plan is popular/recommended
	const isPopularPlan = (plan: any) => {
		// You can customize this logic based on your business needs
		return (
			plan.isPopular || plan.name.toLowerCase().includes('premium') || plan.name.toLowerCase().includes('pro')
		);
	};

	// Handle plan selection
	const selectPlan = (plan: plan) => {
		selectedPlan = plan;
		showConfirmModal = true;
	};

	// Initiate subscription payment
	const initiateSubscriptionPayment = async () => {
		if (!selectedPlan) return;

		showConfirmModal = false;
		paymentStatus = 'processing';
		loading = true;

		try {
			// Fetch payment details for subscription
			const response = await fetch('/api/subscription/payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					planId: selectedPlan.id,
					planPrice: selectedPlan.price,
					planName: selectedPlan.name
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw error;
			}

			const responseData = await response.json();
			paymentDetails = responseData.paymentDetails; // Extract the actual payment details

			// Show payment modal and submit form
			showPaymentModal = true;
			await tick();

			const form = document.getElementById('subscription-payment-form') as HTMLFormElement;
			if (form && paymentDetails) {
				form.submit();
			} else {
				throw new Error('Payment form not found');
			}
		} catch (err: any) {
			paymentStatus = 'failed';
			paymentError = err?.message || 'Failed to initiate subscription payment';
			toast.add('Error', err?.message || 'Something went wrong', 'error');
			showPaymentModal = false;
		} finally {
			loading = false;
		}
	};

	// Handle payment iframe messages
	const handlePaymentMessage = (event: MessageEvent) => {
		if (event.origin === 'https://test.pesaflow.com') {
			const { status, message } = event.data;
			if (status === 'success') {
				window.location.href = '/profile?subscription=success';
			} else if (status === 'failed') {
				paymentStatus = 'failed';
				paymentError = message || 'Subscription payment failed';
				showPaymentModal = false;
			}
		}
	};

	onMount(() => {
		window.addEventListener('message', handlePaymentMessage);
		return () => window.removeEventListener('message', handlePaymentMessage);
	});
</script>

<svelte:head>
	<title>Subscription Plans - Kenya Law</title>
	<meta
		name="description"
		content="Choose the perfect subscription plan for accessing Kenya's comprehensive legal document library. Flexible pricing for individuals and organizations."
	/>
</svelte:head>

<!-- Subscription Plans Page -->
<main class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Header Section -->
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
				Choose Your
				<span class="from-primary bg-gradient-to-r to-gray-900 bg-clip-text text-transparent"> Perfect Plan </span>
			</h1>
			<p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 sm:text-xl">
				Get unlimited access to Kenya's most comprehensive legal document library. Choose the plan that fits your
				needs and budget.
			</p>

			<!-- Trust indicators -->
			<div class="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
				<div class="flex items-center">
					<i class="bi bi-shield-check mr-2 text-green-500"></i>
					<span>Secure & Trusted</span>
				</div>
				<div class="flex items-center">
					<i class="bi bi-arrow-clockwise mr-2 text-blue-500"></i>
					<span>Cancel Anytime</span>
				</div>
				<div class="flex items-center">
					<i class="bi bi-headset mr-2 text-purple-500"></i>
					<span>24/7 Support</span>
				</div>
			</div>
		</div>

		<!-- Pricing Cards -->
		<div class="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
			{#each data.plans as plan, index}
				<div
					class="hover:ring-primary/50 relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-200 transition-all duration-150 hover:shadow-xl hover:ring-2 {isPopularPlan(
						plan
					)
						? 'ring-primary scale-105 ring-2'
						: ''}"
				>
					<!-- Popular badge -->
					{#if isPopularPlan(plan)}
						<div class="absolute -top-4 left-1/2 -translate-x-1/2">
							<span
								class="from-primary to-secondary inline-flex items-center rounded-full bg-gradient-to-r px-4 py-1 text-xs font-semibold text-white shadow-lg"
							>
								<i class="bi bi-star-fill mr-1"></i>
								Most Popular
							</span>
						</div>
					{/if}

					<!-- Card Header -->
					<div
						class="px-8 pt-8 pb-6 {isPopularPlan(plan) ? 'from-primary/5 to-secondary/5 bg-gradient-to-br' : ''}"
					>
						<div class="text-center">
							<h3 class="text-2xl font-bold text-gray-900">{plan.name}</h3>
							<p class="mt-2 text-gray-600">{plan.description}</p>

							<!-- Pricing -->
							<div class="mt-6">
								<div class="flex items-baseline justify-center">
									<span class="text-5xl font-bold tracking-tight text-gray-900">
										KES {plan.price.toLocaleString()}
									</span>
								</div>
								<p class="mt-1 text-sm text-gray-500">
									for {plan.duration} days
									{#if plan.duration >= 30}
										<span class="ml-1 font-medium text-green-600/80">
											(KES {Math.round(plan.price / (plan.duration / 30)).toLocaleString()}/month)
										</span>
									{/if}
								</p>
							</div>
						</div>
					</div>

					<!-- Features List -->
					<div class="flex-1 px-8 pb-8">
						<ul class="space-y-4">
							{#each getPlanFeatures(plan) as feature}
								<li class="flex items-start">
									<i class="bi bi-check-circle-fill mt-0.5 mr-3 flex-shrink-0 text-green-500"></i>
									<span class="text-gray-700">{feature}</span>
								</li>
							{/each}
						</ul>

						<!-- Value proposition for longer plans -->
						{#if plan.duration >= 365}
							<div class="mt-6 rounded-lg bg-green-50 p-4">
								<div class="flex items-center">
									<i class="bi bi-piggy-bank text-green-500"></i>
									<span class="ml-2 text-sm font-medium text-green-800">
										Save {Math.round(
											(((plan.price / plan.duration) * 365 - plan.price) / ((plan.price / plan.duration) * 365)) *
												100
										)}% compared to monthly billing
									</span>
								</div>
							</div>
						{/if}
					</div>

					<!-- CTA Button -->
					<div class="px-8 pb-8">
						<button
							onclick={() => selectPlan(plan)}
							class="block w-full rounded-lg px-4 py-3 text-center text-base font-semibold transition-all duration-200 {isPopularPlan(
								plan
							)
								? 'from-primary to-secondary bg-gradient-to-r text-white shadow-lg hover:scale-105 hover:shadow-xl'
								: 'bg-gray-900 text-white shadow-sm hover:bg-gray-800 hover:shadow-md'}"
						>
							<!-- {#if index === 0}
								Start Free Trial
							{:else}
								Subscribe Now
							{/if} -->
							Subscribe Now
						</button>

						<p class="mt-3 text-center text-xs text-gray-500">
							<!-- {#if index === 0}
								No credit card required
							{:else}
								Upgrade or cancel anytime
								{/if} -->
							Upgrade or cancel anytime
						</p>
					</div>
				</div>
			{/each}
		</div>

		<!-- FAQ or Additional Info Section -->
		<div class="mt-20">
			<div class="text-center">
				<h2 class="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
				<p class="mt-4 text-lg text-gray-600">Everything you need to know about our subscription plans</p>
			</div>

			<div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<h3 class="text-lg font-semibold text-gray-900">Can I change my plan later?</h3>
					<p class="mt-2 text-gray-600">
						Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing
						cycle.
					</p>
				</div>

				<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<h3 class="text-lg font-semibold text-gray-900">What payment methods do you accept?</h3>
					<p class="mt-2 text-gray-600">
						We accept all major credit cards, M-Pesa, and bank transfers for your convenience.
					</p>
				</div>

				<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<h3 class="text-lg font-semibold text-gray-900">Is there a cancellation fee?</h3>
					<p class="mt-2 text-gray-600">
						No, there are no cancellation fees. You can cancel your subscription at any time from your account
						dashboard.
					</p>
				</div>

				<div class="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
					<h3 class="text-lg font-semibold text-gray-900">Do you offer refunds?</h3>
					<p class="mt-2 text-gray-600">
						We offer a 7-day money-back guarantee if you're not satisfied with our service.
					</p>
				</div>
			</div>
		</div>

		<!-- Contact Section -->
		<div class="from-primary to-secondary mt-20 rounded-2xl bg-gradient-to-r p-8 text-center text-white">
			<h2 class="text-3xl font-bold">Need a Custom Plan?</h2>
			<p class="mt-4 text-lg opacity-90">
				Looking for enterprise solutions or have specific requirements? We'd love to help.
			</p>
			<div class="mt-6">
				<a
					href="/contact"
					class="text-primary inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold shadow-lg transition-all hover:bg-gray-50 hover:shadow-xl"
				>
					<i class="bi bi-chat-dots mr-2"></i>
					Contact Sales
				</a>
			</div>
		</div>
	</div>
</main>

<!-- Subscription Confirmation Modal -->
<Modal bind:show={showConfirmModal} title="Confirm Your Subscription">
	{#if selectedPlan}
		<div class="space-y-6">
			<!-- Plan Details Summary -->
			<div class="rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-6">
				<div class="text-center">
					<h3 class="text-2xl font-bold text-gray-900">{selectedPlan.name}</h3>
					<p class="mt-2 text-gray-600">{selectedPlan.description}</p>

					<div class="mt-4">
						<div class="flex items-baseline justify-center">
							<span class="text-primary text-4xl font-bold">
								KES {selectedPlan.price.toLocaleString()}
							</span>
						</div>
						<p class="mt-1 text-sm text-gray-500">
							for {selectedPlan.duration} days
							{#if selectedPlan.duration >= 30}
								<span class="ml-1 font-medium text-green-600">
									(KES {Math.round(selectedPlan.price / (selectedPlan.duration / 30)).toLocaleString()}/month)
								</span>
							{/if}
						</p>
					</div>
				</div>
			</div>

			<!-- Features Included -->
			<div class="rounded-lg bg-green-50 p-4">
				<h4 class="mb-3 text-sm font-medium text-green-900">What's Included:</h4>
				<ul class="space-y-2">
					{#each getPlanFeatures(selectedPlan) as feature}
						<li class="flex items-center text-sm text-green-800">
							<i class="bi bi-check-circle-fill mr-2 text-green-600"></i>
							{feature}
						</li>
					{/each}
				</ul>
			</div>

			<div class="flex items-start space-x-3">
				<i class="bi bi-info-circle-fill mt-0.5 text-blue-500"></i>
				<div class="text-sm text-gray-700">
					<p>
						By confirming this subscription, you agree to our terms and conditions. You will be redirected to our
						secure payment gateway to complete the transaction. Your subscription will activate immediately upon
						successful payment.
					</p>
				</div>
			</div>
		</div>

		<div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
			<button
				class="focus:ring-primary w-full rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:w-auto"
				onclick={() => (showConfirmModal = false)}
			>
				Cancel
			</button>
			<button
				class="w-full rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
				onclick={initiateSubscriptionPayment}
			>
				<i class="bi bi-credit-card mr-2"></i>
				Confirm & Subscribe
			</button>
		</div>
	{/if}
</Modal>

<!-- Payment Status Feedback -->
{#if paymentStatus === 'failed'}
	<div class="fixed right-4 bottom-4 z-50 max-w-sm" transition:fade>
		<div class="rounded-lg border border-red-200 bg-white shadow-lg">
			<div class="p-4">
				<div class="flex items-start">
					<div class="flex-shrink-0">
						<i class="bi bi-exclamation-triangle-fill text-lg text-red-400"></i>
					</div>
					<div class="ml-3 w-0 flex-1">
						<h4 class="text-sm font-medium text-red-800">Subscription Payment Failed</h4>
						<p class="mt-1 text-sm text-red-700">{paymentError}</p>
						<div class="mt-3 flex space-x-3">
							<button
								class="text-sm font-medium text-red-600 hover:text-red-500"
								onclick={() => (paymentStatus = 'initial')}
							>
								Try Again
							</button>
							<button
								class="text-sm font-medium text-gray-600 hover:text-gray-500"
								onclick={() => (paymentStatus = 'initial')}
							>
								Dismiss
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Subscription Payment Modal -->
<Modal bind:show={showPaymentModal} title="Complete Your Subscription" modalClass="max-w-4xl">
	<div class="space-y-4">
		<div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
			<i class="bi bi-shield-check text-green-500"></i>
			<span>Secure payment powered by PesaFlow</span>
		</div>

		<!-- Hidden Payment Form -->
		{#if paymentDetails}
			<form
				id="subscription-payment-form"
				method="post"
				action="https://test.pesaflow.com/PaymentAPI/iframev2.1.php"
				target="subscription_frame"
				class="hidden"
			>
				<input type="hidden" name="apiClientID" value={paymentDetails.apiClientID} />
				<input type="hidden" name="secureHash" value={paymentDetails.secureHash} />
				<input type="hidden" name="billDesc" value={paymentDetails.billDesc} />
				<input type="hidden" name="billRefNumber" value={paymentDetails.billRefNumber} />
				<input type="hidden" name="currency" value={paymentDetails.currency} />
				<input type="hidden" name="serviceID" value={paymentDetails.serviceID} />
				<input type="hidden" name="clientMSISDN" value={paymentDetails.clientMSISDN} />
				<input type="hidden" name="clientName" value={paymentDetails.clientName} />
				<input type="hidden" name="clientIDNumber" value={paymentDetails.clientIDNumber} />
				<input type="hidden" name="clientEmail" value={paymentDetails.clientEmail} />
				<input type="hidden" name="callBackURLOnSuccess" value={paymentDetails.callBackURLOnSuccess} />
				<input type="hidden" name="callBackURLOnFail" value={paymentDetails.callBackURLOnFail} />
				<input type="hidden" name="notificationURL" value={paymentDetails.notificationURL} />
				<input type="hidden" name="pictureURL" value={paymentDetails.pictureURL} />
				<input type="hidden" name="amountExpected" value={paymentDetails.amountExpected} />
			</form>
		{/if}

		<div class="relative h-full w-full">
			{#if loading}
				<div class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
					<div class="text-center">
						<Spinner />
						<p class="mt-2 text-sm text-gray-600">Loading secure payment form...</p>
					</div>
				</div>
			{/if}
			<iframe
				class="h-[600px] w-full rounded-lg border border-gray-200"
				name="subscription_frame"
				title="Subscription Payment Form"
				onload={() => (loading = false)}
			></iframe>
		</div>

		<div class="rounded-lg bg-blue-50 p-3">
			<div class="flex">
				<i class="bi bi-info-circle text-blue-400"></i>
				<div class="ml-2">
					<p class="text-xs text-blue-800">
						<strong>Note:</strong> Do not close this window until your payment is complete. Your subscription will activate
						immediately upon successful payment.
					</p>
				</div>
			</div>
		</div>
	</div>
</Modal>
