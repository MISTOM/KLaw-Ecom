<script lang="ts">
	const { form } = $props();
</script>

<div class="loginbg flex min-h-screen items-center justify-center bg-gray-100 lg:bg-contain">
	<div class="w-1/3 min-w-72 rounded-md bg-white p-8 shadow-lg">
		<h2 class="text-center text-2xl font-bold">Welcome, Please Register</h2>
		{#if form?.errors}
			<span class="text-sm text-red-600">{form?.errors}</span>
		{/if}
		<form class="mt-4" method="POST">
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Full Name</label>
				<input
					type="text"
					id="name"
					name="name"
					class="w-full rounded-md border p-2"
					value={form?.data?.name}
				/>
			</div>
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Email</label>
				<input
					type="email"
					id="email"
					name="email"
					class="w-full rounded-md border p-2"
					value={form?.data?.email}
				/>
			</div>
			<div class="mb-4">
				<label for="password" class="block text-sm font-semibold">Password</label>
				<input type="password" id="password" name="password" class="w-full rounded-md border p-2" />
			</div>
			<div class="mb-4">
				<label for="confirmPassword" class="block text-sm font-semibold">Confirm Password</label>
				<input type="password" id="confirmPassword" class="w-full rounded-md border p-2" />
			</div>
			<button
				type="submit"
				class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
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
