<script lang="ts">
	const { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href="/theJudiciary.jpeg" as="image" />
	<link rel="preload" href="/kenyaLawLogo.png" as="image" />
</svelte:head>
<div class="loginbg fixed inset-0 -z-10">
	<div class="overlay absolute inset-0 backdrop-blur-[2px]"></div>
</div>
<div class="flex min-h-screen items-center justify-center">
	<main class="w-1/3 min-w-72 overflow-y-auto rounded-sm bg-white p-6 shadow-lg">
		<div class="mb-4 flex justify-start">
			<a href="/"><img src="/kenyaLawLogo.png" alt="Logo" class="h-10" /></a>
		</div>
		{@render children?.()}
	</main>
</div>

<style>
	.loginbg {
		background-image: url('/kl-books-bg.webp');
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	.overlay {
		background-color: rgba(24, 13, 13, 0.6);
	}
</style>
