<script lang="ts">
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/Toast.svelte.js';
	import Spinner from '$lib/components/Spinner.svelte';
	import { fade } from 'svelte/transition';
	const toast = getToastState();
	const { form } = $props();

	let formErrors = $state();
	let email = $state(form?.data?.email);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Forgot Password</title>
</svelte:head>

<!-- Forgot Password page -->

<h2 class="text-center text-2xl font-bold">Forgot Password</h2>
<form
	method="POST"
	class="mt-4"
	use:enhance={() => {
		loading = true;
		return async ({ result, update }) => {
			if (result.type === 'failure')
				formErrors = result?.data?.message ? result.data.message : 'Error sending your email';

			if (result.type === 'success') toast.add('Success', 'Check your email for a password reset link', 'success');

			await update();
			loading = false;
		};
	}}
>
	{#if formErrors}
		<span class="text-sm text-red-600"> {formErrors}</span>
	{/if}

	<div class="mb-4">
		<label for="email" class="block text-sm font-semibold">Email</label>
		<input
			type="email"
			id="email"
			name="email"
			class="w-full rounded-md border p-2"
			bind:value={email}
			oninput={() => (formErrors ? (formErrors = '') : null)}
		/>
	</div>
	<button
		type="submit"
		class="group hover:bg-primary flex w-full items-center justify-center rounded-md border p-2 transition-colors hover:text-white"
		disabled={loading}
	>
		{#if loading}
			<Spinner />
		{/if}
		Reset Passsord
	</button>
	<span class="hover:text-secondary/70 text-xs text-gray-400"><a href="/login">Back to login</a></span>
</form>
