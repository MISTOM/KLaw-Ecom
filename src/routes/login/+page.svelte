<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { error } from '@sveltejs/kit';
	import { fade } from 'svelte/transition';

	const { form } = $props();

	let formErrors = $state('');
	let email = $state(form?.data?.email);
	let password = $state('');
</script>

<svelte:head>
	<link rel="preload" href="/banner-bg.jpg" as="image" />
</svelte:head>

<div class="loginbg flex min-h-screen items-center justify-center bg-gray-100 lg:bg-contain">
	<div class="w-1/3 min-w-72 rounded-md bg-white p-8 shadow-lg">
		<h2 class="text-center text-2xl font-bold">Login</h2>
		<form
			class="mt-4"
			method="POST"
			use:enhance={() => {
				return async ({ result }) => {
					console.log('form result ->  ', result);
					if (result.type === 'redirect') {
						await goto(result.location, { invalidateAll: true });
					} else if (result.type === 'failure') {
						password = '';
						//TODO: handle form errors
						formErrors = result?.data?.errors ? result.data.errors : 'Error logging in';
					}
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
					oninput={() => {
						formErrors ? (formErrors = '') : console.log('cleared this error - ', formErrors);
					}}
					required
				/>
				<label for="email" class="label"> </label>
			</div>
			<div class="mb-4">
				<label for="password" class="block text-sm font-semibold">Password</label>
				<input
					type="password"
					id="password"
					name="password"
					class="w-full rounded-md border p-2"
					bind:value={password}
					required
				/>
			</div>
			<button
				type="submit"
				class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white">Login</button
			>

			<div class="mt-3 flex justify-between">
				<span class="text-sm">
					If you dont have an account, <a href="/register" class="hover:text-secondary">Register</a>
				</span>

				<span class="text-sm hover:text-secondary"><a href="/forgotPassword">Forgot Passowrd</a></span>
			</div>
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
