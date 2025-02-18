<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';
	import { fade } from 'svelte/transition';
	import { eye, eyeSlash } from '$lib/components/icons.js';
	import Spinner from '$lib/components/Spinner.svelte';

	const toast = getToastState();
	let { data, form } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let passwordVisible = $state(false);
	let passwordVisible2 = $state(false);
	let loading = $state(false);

	let passwordMatch = $derived(password === confirmPassword ? true : false);

	type FormErrors = {
		password?: string[];
		confirmPassword?: string[];
		_errors?: string[];
	};

	let formErrors = $state<FormErrors>({});
</script>

<svelte:head>
	<title>Reset Password</title>
</svelte:head>

{#if data.status === 200}
	<h2 class="text-center text-2xl font-bold">Reset Password</h2>
	<p class="mt-2 text-center text-sm text-gray-800">Enter your new password below.</p>

	<form
		method="POST"
		class="mt-4 space-y-3"
		use:enhance={({ cancel }) => {
			loading = true;
			formErrors = {};
			if (!passwordMatch) {
				loading = false;
				formErrors.confirmPassword = ['Passwords do not match'];
				toast.add('Error', 'Passwords do not match', 'error');
				cancel();
			}
			return async ({ result }) => {
				if (result.type === 'redirect') {
					toast.add('Success', 'Password reset successfully', 'success');
					await goto(result.location, { invalidateAll: true });
				}
				if (result.type === 'failure') {
					formErrors._errors = [
						typeof result?.data?.message === 'string' ? result.data.message : 'An error occurred'
					];
					toast.add('Error', `${result.data?.message || 'An error occoured'}`, 'error');
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

		<div class="group relative">
			<label for="password" class="block text-sm font-semibold">Password <span class="text-red-500">*</span></label
			>
			<input
				type={passwordVisible ? 'text' : 'password'}
				id="password"
				name="password"
				class={{
					'focus:border-primary w-full rounded-md border-2 border-black p-2 focus:outline-none': true,
					'border-red-500': !!formErrors.password
				}}
				bind:value={password}
				oninput={() => (formErrors ? (formErrors = {}) : null)}
				required
			/>
			<button
				type="button"
				class="absolute top-7 right-3 text-xs text-gray-700"
				tabindex="-1"
				onclick={() => (passwordVisible = !passwordVisible)}
			>
				{#if passwordVisible}
					{@html eye}
				{:else}
					{@html eyeSlash}
				{/if}
			</button>
		</div>

		<div class="group relative">
			<label for="confirmPassword" class="block text-sm font-semibold"
				>Confirm Password <span class="text-red-500">*</span></label
			>
			<input
				type={passwordVisible2 ? 'text' : 'password'}
				id="confirmPassword"
				name="confirmPassword"
				class={{
					'focus:border-primary w-full rounded-md border-2 border-black p-2 focus:outline-none': true,
					'border-red-500': !!formErrors.confirmPassword
				}}
				bind:value={confirmPassword}
				oninput={() => (formErrors ? (formErrors = {}) : null)}
				required
			/>
			<button
				type="button"
				class="absolute top-7 right-3 text-xs text-gray-700"
				tabindex="-1"
				onclick={() => (passwordVisible2 = !passwordVisible2)}
			>
				{#if passwordVisible2}
					{@html eye}
				{:else}
					{@html eyeSlash}
				{/if}
			</button>
			{#if formErrors.confirmPassword}
				<p class="mt-1 text-xs text-red-600" transition:fade>
					{formErrors.confirmPassword[0]}
				</p>
			{/if}
		</div>

		<input type="hidden" name="token" bind:value={data.token} />

		<button
			type="submit"
			class="bg-primary hover:bg-primary/90 group flex w-full items-center justify-center rounded-md p-2 text-white transition-colors"
		>
			{#if loading}
				<Spinner />
			{/if}
			Reset Password
		</button>
	</form>
{:else if data.status === 400}
	<div class="text-center">
		<h2 class="text-2xl font-bold">Reset Password</h2>
		<p class="mt-2 font-bold text-gray-500">{data.error}</p>
	</div>
{:else}
	<div class="text-center">
		<h2 class="text-2xl font-bold">Reset Password</h2>
		<p class="mt-2 font-bold text-gray-500">Invalid or expired token</p>
	</div>
{/if}
