<script lang="ts">
	import { fade } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { eye, eyeSlash } from '$lib/components/icons.js';

	const { form } = $props();

	let email = $state(form?.data?.email);
	let password = $state('');
	let passwordVisible = $state(false);
	let loading = $state(false);

	let formErrors = $state<FormErrors>(form?.errors || {});
	// Typed interface for form errors
	interface FormErrors {
		email?: string[];
		password?: string[];
		_errors?: string[];
	}

	const getFieldError = (field: keyof FormErrors) => {
		return formErrors[field]?.[0] || '';
	};
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h2 class="text-center text-2xl font-bold">Login</h2>
<form
	class="mt-4 space-y-4"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			console.log('form result ->  ', result);
			if (result.type === 'redirect') {
				await goto(result.location, { invalidateAll: true });
			} else if (result.type === 'failure') {
				password = '';
				formErrors = result?.data?.errors || { _errors: ['An error occurred. Please try again.'] };
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
		<label for="email" class="block text-sm font-semibold">Email</label>
		<input
			type="email"
			id="email"
			name="email"
			class={{ 'w-full rounded-md border p-2': true, 'border-red-500': !!getFieldError('email') }}
			bind:value={email}
			aria-invalid={!!getFieldError('email')}
			aria-describedby={getFieldError('email') ? 'email-error' : undefined}
			oninput={() => (formErrors ? (formErrors = {}) : null)}
			required
		/>
		{#if getFieldError('email')}
			<p id="email-error" class="mt-1 text-xs text-red-500" transition:fade>{getFieldError('email')}</p>
		{/if}
	</div>
	<div class="group relative">
		<label for="password" class="block text-sm font-semibold">Password</label>
		<input
			type={passwordVisible ? 'text' : 'password'}
			id="password"
			name="password"
			class={{ 'w-full rounded-md border p-2': true, 'border-red-500': !!getFieldError('password') }}
			bind:value={password}
			aria-invalid={!!getFieldError('password')}
			aria-describedby={getFieldError('password') ? 'password-error' : undefined}
			oninput={() => (formErrors ? (formErrors = {}) : null)}
			required
		/>
		{#if getFieldError('password')}
			<p id="password-error" class="mt-1 text-xs text-red-500" transition:fade>{getFieldError('password')}</p>
		{/if}

		<button
			type="button"
			class="absolute top-7 right-3 text-xs text-gray-400"
			onclick={() => (passwordVisible = !passwordVisible)}
		>
			{#if passwordVisible}
				{@html eye}
			{:else}
				{@html eyeSlash}
			{/if}
		</button>
	</div>
	<button
		type="submit"
		class="group hover:bg-primary flex w-full items-center justify-center rounded-md border p-2 transition-colors hover:text-white"
	>
		{#if loading}
			<Spinner />
		{/if}
		Login</button
	>

	<div class="mt-3 flex justify-between text-xs text-gray-400">
		<div>
			If you dont have an account, <a href="/register" class="hover:text-secondary hover:underline">Register</a>
		</div>

		<a href="/forgotPassword" class=" hover:text-secondary transition-colors hover:underline">Forgot Password</a>
	</div>
</form>
