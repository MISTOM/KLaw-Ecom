<script lang="ts">
	import { enhance } from '$app/forms';
	import { getToastState } from '$lib/Toast.svelte.js';
	const toast = getToastState();
	const { form } = $props();

	let formErrors = $state();
	let email = $state(form?.data?.email);
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
				return async ({ result }) => {
					if (result.type === 'failure') {
						formErrors = result?.data?.message ? result.data.message : 'Error sending your email';
					}
					if (result.type === 'success')
						toast.add('Success', 'Check your email for a password reset link', 'success');
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
				class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
				>Reset Password
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
