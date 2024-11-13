<script lang="ts">
	import { enhance } from '$app/forms';
	import { getUserState } from '$lib/state.svelte';
	import { fade } from 'svelte/transition';
	const { data, form } = $props();
	// const user = getUserState().user;

	let name = $state(data.user?.name || '');
	let email = $state(data.user?.email || '');
	let password = $state('');
	let oldPassword = $state('');
	let confirmPassword = $state('');

	let passwordMatch = $derived(password === confirmPassword ? true : false);
	let isEditMode = $state(false);
	const toggleEditMode = () => {
		isEditMode = !isEditMode;
	};
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<!-- Profile Page -->
<div class="m-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
	<div>
		<img src="/kenyaLawFavicon.png" alt="Profile" class="m-auto size-24 rounded-full object-cover shadow-lg" />
		<h2 class="text-center text-2xl font-semibold">Welcome {name}</h2>
	</div>
	<div class="p-4">
		<form
			method="POST"
			use:enhance={({ cancel }) => {
				if (!passwordMatch) return cancel();
				return async ({ update, result }) => {
					console.log('form result ->  ', result);

					if (result.status === 200) {
						isEditMode = false;
						await update({ reset: false });
					} else await update();
				};
			}}
		>
			{#if form?.errors}
				<span class="text-sm text-red-400">{form.errors}</span>
			{/if}
			{#if form?.success}
				<span class="text-sm text-green-300">Profile updated successfully</span>
			{/if}

			<div class="mb-4">
				<label for="name" class="block text-sm font-semibold">Full Name</label>
				<input
					type="text"
					id="name"
					name="name"
					class="w-full rounded-md p-2"
					bind:value={name}
					class:border={isEditMode}
					class:border-none={!isEditMode}
					class:bg-transparent={!isEditMode}
					disabled={!isEditMode}
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
					class:border={isEditMode}
					class:border-none={!isEditMode}
					class:bg-transparent={!isEditMode}
					disabled={!isEditMode}
				/>
			</div>
			{#if isEditMode}
				<div class="mb-4" in:fade={{ duration: 150 }}>
					<label for="oldPassword" class="block text-sm font-semibold">Old Password</label>
					<input
						type="password"
						id="oldPassword"
						name="oldPassword"
						class="w-full rounded-md border p-1"
						bind:value={oldPassword}
					/>
				</div>
				<div class="mb-4" in:fade={{ duration: 150 }}>
					<label for="password" class="block text-sm font-semibold">New Password</label>
					<input
						type="password"
						id="password"
						name="password"
						class="w-full rounded-md border p-1"
						bind:value={password}
					/>
				</div>
				<div class="mb-4" in:fade={{ duration: 150 }}>
					<label for="confirmPassword" class="block text-sm font-semibold">Confirm New Password</label>
					<input
						type="password"
						name="confirmPassword"
						id="confirmPassword"
						class="w-full rounded-md border p-1"
						bind:value={confirmPassword}
					/>
					{#if !passwordMatch}
						<span class="text-xs text-red-600" in:fade={{ duration: 100 }}>Passwords do not match</span>
					{/if}
				</div>
				<button
					type="submit"
					class="w-full rounded-md bg-fadeblack p-2 text-white transition-colors hover:bg-black"
				>
					Save
				</button>
			{:else}
				<button
					type="button"
					onclick={toggleEditMode}
					class="w-20 rounded-md bg-fadeblack p-2 text-white transition-colors hover:bg-black"
				>
					Edit
				</button>
			{/if}
		</form>
	</div>
</div>
