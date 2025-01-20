<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { getToastState } from '$lib/Toast.svelte.js';
	import { fade } from 'svelte/transition';

	const { form } = $props();

	const SITE_KEY = '6LfCSboqAAAAAONEp8MMiyAHZycy2b99b2VhHPHD';

	let name = $state(form?.data?.name);
	let email = $state(form?.data?.email);
	let phoneNumber = $state(form?.data?.phoneNumber);
	let idNumber = $state(form?.data?.idNumber);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordMatch = $derived(password === confirmPassword ? true : false);
	let loading = $state(false);
	let passwordVisible = $state(false);

	let formErrors = $state<FormErrors>(form?.errors || {});
	let recaptchaToken = '';

	const toast = getToastState();

	// Typed interface for form errors
	interface FormErrors {
		name?: string[];
		email?: string[];
		phoneNumber?: string[];
		idNumber?: string[];
		password?: string[];
		confirmPassword?: string[];
		'g-recaptcha-response'?: string[];
		_errors?: string[];
	}

	const getFieldError = (field: keyof FormErrors) => {
		return formErrors[field]?.[0] || '';
	};
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
	<script src="https://www.google.com/recaptcha/api.js" async defer></script>
</svelte:head>

<h2 class="text-center text-2xl font-bold">Welcome, Please Register</h2>

<form
	class="mt-4 space-y-3"
	method="POST"
	use:enhance={async ({ formData, cancel }) => {
		loading = true;
		formErrors = {};
		if (!passwordMatch) {
			loading = false;
			formErrors.confirmPassword = ['Passwords do not match'];
			toast.add('Error', 'Passwords do not match', 'error');
			cancel();
		}

		return async ({ result }) => {
			console.log('form result ->  ', result);
			if (result.type === 'success') {
				toast.add('Success', 'Please check your email to verify your account', 'success', 7000);
				goto('/login');
			} else if (result.type === 'failure') {
				formErrors = result.data?.errors || { _errors: ['Error registering user'] };
			}
			loading = false;
		};
	}}
>
	{#if formErrors._errors}
		<div class="mb-4 rounded-md bg-red-50 p-4" role="alert">
			<p class="text-sm text-red-700">{formErrors._errors[0]}</p>
		</div>
	{/if}

	<div class="">
		<label for="email" class="block text-sm font-semibold">Full Name <span class="text-red-500">*</span></label>

		<input
			type="text"
			id="name"
			name="name"
			class={{
				'w-full rounded-md border p-2': true,
				'border-red-500': !!getFieldError('name')
			}}
			bind:value={name}
			aria-invalid={!!getFieldError('name')}
			aria-describedby={getFieldError('name') ? 'name-error' : undefined}
			required
		/>
		{#if getFieldError('name')}
			<p id="name-error" class="mt-1 text-xs text-red-600" transition:fade>
				{getFieldError('name')}
			</p>
		{/if}
	</div>
	<div class="">
		<label for="email" class="block text-sm font-semibold">Email <span class="text-red-500">*</span> </label>
		<input
			type="email"
			id="email"
			name="email"
			class={{ 'w-full rounded-md border p-2': true, 'border-red-500': !!getFieldError('email') }}
			bind:value={email}
			aria-invalid={!!getFieldError('email')}
			aria-describedby={getFieldError('email') ? 'email-error' : undefined}
			required
		/>
		{#if getFieldError('email')}
			<p id="email-error" class="mt-1 text-xs text-red-600" transition:fade>
				{getFieldError('email')}
			</p>
		{/if}
	</div>
	<!-- phonenumber -->
	<div class="">
		<label for="phoneNumber" class="block text-sm font-semibold"
			>Phone Number <span class="text-red-500">*</span></label
		>
		<input
			type="tel"
			id="phoneNumber"
			name="phoneNumber"
			class={{
				'w-full rounded-md border p-2': true,
				'border-red-500': !!getFieldError('phoneNumber')
			}}
			bind:value={phoneNumber}
			aria-invalid={!!getFieldError('phoneNumber')}
			aria-describedby={getFieldError('phoneNumber') ? 'phoneNumber-error' : undefined}
			placeholder="07..."
			required
		/>
		{#if getFieldError('phoneNumber')}
			<p id="phoneNumber-error" class="mt-1 text-xs text-red-600" transition:fade>
				{getFieldError('phoneNumber')}
			</p>
		{/if}
	</div>

	<!-- id number -->
	<div class="">
		<label for="idNumber" class="block text-sm font-semibold">ID Number <span class="text-red-500">*</span></label>
		<input
			type="number"
			id="idNumber"
			name="idNumber"
			class={{
				'w-full rounded-md border p-2': true,
				'border-red-500': !!getFieldError('idNumber')
			}}
			bind:value={idNumber}
			aria-invalid={!!getFieldError('idNumber')}
			aria-describedby={getFieldError('idNumber') ? 'idNumber-error' : undefined}
			required
		/>
		{#if getFieldError('idNumber')}
			<p id="idNumber-error" class="mt-1 text-xs text-red-600" transition:fade>
				{getFieldError('idNumber')}
			</p>
		{/if}
	</div>

	<div class="group relative">
		<label for="password" class="block text-sm font-semibold">Password <span class="text-red-500">*</span></label>
		<input
			type={passwordVisible ? 'text' : 'password'}
			id="password"
			name="password"
			class={{
				'w-full rounded-md border p-2': true,
				'border-red-500': !!getFieldError('password')
			}}
			bind:value={password}
			aria-invalid={!!getFieldError('password')}
			aria-describedby={getFieldError('password') ? 'password-error' : undefined}
			required
		/>
		{#if getFieldError('password')}
			<p id="password-error" class="mt-1 text-xs text-red-600" transition:fade>
				{getFieldError('password')}
			</p>
		{/if}
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
	<div class="group relative">
		<label for="confirmPassword" class="block text-sm font-semibold"
			>Confirm Password <span class="text-red-500">*</span></label
		>
		<input
			type={passwordVisible ? 'text' : 'password'}
			id="confirmPassword"
			name="confirmPassword"
			class={{
				'w-full rounded-md border p-2': true,
				'border-red-500': !!getFieldError('confirmPassword')
			}}
			bind:value={confirmPassword}
			aria-invalid={!!getFieldError('confirmPassword')}
			aria-describedby={getFieldError('confirmPassword') ? 'confirmPassword-error' : undefined}
			required
		/>
		{#if getFieldError('confirmPassword')}
			<p id="confirmPassword-error" class="mt-1 text-xs text-red-600" transition:fade>
				{getFieldError('confirmPassword')}
			</p>
		{/if}

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
	{#if formErrors['g-recaptcha-response']}
		<p class="text-sm text-red-600">{formErrors['g-recaptcha-response']}</p>
	{/if}
	<div class="g-recaptcha" data-sitekey={SITE_KEY}></div>
</form>
