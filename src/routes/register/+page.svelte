<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	const { form } = $props();

	let name = $state(form?.data?.name);
	let email = $state(form?.data?.email);
	let password = $state('');
	let confirmPassword = $state('');
	let passwordMatch = $derived(password === confirmPassword ? true : false);
</script>

<div class="loginbg flex min-h-screen items-center justify-center bg-gray-100 lg:bg-contain">
	<div class="w-1/3 min-w-72 rounded-md bg-white p-8 shadow-lg">
		<h2 class="text-center text-2xl font-bold">Welcome, Please Register</h2>
		{#if form?.errors}
			<span class="text-sm text-red-600">{form?.errors}</span>
		{/if}
		<form
			class="mt-4"
			method="POST"
			use:enhance={({ cancel }) => {
				if (password !== confirmPassword) {
					console.log('Passwords do not match');
					//TODO - toast error message
					cancel();
				}
			}}
		>
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Full Name</label>
				<input
					type="text"
					id="name"
					name="name"
					class="w-full rounded-md border p-2"
					bind:value={name}
					required
				/>
			</div>
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					class="w-full rounded-md border p-2"
					bind:value={email}
					required
				/>
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
			<div class="mb-4">
				<label for="confirmPassword" class="block text-sm font-semibold">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					class="w-full rounded-md border p-2"
					name="confirmPassword"
					bind:value={confirmPassword}
					required
				/>
				{#if !passwordMatch}
					<span class="text-xs text-red-600" in:fade={{ duration: 100 }}
						>Passwords do not match</span
					>
				{/if}
			</div>
			<button
				type="submit"
				class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
				disabled={!passwordMatch}
				>Register
			</button>
			<span class="text-sm hover:text-secondary"><a href="/login">Back to login</a></span>
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
