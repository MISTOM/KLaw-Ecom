<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { error } from '@sveltejs/kit';
	import { fade } from 'svelte/transition';

	const { form } = $props();

	let formErrors = $state();
	let email = $state(form?.data?.email);
	let password = $state('');
	let passwordVisible = $state(false);
	let loading = $state(false);
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h2 class="text-center text-2xl font-bold">Login</h2>
<form
	class="mt-4"
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ result }) => {
			console.log('form result ->  ', result);
			if (result.type === 'redirect') {
				await goto(result.location, { invalidateAll: true });
			} else if (result.type === 'failure') {
				password = '';
				formErrors = result?.data?.errors ? result.data.errors : 'Error logging in';
			}
			loading = false;
		};
	}}
>
	{#if formErrors}
		<span class="text-sm text-red-600" in:fade={{ duration: 150 }}> {formErrors}</span>
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
			required
		/>
		<label for="email" class="label"> </label>
	</div>
	<div class="group relative mb-4">
		<label for="password" class="block text-sm font-semibold">Password</label>
		<input
			type={passwordVisible ? 'text' : 'password'}
			id="password"
			name="password"
			class="w-full rounded-md border p-2"
			bind:value={password}
			oninput={() => (formErrors ? (formErrors = '') : null)}
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
	<button
		type="submit"
		class="group flex w-full items-center justify-center rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
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

		<a href="/forgotPassword" class=" transition-colors hover:text-secondary hover:underline">Forgot Passowrd</a>
	</div>
</form>
