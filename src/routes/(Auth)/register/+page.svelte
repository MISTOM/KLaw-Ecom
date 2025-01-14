<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { getToastState } from '$lib/Toast.svelte.js';
	import { fade } from 'svelte/transition';
	const { form } = $props();

	let name = $state(form?.data?.name);
	let email = $state(form?.data?.email);
	let phoneNumber = $state(form?.data?.phoneNumber);
	let idNumber = $state(form?.data?.idNumber);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordMatch = $derived(password === confirmPassword ? true : false);
	let formErrors = $state();
	let loading = $state(false);
	let passwordVisible = $state(false);

	let recaptchaToken = '';

	const toast = getToastState();

	// function getReCaptchaToken(action: string): Promise<string> {
	// 	return new Promise((resolve) => {
	// 		if (typeof grecaptcha !== 'undefined') {
	// 			grecaptcha.ready(() => {
	// 				grecaptcha.execute('6LdOOLYqAAAAAL1ESyvDEeIIZRx_SNbps4Hq1Ds1', { action }).then((token: string) => {
	// 					resolve(token);
	// 				});
	// 			});
	// 		} else {
	// 			resolve('');
	// 		}
	// 	});
	// }
</script>

<svelte:head>
	<title>Register</title>
	<!-- <script src="https://www.google.com/recaptcha/api.js?render=6LdOOLYqAAAAAL1ESyvDEeIIZRx_SNbps4Hq1Ds1"></script> -->
</svelte:head>

<h2 class="text-center text-2xl font-bold">Welcome, Please Register</h2>
{#if formErrors}
	<span class="text-sm text-red-600">{formErrors}</span>
{/if}
<form
	class="mt-4"
	method="POST"
	use:enhance={async ({ formData, cancel }) => {
		loading = true;
		formErrors = '';
		if (!passwordMatch) {
			loading = false;
			toast.add('Error', 'Passwords do not match', 'error');
			cancel();
		}
		// Acquire token just before form submission
		// recaptchaToken = await getReCaptchaToken('register');
		// if (!recaptchaToken) {
		// 	console.error('Recaptcha token not found');
		// 	loading = false;
		// 	toast.add('Error', 'Recaptcha not found', 'error');
		// 	cancel();
		// 	return;
		// }
		// formData.set('g-recaptcha-response', recaptchaToken);

		return async ({ result }) => {
			console.log('form result ->  ', result);
			if (result.type === 'success') {
				toast.add('Success', 'Please check your email to verify your account', 'success', 7000);
				goto('/login');
			} else if (result.type === 'failure') {
				formErrors = result?.data?.errors ? result.data.errors : 'Error registering user';
			}
			loading = false;
		};
	}}
>
	<div class="mb-4">
		<label for="email" class="block text-sm font-semibold">Full Name</label>
		<input type="text" id="name" name="name" class="w-full rounded-md border p-2" bind:value={name} required />
	</div>
	<div class="mb-4">
		<label for="email" class="block text-sm font-semibold">Email</label>
		<input type="email" id="email" name="email" class="w-full rounded-md border p-2" bind:value={email} required />
	</div>
	<!-- phonenumber -->
	<div class="mb-4">
		<label for="phoneNumber" class="block text-sm font-semibold">Phone Number</label>
		<input
			type="tel"
			id="phoneNumber"
			name="phoneNumber"
			class="w-full rounded-md border p-2"
			bind:value={phoneNumber}
			placeholder="07..."
			required
		/>
	</div>

	<!-- id number -->
	<div class="mb-4">
		<label for="idNumber" class="block text-sm font-semibold">ID Number</label>
		<input
			type="number"
			id="idNumber"
			name="idNumber"
			class="w-full rounded-md border p-2"
			bind:value={idNumber}
			required
		/>
	</div>

	<div class="group relative mb-4">
		<label for="password" class="block text-sm font-semibold">Password</label>
		<input
			type={passwordVisible ? 'text' : 'password'}
			id="password"
			name="password"
			class="w-full rounded-md border p-2"
			bind:value={password}
			required
		/>
		<button
			type="button"
			class="absolute right-3 top-9 hidden text-xs text-gray-400 group-hover:flex"
			onmousedown={() => (passwordVisible = true)}
			onmouseup={() => (passwordVisible = false)}
			onmouseleave={() => (passwordVisible = false)}
			ontouchstart={() => (passwordVisible = true)}
			ontouchend={() => (passwordVisible = false)}
			tabindex="-1"
		>
			{passwordVisible ? 'Hide' : 'Show'}
		</button>
	</div>
	<div class="group relative mb-4">
		<label for="confirmPassword" class="block text-sm font-semibold">Confirm Password</label>
		<input
			type={passwordVisible ? 'text' : 'password'}
			id="confirmPassword"
			class="w-full rounded-md border p-2"
			name="confirmPassword"
			bind:value={confirmPassword}
			required
		/>
		<button
			type="button"
			class="absolute right-3 top-9 hidden text-xs text-gray-400 group-hover:flex"
			onmousedown={() => (passwordVisible = true)}
			onmouseup={() => (passwordVisible = false)}
			onmouseleave={() => (passwordVisible = false)}
			ontouchstart={() => (passwordVisible = true)}
			ontouchend={() => (passwordVisible = false)}
			tabindex="-1"
		>
			{passwordVisible ? 'Hide' : 'Show'}
		</button>
		{#if !passwordMatch}
			<span class="text-xs text-red-600" in:fade={{ duration: 100 }}>Passwords do not match</span>
		{/if}
	</div>
	<button
		type="submit"
		class="group flex w-full items-center justify-center rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
	>
		{#if loading}
			<Spinner />
		{/if}
		Register</button
	>
	<div class="mt-3 flex justify-between text-xs text-gray-400">
		<span class=" hover:text-secondary/70"><a href="/login">Back to login</a></span>

		<a href="/verify" class=" transition-colors hover:text-secondary hover:underline">Resend Verification Email</a>
	</div>
	<!-- <div class="g-recaptcha" data-sitekey="6LdOOLYqAAAAAL1ESyvDEeIIZRx_SNbps4Hq1Ds1"></div> -->
</form>
