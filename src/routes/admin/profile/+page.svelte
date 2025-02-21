<script lang="ts">
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/Modal.svelte';
	import { getToastState } from '$lib/Toast.svelte.js';
	import Spinner from '$lib/components/Spinner.svelte';

	const { data, form } = $props();
	const toast = getToastState();

	let showEditModal = $state(false);
	let showPasswordModal = $state(false);

	let name = $state(data.user?.name || '');
	let email = $state(data.user?.email || '');
	let phone = $state(data.user?.phoneNumber || '');
	let idNumber = $state(data.user?.idNumber || '');
	let password = $state('');
	let oldPassword = $state('');
	let confirmPassword = $state('');

	let passwordMatch = $derived(password === confirmPassword ? true : false);

	let isUpdatingProfile = $state(false);
	let isChangingPassword = $state(false);
</script>

<svelte:head>
	<title>Admin Profile</title>
</svelte:head>

<div class="m-1 grid grid-cols-1 gap-4 md:grid-cols-2">
	<div class="flex flex-col items-center justify-center p-4">
		<img src="/kenyaLawFavicon.png" alt="Admin Profile" class="h-24 w-24 rounded-full object-cover shadow-lg" />
		<h2 class="mt-4 text-2xl font-semibold">Admin: {name}</h2>
	</div>

	<div class="p-4">
		<p class="mb-2 text-lg text-gray-900">Email: {email}</p>
		<p class="mb-2 text-lg text-gray-900">Phone: {phone}</p>
		<p class="mb-2 text-lg text-gray-900">ID Number: {idNumber}</p>

		<div class="mt-4 space-x-2">
			<button
				type="button"
				class="bg-fadeblack rounded-md px-3 py-2 text-white hover:bg-black"
				onclick={() => (showEditModal = true)}
			>
				Edit Profile
			</button>
			<button
				type="button"
				class="bg-fadeblack rounded-md px-3 py-2 text-white hover:bg-black"
				onclick={() => (showPasswordModal = true)}
			>
				Change Password
			</button>
		</div>
	</div>

	<!-- EDIT PROFILE MODAL -->
	<Modal bind:show={showEditModal} title="Edit Admin Profile" modalClass="max-w-md">
		<form
			method="POST"
			action="?/editProfile"
			use:enhance={({ cancel }) => {
				if (!name || !email) return cancel();
				isUpdatingProfile = true;
				return async ({ update, result }) => {
					if (result.type === 'success') {
						showEditModal = false;
						toast.add('Profile updated successfully', '', 'success');
					}
					await update({ reset: false });
					isUpdatingProfile = false;
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="name" class="block text-sm font-semibold">Name</label>
				<input type="text" id="name" name="name" class="w-full rounded-md border p-2" bind:value={name} />
			</div>
			<div>
				<label for="email" class="block text-sm font-semibold">Email</label>
				<input type="email" id="email" name="email" class="w-full rounded-md border p-2" bind:value={email} />
			</div>
			<div>
				<label for="phone" class="block text-sm font-semibold">Phone</label>
				<input type="text" id="phone" name="phone" class="w-full rounded-md border p-2" bind:value={phone} />
			</div>
			<div>
				<label for="idNumber" class="block text-sm font-semibold">ID Number</label>
				<input
					type="text"
					id="idNumber"
					name="idNumber"
					class="w-full rounded-md border p-2"
					bind:value={idNumber}
				/>
			</div>
			{#if form?.errors}
				<p class="text-sm text-red-500">{form.errors}</p>
			{/if}
			<button
				type="submit"
				class="bg-fadeblack flex w-full items-center justify-center rounded-md p-2 text-white hover:bg-black"
				disabled={isUpdatingProfile}
			>
				{#if isUpdatingProfile}
					<Spinner />
				{/if}
				Save Changes
			</button>
		</form>
	</Modal>

	<!-- CHANGE PASSWORD MODAL -->
	<Modal bind:show={showPasswordModal} title="Change Admin Password" modalClass="max-w-md">
		<form
			method="POST"
			action="?/changePassword"
			use:enhance={({ cancel }) => {
				if (!passwordMatch) return cancel();
				isChangingPassword = true;
				return async ({ update, result }) => {
					if (result.type === 'success') {
						showPasswordModal = false;
						toast.add('Password updated successfully', '', 'success');
					}
					await update({ reset: true });
					isChangingPassword = false;
				};
			}}
			class="space-y-4"
		>
			<div>
				<label for="oldPassword" class="block text-sm font-semibold">Old Password</label>
				<input
					type="password"
					id="oldPassword"
					name="oldPassword"
					class="w-full rounded-md border p-2"
					bind:value={oldPassword}
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-semibold">New Password</label>
				<input
					type="password"
					id="password"
					name="password"
					class="w-full rounded-md border p-2"
					bind:value={password}
				/>
			</div>
			<div>
				<label for="confirmPassword" class="block text-sm font-semibold">Confirm Password</label>
				<input
					type="password"
					id="confirmPassword"
					name="confirmPassword"
					class="w-full rounded-md border p-2"
					bind:value={confirmPassword}
				/>
				{#if !passwordMatch}
					<p class="text-xs text-red-600">Passwords do not match</p>
				{/if}
			</div>
			{#if form?.errors}
				<p class="text-sm text-red-500">{form.errors}</p>
			{/if}
			<button
				type="submit"
				class="bg-fadeblack flex w-full items-center justify-center rounded-md p-2 text-white hover:bg-black"
				disabled={isChangingPassword}
			>
				{#if isChangingPassword}
					<Spinner />
				{/if}
				Update Password
			</button>
		</form>
	</Modal>
</div>
