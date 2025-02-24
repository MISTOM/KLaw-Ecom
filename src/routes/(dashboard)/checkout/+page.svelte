<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { getCartState } from '$lib/Cart.svelte.js';
	import Spinner from '$lib/components/Spinner.svelte';
	import Modal from '$lib/components/Modal.svelte';

	const { data } = $props();

	const paymentDetails = $derived(data.paymentDetails);
	const convenienceFee = $derived(data.convenienceFee);

	const cart = getCartState();

	let errors = $state('');
	let showConfirmModal = $state(false);
	let showPaymentModal = $state(false);
	let loading = $state(false);
	let paymentStatus = $state('initial'); // 'initial' | 'processing' | 'failed'
	let paymentError = $state('');

	let totalPrice = $derived(cart.cartStats.total + (convenienceFee?.amount || 0));

	const initiatePayment = async () => {
		showConfirmModal = false;
		paymentStatus = 'processing';

		try {
			// Validate cart items stock before proceeding
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
				throw new Error(error.message);
			}

			showPaymentModal = true;
			const form = document.getElementById('payment-form') as HTMLFormElement;
			if (form) {
				loading = true;
				await tick();
				form.submit();
			} else {
				throw new Error('Payment form not found');
			}
		} catch (err) {
			paymentStatus = 'failed';
			//@ts-ignore
			paymentError = err?.message || 'Failed to initiate payment';
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
<main class="m-4 grid grid-cols-1 gap-6 lg:grid-cols-3">
	<section class="col-span-2">
		<a
			href="/"
			class="mb-2 flex w-28 items-center rounded-sm bg-gray-100 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
		>
			← Back
		</a>
		<h1 class="text-4xl">Checkout</h1>
		<hr />
		<ul>
			{#each cart.cartItems as item, i}
				<li class="my-3 flex items-center rounded-sm border p-1 hover:shadow-xs">
					<span class="m-5">{i + 1}</span>
					<img
						src={item.product.Image[0]?.url || '/coat-of-arms.jpg'}
						alt={item.product.name}
						class="mr-4 size-14"
					/>
					<div class="grow">
						<h2 class="text-lg font-semibold">{item.product.name}</h2>
						<p>Price: KES {item.product.price}</p>
						<p>Quantity: {item.quantity}</p>
					</div>

					<div class="flex space-x-2">
						<button
							class="rounded-sm bg-red-500 px-3 py-1 text-white hover:bg-red-600"
							onclick={() => cart.removeItem(item.id)}
						>
							Remove
						</button>
					</div>
				</li>
			{/each}
		</ul>
	</section>
	<section class="h-fit rounded-sm border p-6">
		<h2 class="mb-4 text-xl font-semibold">Order Summary</h2>

		{#if errors}
			<p class="text-red-600">{errors}</p>
		{/if}

		<div class="space-y-2">
			<div class="flex justify-between">
				<span class="text-gray-600">Subtotal</span>
				<span class="font-medium">KES {cart.cartStats.total.toLocaleString()}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600">Tax</span>
				<span class="font-medium">KES 0</span>
			</div>
			<div class="flex justify-between">
				<span class="text-gray-600">ConvenienceFee</span>
				<span class="font-medium">KES {convenienceFee?.amount}</span>
			</div>
			<div class="my-2 border-t"></div>
			<div class="flex justify-between">
				<span class="font-semibold">Total</span>
				<span class="font-bold">KES {totalPrice}</span>
			</div>
		</div>
		<hr />

		<form
			id="payment-form"
			method="post"
			action="https://test.pesaflow.com/PaymentAPI/iframev2.1.php"
			target="my_frame"
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

		{#if paymentDetails}
			<button
				class="transition-color m-1 w-full rounded-sm bg-green-600 p-1 text-white hover:opacity-90"
				onclick={() => (showConfirmModal = true)}
				>Pay
			</button>
		{:else}
			<a href="/product" class="text-secondary hover:underline">Continue shopping...</a>
		{/if}
	</section>
</main>

<!-- Confirmation Modal -->
<Modal bind:show={showConfirmModal} title="Confirm Purchase">
	<p class="mb-6 text-gray-700">
		Are you sure you want to proceed with the purchase of {cart.cartItems.length} item{cart.cartItems.length !== 1
			? 's'
			: ''}? Total amount: <strong>KES {totalPrice.toLocaleString()}</strong>
	</p>
	<div class="flex justify-end gap-4">
		<button
			class="rounded-sm bg-gray-100 px-4 py-2 text-gray-600 hover:bg-gray-200"
			onclick={() => (showConfirmModal = false)}
		>
			Cancel
		</button>
		<button class="rounded-sm bg-green-600 px-4 py-2 text-white hover:bg-green-700" onclick={initiatePayment}>
			Confirm Purchase
		</button>
	</div>
</Modal>

<!-- Payment Status Feedback -->
{#if paymentStatus === 'failed'}
	<div class="fixed right-4 bottom-4 z-50" transition:fade>
		<div class="rounded-lg bg-red-100 p-4 text-red-700 shadow-lg">
			<h4 class="font-bold">Payment Failed</h4>
			<p>{paymentError}</p>
			<button class="mt-2 text-sm underline" onclick={() => (paymentStatus = 'initial')}> Try Again </button>
		</div>
	</div>
{/if}

<!-- Payment Modal -->
<Modal bind:show={showPaymentModal} title="Payment" modalClass="max-w-[800px]">
	<div class="relative h-full w-full">
		{#if loading}
			<div class="absolute inset-0 z-10 flex items-center justify-center bg-gray-400/50">
				<Spinner />
			</div>
		{/if}
		<iframe
			class="h-[600px] w-full border-0"
			name="my_frame"
			title="PesaFlow Payment Form"
			onload={() => (loading = false)}
		></iframe>
	</div>
	<!-- <button
		class="absolute top-2 right-2 rounded-full bg-gray-200 p-2 hover:bg-gray-300"
		onclick={() => {
			if (confirm('Are you sure you want to cancel the payment?')) {
				showPaymentModal = false;
				paymentStatus = 'initial';
			}
		}}
	>
		✕
	</button> -->
</Modal>
