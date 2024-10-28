<script lang="ts">
</script>

<div class="loginbg flex min-h-screen items-center justify-center bg-gray-100 lg:bg-contain">
	<div class="w-1/3 min-w-72 rounded-md bg-white p-8 shadow-lg">
		<h2 class="text-center text-2xl font-bold">Login</h2>
		<form class="mt-4">
			<div class="mb-4">
				<label for="email" class="block text-sm font-semibold">Email</label>
				<input type="email" id="email" class="w-full rounded-md border p-2" />
			</div>
			<div class="mb-4">
				<label for="password" class="block text-sm font-semibold">Password</label>
				<input type="password" id="password" class="w-full rounded-md border p-2" />
			</div>
			<button
				type="submit"
				class="w-full rounded-md border p-2 transition-colors hover:bg-primary hover:text-white"
				>Login</button
			>
			<span class="text-sm hover:text-secondary"><a href="/register">Register</a></span>
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
