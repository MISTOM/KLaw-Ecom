<script lang="ts">
	import { enhance } from '$app/forms';
	import Spinner from '$lib/components/Spinner.svelte';
	import { getToastState } from '$lib/Toast.svelte';

	let { data } = $props();
	let formErrors = $state();

	let loading = $state(false);

	const toast = getToastState();
</script>

{#snippet formInput()}
	<form
		method="POST"
		class="mb-4 w-full"
		use:enhance={() => {
			loading = true;
			return ({ result }) => {
				if (result.status === 200) {
					formErrors = '';
					toast.add('Success', 'Please check your email', 'success');
				} else if (result.type === 'failure') {
					formErrors = result?.data?.error ? result.data.error : 'An error occurred';
				}
				loading = false;
			};
		}}
	>
		{#if formErrors}
			<p class="mb-2 text-sm text-red-600">{formErrors}</p>
		{/if}
		<input
			type="email"
			name="email"
			placeholder="Please enter your email..."
			class="mb-2 w-full rounded border px-3 py-2"
		/>
		<button
			type="submit"
			class="group flex w-full items-center justify-center rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
		>
			{#if loading}
				<Spinner />
			{/if}
			Submit</button
		>
	</form>
{/snippet}

<div class="flex flex-col items-center justify-center p-4">
	<!-- Status messages -->
	{#if data?.status === 200}
		<!-- Success -->
		<h1 class="mb-4 text-center text-2xl font-bold text-green-600">
			{data.message}
		</h1>
		<p class="mb-6 text-center text-gray-700">Your email has been verified successfully.</p>
		<div class="flex justify-center">
			<a href="/login" class="inline-block rounded bg-primary px-4 py-2 text-white shadow hover:bg-primary/90">
				Proceed to Login
			</a>
		</div>
	{:else if data?.error}
		<!-- Error Handling -->
		{#if data.error === 'Email already verified'}
			<h1 class="mb-4 text-center text-2xl font-bold text-blue-600">Email already verified</h1>
			<p class="mb-6 text-center text-gray-700">Your email address has already been verified.</p>
			<div class="flex justify-center">
				<a href="/login" class="inline-block rounded bg-primary px-4 py-2 text-white shadow hover:bg-primary/90">
					Proceed to Login
				</a>
			</div>
		{:else if data.error === 'Token expired'}
			<h1 class="mb-4 text-center text-2xl font-bold text-red-600">Token Expired</h1>
			<p class="mb-4 text-center text-gray-700">
				The verification token has expired. Please enter your email to resend the verification email.
			</p>
			<div class="flex w-full flex-col items-center">
				<!-- form for resending verification -->
				{@render formInput?.()}
				<div class="w-full text-right">
					<a href="/">
						<button class="rounded bg-primary px-3 py-1 text-white hover:bg-primary/90"> Go Home </button>
					</a>
				</div>
			</div>
		{:else if data.error === 'Token is required'}
			<h1 class="mb-4 text-center text-xl font-bold text-primary lg:text-2xl">Resend Verification Email</h1>
			<p class="mb-4 text-center text-gray-700">Please enter your email to resend the verification email.</p>
			<div class="flex w-full flex-col items-center">
				<!-- form for resending verification -->
				{@render formInput?.()}
				<div class="w-full text-right">
					<a href="/">
						<button class="rounded bg-primary px-3 py-1 text-white hover:bg-primary/90"> Go Home </button>
					</a>
				</div>
			</div>
		{:else}
			<h1 class="mb-4 text-center text-2xl font-bold text-red-600">Error</h1>
			<p class="mb-4 text-center text-gray-700">{data.error}</p>
			<div class="flex justify-center">
				<a href="/" class="inline-block rounded bg-primary px-4 py-2 text-white shadow hover:bg-primary/90">
					Go Home
				</a>
			</div>
		{/if}
	{/if}
</div>
