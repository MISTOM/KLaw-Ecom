<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { getToastState } from '$lib/Toast.svelte';
	import { fade } from 'svelte/transition';

	const toast = getToastState();
	let { data, form } = $props();

	let password = $state('');
	let confirmPassword = $state('');
	let passwordVisible = $state(false);

	let passwordMatch = $derived(password === confirmPassword ? true : false);
</script>

<svelte:head>
	<title>Reset Password</title>
</svelte:head>

<main class="container mx-auto flex min-h-screen items-center justify-center">
	<div class="w-1/2 p-10 shadow-sm">
		{#if data.status === 200}
			<h1 class="mb-4 font-bold md:text-xl lg:text-3xl">Reset Password</h1>
			<p class="mb-6">Enter your new password below.</p>

			<form
				method="POST"
				use:enhance={({ cancel }) => {
					if (!passwordMatch) {
						toast.add('Error', 'Passwords do not match', 'error');
						cancel();
					}
					return async ({ result }) => {
						if (result.type === 'redirect') {
							toast.add('Success', 'Password reset successfully', 'success');
							await goto(result.location, { invalidateAll: true });
						}
						if (result.type === 'failure') {
							toast.add('Error', `${result.data?.message}`, 'error');
						}
					};
				}}
			>
				<div class="group relative mb-4">
					<label for="password" class="block text-sm font-semibold">Password</label>
					<input
						type={passwordVisible ? 'text' : 'password'}
						id="password"
						class="w-full rounded-md border p-2"
						name="password"
						bind:value={password}
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
				<div class=" group relative mb-4">
					<label for="confirmPassword" class="block text-sm font-semibold">Confirm Password</label>
					<input
						type={passwordVisible ? 'text' : 'password'}
						id="confirmPassword"
						class="w-full rounded-md border p-2"
						name="confirmPassword"
						bind:value={confirmPassword}
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

				<input type="hidden" name="token" bind:value={data.token} />

				{#if !passwordMatch}
					<span class="text-xs text-red-600" in:fade={{ duration: 100 }}>Passwords do not match</span>
				{/if}
				<button
					type="submit"
					class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
				>
					Reset Password
				</button>
			</form>
		{:else if data.status === 400}
			<h1 class="mb-4 text-3xl font-bold">Reset Password</h1>
			<p class="mb-6 font-bold text-gray-500">{data.error}</p>
		{:else}
			<h1 class="mb-4 text-3xl font-bold">Reset Password</h1>
			<p class="mb-6 font-bold text-gray-500">Invalid or expired token</p>
		{/if}
	</div>
</main>
