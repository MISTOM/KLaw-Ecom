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
	<link rel="preload" href="/banner-bg.jpg" as="image" />
</svelte:head>

<!-- Forgot Password page -->
<div class="loginbg flex min-h-screen items-center justify-center bg-gray-100 lg:bg-contain">
	<div class="w-1/3 min-w-72 rounded-md bg-white p-8 shadow-lg">
		<h2 class="text-center text-2xl font-bold">Forgot Password</h2>
		<form
			method="POST"
			class="mt-4"
			use:enhance={() => {
				loading = true;
				return async ({ result, update }) => {
					if (result.type === 'failure')
						formErrors = result?.data?.message ? result.data.message : 'Error sending your email';

					if (result.type === 'success')
						toast.add('Success', 'Check your email for a password reset link', 'success');

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
				class="group flex w-full items-center justify-center rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
				disabled={loading}
			>
				{#if loading}
					<Spinner />
				{/if}
				Reset Passsord
			</button>
			<span class="text-xs text-gray-400 hover:text-secondary/70"><a href="/login">Back to login</a></span>
		</form>
	</div>
</div>

<style>
	.loginbg {
		background-image: url('/banner-bg.jpg');
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
