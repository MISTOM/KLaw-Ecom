<script lang="ts">
</script>

<!-- Profile Page -->
<div class="m-1 grid grid-cols-2">
	<div>
		<img
			src="/kenyaLawFavicon.png"
			alt="Profile"
			class="m-auto size-24 rounded-full object-cover shadow-lg"
		/>
		<h2 class="text-center text-2xl font-semibold">Welcome, Henry Clyde</h2>
	</div>
	<div class="p-4">
		<form action="">
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">First Name</label>
				<input type="text" id="email" class="w-full rounded-md border p-2" />
			</div>
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Last Name</label>
				<input type="text" id="email" class="w-full rounded-md border p-2" />
			</div>
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Email</label>
				<input type="email" id="email" class="w-full rounded-md border p-2" />
			</div>
			<div class="mb-4">
				<label for="password" class="block text-sm font-semibold">New Password</label>
				<input type="password" id="password" class="w-full rounded-md border p-2" />
			</div>
			<button
				type="submit"
				class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
				>Update</button
			>
		</form>
	</div>
</div>
