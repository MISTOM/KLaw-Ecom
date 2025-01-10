<script lang="ts">
	let { data } = $props();

	const resendVerification = () => {
		console.log('resending verification...');
	};
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
	<div class="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
		<!-- Status messages -->
		{#if data?.status === 200}
			<!-- Success -->
			<h1 class="mb-4 text-center text-2xl font-bold text-green-600">
				{data.message}
			</h1>
			<p class="mb-6 text-center text-gray-700">Your email has been verified successfully.</p>
			<div class="flex justify-center">
				<a href="/login" class="inline-block rounded bg-primary px-4 py-2 text-white shadow hover:bg-primary/90">
					Proceed to Login
				</a>
			</div>
		{:else if data?.error}
			<!-- Error Handling -->
			{#if data.error === 'Email already verified'}
				<h1 class="mb-4 text-center text-2xl font-bold text-blue-600">Email already verified</h1>
				<p class="mb-6 text-center text-gray-700">Your email address has already been verified.</p>
				<div class="flex justify-center">
					<a href="/login" class="inline-block rounded bg-primary px-4 py-2 text-white shadow hover:bg-primary/90">
						Proceed to Login
					</a>
				</div>
			{:else if data.error === 'Token expired'}
				<h1 class="mb-4 text-center text-2xl font-bold text-red-600">Token Expired</h1>
				<p class="mb-4 text-center text-gray-700">Your verification link has expired.</p>
				<div class="flex flex-col items-center space-y-3 sm:flex-row sm:justify-center sm:space-x-3 sm:space-y-0">
					<button
						onclick={resendVerification}
						class="inline-block rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
					>
						Resend Verification Email
					</button>
					<a
						href="/login"
						class="inline-block rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
					>
						Go to Login
					</a>
				</div>
			{:else}
				<h1 class="mb-4 text-center text-2xl font-bold text-red-600">Error</h1>
				<p class="mb-6 text-center text-gray-700">{data.error}</p>
				<div class="flex justify-center">
					<a href="/">
						<button class="inline-block rounded bg-primary px-4 py-2 text-white hover:bg-primary/90">
							Go Home
						</button></a
					>
				</div>
			{/if}
		{/if}
	</div>
</div>
