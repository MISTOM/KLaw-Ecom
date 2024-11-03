<script lang="ts">
	import { getUserState } from '$lib/state.svelte';

	const UserState = getUserState();
	const { user } = UserState;
	let isEditMode = $state(false);

	let name = $state(user?.name || '');
	let email = $state(user?.email || '');
	let password = $state('');

	const toggleEditMode = () => {
		isEditMode = !isEditMode;
	};

	const saveProfile = async () => {
		// Logic to save the profile data
		console.log('Profile saved:', { name, email, password });
		isEditMode = false;
	};
</script>

<!-- Profile Page -->
<div class="m-1 grid grid-cols-2">
	<div>
		<img
			src="/kenyaLawFavicon.png"
			alt="Profile"
			class="m-auto size-24 rounded-full object-cover shadow-lg"
		/>
		<h2 class="text-center text-2xl font-semibold">Welcome {name}</h2>
	</div>
	<div class="p-4">
		{#if isEditMode}
			<form method="POST">
				<div class="mb-4">
					<label for="name" class="block text-sm font-semibold">Full Name</label>
					<input type="text" id="name" class="w-full rounded-md border p-2" bind:value={name} />
				</div>
				<div class="mb-4">
					<label for="email" class="block text-sm font-semibold">Email</label>
					<input type="email" id="email" class="w-full rounded-md border p-2" bind:value={email} />
				</div>
				<div class="mb-4">
					<label for="password" class="block text-sm font-semibold">New Password</label>
					<input
						type="password"
						id="password"
						class="w-full rounded-md border p-2"
						bind:value={password}
					/>
				</div>
				<button
					type="submit"
					class="w-full rounded-md bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
				>
					Save
				</button>
			</form>
		{:else}
			<div>
				<div class="mb-4">
					<label for="nameText" class="block text-sm font-semibold">Full Name</label>
					<p id="nameText" class="w-full rounded-md bg-gray-100 p-2">{name}</p>
				</div>
				<div class="mb-4">
					<label for="emailText" class="block text-sm font-semibold">Email</label>
					<p id="emailText" class="w-full rounded-md bg-gray-100 p-2">{email}</p>
				</div>
				<button
					onclick={toggleEditMode}
					class="w-full rounded-md bg-green-500 p-2 text-white transition-colors hover:bg-green-600"
				>
					Edit
				</button>
			</div>
		{/if}
	</div>
</div>
