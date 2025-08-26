<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { getCartState } from '$lib/Cart.svelte.js';
	import Spinner from '$lib/components/Spinner.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { getToastState } from '$lib/Toast.svelte.js';

	const { data } = $props();

	const paymentDetails = $derived(data.paymentDetails);
	const convenienceFee = $derived(data.convenienceFee);

	// $inspect(paymentDetails, data);

	const cart = getCartState();

	const toast = getToastState();

	let errors = $state('');
	let showConfirmModal = $state(false);
	let showPaymentModal = $state(false);
	let loading = $state(false);
	let paymentStatus = $state('initial'); // 'initial' | 'processing' | 'failed'
	let paymentError = $state('');

	// Pricing derivations (promotion aware)
	// Reason: discountedPrice/appliedPromotion are injected dynamically; create typed accessors to satisfy TS.
	function getDiscounted(p: any): number | null {
		return typeof p?.discountedPrice === 'number' ? p.discountedPrice : null;
	}
	function getPromo(p: any): any | null {
		return p?.appliedPromotion || null;
	}
	let originalSubtotal = $derived(cart.cartItems.reduce((acc, ci) => acc + ci.product.price * ci.quantity, 0));
	let discountedSubtotal = $derived(cart.cartStats.total); // cartStats.total already uses discounted price if available
	let totalSavings = $derived(Math.max(0, originalSubtotal - discountedSubtotal));
	let totalPrice = $derived(discountedSubtotal + (convenienceFee?.amount || 0));

	const initiatePayment = async () => {
		showConfirmModal = false;
		paymentStatus = 'processing';

		try {
			// Validate current stock levels
			const validateRes = await fetch('/api/order/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					cartItems: cart.cartItems.map((item) => ({
						quantity: item.quantity,
						product: item.product
					}))
				})
			});

			if (!validateRes.ok) {
				const error = await validateRes.json();
				throw error;
			}

			// If validation passes, show payment modal and submit form
			showPaymentModal = true;
			const form = document.getElementById('payment-form') as HTMLFormElement;
			if (form) {
				loading = true;
				await tick();
				form.submit();
			} else {
				throw new Error('Payment form not found');
			}
		} catch (err: any) {
			paymentStatus = 'failed';
			//@ts-ignore
			paymentError = err?.body?.message || 'Failed to initiate payment';
			toast.add('Error', err?.body?.message || 'Something went wrong', 'error');
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
				window.location.href = '/purchases?payment=success';
			} else if (status === 'failed') {
				paymentStatus = 'failed';
				paymentError = message || 'Payment failed';
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
	<title>Checkout</title>
</svelte:head>
<!-- Checkout page -->
<main class="min-h-screen bg-gray-50 py-4 sm:py-8">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<!-- Breadcrumb -->
		<nav class="mb-4 flex text-sm text-gray-500" aria-label="Breadcrumb">
			<ol class="inline-flex items-center space-x-1 md:space-x-3">
				<li class="inline-flex items-center">
					<a href="/" class="hover:text-primary">Home</a>
				</li>
				<li>
					<div class="flex items-center">
						<i class="bi bi-chevron-right mx-2"></i>
						<a href="/product" class="hover:text-primary">Products</a>
					</div>
				</li>
				<li aria-current="page">
					<div class="flex items-center">
						<i class="bi bi-chevron-right mx-2"></i>
						<span class="font-medium text-gray-900">Checkout</span>
					</div>
				</li>
			</ol>
		</nav>

		<!-- Back button and header -->
		<div class="mb-6 sm:mb-8">
			<a
				href="/"
				class="mb-4 inline-flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm transition-colors hover:bg-gray-200"
			>
				<i class="bi bi-arrow-left mr-2"></i>
				Back to Shopping
			</a>
			<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">Checkout</h1>
			<p class="mt-2 text-gray-600">Review your order and complete your purchase</p>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
			<!-- Cart Items Section -->
			<section class="lg:col-span-2">
				<div class="rounded-sm bg-white shadow-sm">
					<div class="border-b border-gray-200 px-4 py-4 sm:px-6">
						<h2 class="text-lg font-semibold text-gray-900 sm:text-xl">Order Items</h2>
						<p class="text-sm text-gray-500">
							{cart.cartItems.length} item{cart.cartItems.length !== 1 ? 's' : ''} in your cart
						</p>
					</div>

					<div class="divide-y divide-gray-200">
						{#each cart.cartItems as item, i}
							<div class="p-4 transition-colors hover:bg-gray-50 sm:p-6">
								<div class="flex items-start space-x-4">
									<!-- Product Image -->
									<div
										class="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100 sm:h-20 sm:w-20"
									>
										<img
											src={item.product.Image[0]?.url || '/noImage.jpg'}
											alt={item.product.name}
											class="h-full w-full object-cover object-center"
										/>
									</div>

									<!-- Product Details -->
									<div class="min-w-0 flex-1">
										<h3 class="text-sm font-medium text-gray-900 sm:text-base">{item.product.name}</h3>
										<p class="mt-1 text-xs text-gray-500 sm:text-sm">
											{#if item.product.author}
												by {item.product.author}
											{/if}
										</p>
										<div class="mt-2 space-y-1">
											{#if getDiscounted(item.product) !== null}
												<div class="flex flex-wrap items-center gap-2">
													<span class="text-primary text-base font-semibold sm:text-lg"
														>KES {getDiscounted(item.product)?.toLocaleString()}</span
													>
													<span class="text-xs text-gray-400 line-through sm:text-sm"
														>KES {item.product.price.toLocaleString()}</span
													>
													{#if getPromo(item.product)}
														<span class="bg-primary/10 text-primary rounded px-2 py-0.5 text-[10px] font-medium">
															{#if getPromo(item.product).discountType === 'PERCENT'}
																{getPromo(item.product).discountValue}% off
															{:else}
																Save KES {getPromo(item.product).discountValue.toLocaleString()}
															{/if}
														</span>
													{/if}
													<span class="text-xs text-gray-500 sm:text-sm">Qty: {item.quantity}</span>
												</div>
												<p class="text-xs text-gray-500">
													Line subtotal: KES {(getDiscounted(item.product)! * item.quantity).toLocaleString()}
												</p>
												<p class="text-[11px] text-green-600">
													Saved KES {(
														(item.product.price - getDiscounted(item.product)!) *
														item.quantity
													).toLocaleString()}
												</p>
											{:else}
												<div class="flex flex-wrap items-center gap-2">
													<span class="text-base font-semibold text-gray-900 sm:text-lg"
														>KES {item.product.price.toLocaleString()}</span
													>
													<span class="text-xs text-gray-500 sm:text-sm">Qty: {item.quantity}</span>
												</div>
												<p class="text-xs text-gray-500">
													Line subtotal: KES {(item.product.price * item.quantity).toLocaleString()}
												</p>
											{/if}
										</div>
									</div>

									<!-- Total Price and Remove Button -->
									<div class="flex flex-col items-end space-y-2">
										{#if getDiscounted(item.product) !== null}
											<p class="text-sm font-semibold text-gray-900 sm:text-lg">
												KES {(getDiscounted(item.product)! * item.quantity).toLocaleString()}
											</p>
										{:else}
											<p class="text-sm font-semibold text-gray-900 sm:text-lg">
												KES {(item.product.price * item.quantity).toLocaleString()}
											</p>
										{/if}
										<button
											aria-label="Remove item"
											class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
											onclick={() => cart.removeItem(item.id)}
											title="Remove item"
										>
											<i class="bi bi-trash text-sm"></i>
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>

					{#if cart.cartItems.length === 0}
						<div class="px-6 py-12 text-center">
							<i class="bi bi-cart-x mx-auto text-4xl text-gray-300"></i>
							<h3 class="mt-2 text-sm font-medium text-gray-900">Your cart is empty</h3>
							<p class="mt-1 text-sm text-gray-500">Start shopping to add items to your cart.</p>
							<div class="mt-6">
								<a
									href="/product"
									class="bg-primary hover:bg-primary/90 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm"
								>
									<i class="bi bi-plus mr-2"></i>
									Continue Shopping
								</a>
							</div>
						</div>
					{/if}
				</div>
			</section>
			<!-- Order Summary Section -->
			<section class="lg:col-span-1">
				<div class="sticky top-4 lg:top-8">
					<div class="rounded-sm bg-white shadow-sm">
						<div class="border-b border-gray-200 px-4 py-4 sm:px-6">
							<h2 class="text-lg font-semibold text-gray-900 sm:text-xl">Order Summary</h2>
						</div>

						<div class="p-4 sm:p-6">
							{#if errors}
								<div class="mb-4 rounded-lg bg-red-50 p-4">
									<div class="flex">
										<i class="bi bi-exclamation-triangle-fill text-red-400"></i>
										<div class="ml-3">
											<p class="text-sm text-red-800">{errors}</p>
										</div>
									</div>
								</div>
							{/if}

							<div class="space-y-3">
								<div class="flex justify-between text-sm">
									<span class="text-gray-600"
										>Subtotal ({cart.cartItems.length} item{cart.cartItems.length !== 1 ? 's' : ''})</span
									>
									<span class="font-medium text-gray-900">KES {cart.cartStats.total.toLocaleString()}</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Tax</span>
									<span class="font-medium text-gray-900">KES 0</span>
								</div>
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Convenience Fee</span>
									<span class="font-medium text-gray-900">KES {convenienceFee?.amount?.toLocaleString() || 0}</span
									>
								</div>
								<div class="border-t border-gray-200 pt-3">
									<div class="flex justify-between">
										<span class="text-base font-semibold text-gray-900">Total</span>
										<span class="text-lg font-bold text-gray-900 sm:text-xl"
											>KES {totalPrice.toLocaleString()}</span
										>
									</div>
								</div>
							</div>

							<!-- Payment Form -->
							<form
								id="payment-form"
								method="post"
								action="https://test.pesaflow.com/PaymentAPI/iframev2.1.php"
								target="my_frame"
								class="hidden"
							>
								<input type="hidden" name="apiClientID" value={paymentDetails?.apiClientID} />
								<input type="hidden" name="secureHash" value={paymentDetails?.secureHash} />
								<input type="hidden" name="billDesc" value={paymentDetails?.billDesc} />
								<input type="hidden" name="billRefNumber" value={paymentDetails?.billRefNumber} />
								<input type="hidden" name="currency" value={paymentDetails?.currency} />
								<input type="hidden" name="serviceID" value={paymentDetails?.serviceID} />
								<input type="hidden" name="clientMSISDN" value={paymentDetails?.clientMSISDN} />
								<input type="hidden" name="clientName" value={paymentDetails?.clientName} />
								<input type="hidden" name="clientIDNumber" value={paymentDetails?.clientIDNumber} />
								<input type="hidden" name="clientEmail" value={paymentDetails?.clientEmail} />
								<input type="hidden" name="callBackURLOnSuccess" value={paymentDetails?.callBackURLOnSuccess} />
								<input type="hidden" name="callBackURLOnFail" value={paymentDetails?.callBackURLOnFail} />
								<input type="hidden" name="notificationURL" value={paymentDetails?.notificationURL} />
								<input type="hidden" name="pictureURL" value={paymentDetails?.pictureURL} />
								<input type="hidden" name="amountExpected" value={paymentDetails?.amountExpected} />
							</form>

							<!-- Action Buttons -->
							<div class="mt-6 space-y-3">
								{#if paymentDetails && totalPrice > 0 && cart.cartItems.length > 0}
									<button
										class="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none sm:text-base"
										onclick={() => (showConfirmModal = true)}
									>
										<i class="bi bi-credit-card mr-2"></i>
										Proceed to Payment
									</button>
								{:else if cart.cartItems.length === 0}
									<a
										href="/product"
										class="focus:ring-primary inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:text-base"
									>
										<i class="bi bi-arrow-left mr-2"></i>
										Continue Shopping
									</a>
								{:else}
									<button
										disabled
										class="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 text-sm font-semibold text-gray-500 sm:text-base"
									>
										Payment Unavailable
									</button>
								{/if}

								{#if cart.cartItems.length > 0}
									<a
										href="/product"
										class="focus:ring-primary inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:outline-none sm:text-sm"
									>
										<i class="bi bi-plus mr-2"></i>
										Add More Items
									</a>
								{/if}
							</div>

							<!-- Security Notice -->
							<!-- <div class="mt-6 rounded-lg bg-green-50 p-3 sm:p-4">
								<div class="flex">
									<i class="bi bi-shield-check mt-0.5 text-green-400"></i>
									<div class="ml-3">
										<p class="text-xs text-green-800 sm:text-sm">
											<strong>Secure Checkout:</strong> Your payment information is encrypted and secure.
										</p>
									</div>
								</div>
							</div> -->
						</div>
					</div>
				</div>
			</section>
		</div>
	</div>
</main>

<!-- Confirmation Modal -->
<Modal bind:show={showConfirmModal} title="Confirm Your Purchase">
	<div class="space-y-6">
		<!-- Order Details Summary -->
		<div class="rounded-lg bg-gray-50 p-4">
			<h4 class="mb-3 text-sm font-medium text-gray-900">Order Details</h4>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span class="text-gray-600">Items ({cart.cartItems.length})</span>
					<span class="font-medium">KES {cart.cartStats.total.toLocaleString()}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-600">Convenience Fee</span>
					<span class="font-medium">KES {convenienceFee?.amount?.toLocaleString() || 0}</span>
				</div>
				<div class="flex justify-between border-t border-gray-200 pt-2">
					<span class="font-semibold text-gray-900">Total Amount</span>
					<span class="text-primary text-lg font-bold">KES {totalPrice.toLocaleString()}</span>
				</div>
			</div>
		</div>

		<div class="flex items-start space-x-3">
			<i class="bi bi-info-circle-fill mt-0.5 text-blue-500"></i>
			<div class="text-sm text-gray-700">
				<p>
					By confirming this purchase, you agree to our terms and conditions. You will be redirected to our secure
					payment gateway to complete the transaction.
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
			class="w-full rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none sm:w-auto"
			onclick={initiatePayment}
		>
			<i class="bi bi-credit-card mr-2"></i>
			Confirm & Pay
		</button>
	</div>
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
						<h4 class="text-sm font-medium text-red-800">Payment Failed</h4>
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

<!-- Payment Modal -->
<Modal bind:show={showPaymentModal} title="Secure Payment" modalClass="max-w-4xl">
	<div class="space-y-4">
		<div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
			<i class="bi bi-shield-check text-green-500"></i>
			<!-- <span>Secure payment powered by PesaFlow</span> -->
		</div>

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
				name="my_frame"
				title="PesaFlow Payment Form"
				onload={() => (loading = false)}
			></iframe>
		</div>

		<div class="rounded-lg bg-yellow-50 p-3">
			<div class="flex">
				<i class="bi bi-info-circle text-yellow-400"></i>
				<div class="ml-2">
					<p class="text-xs text-yellow-800">
						<strong>Note:</strong> Do not close this window until your payment is complete. You will be automatically
						redirected upon successful payment.
					</p>
				</div>
			</div>
		</div>
	</div>
</Modal>
