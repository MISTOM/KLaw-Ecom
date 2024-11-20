<script lang="ts">
	const { link } = $props();
</script>

<!-- Password reset email -->

<div class="bg-white font-sans text-black">
	<div class="container mx-auto px-4 py-8">
		<h1 class="mb-4 text-3xl font-bold">Password Reset</h1>
		<p class="mb-6">You have requested a password reset. Click the link below to reset your password.</p>
		<a href={link} target="_blank" class="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
			>Reset Password</a
		>
	</div>
</div>
