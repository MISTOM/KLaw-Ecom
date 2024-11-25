<script lang="ts">
	const { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href="/banner-bg.jpg" as="image" />
</svelte:head>

<div class="loginbg flex min-h-screen items-center justify-center bg-gray-100 lg:bg-contain">
	<main class="w-1/3 min-w-72 rounded-md bg-white p-8 shadow-lg">
		{@render children?.()}
	</main>
</div>

<style>
	.loginbg {
		background-image: url('/banner-bg.jpg');
		background-position: center;
		background-repeat: no-repeat;
	}
</style>
