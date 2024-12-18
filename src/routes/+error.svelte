<script lang="ts">
	import { page } from '$app/state';
</script>

<main class="flex h-screen flex-col items-center justify-center bg-gray-300">
	{#if page.status === 404}
		<h1 class="text-3xl">Sorry, the page can't be found.</h1>
	{:else if page.status === 500}
		<h1 class="text-3xl">Oops, there was an error on our side.</h1>
		<p class="mt-2 text-xs">Server side error</p>
	{:else}
		<h1 class="text-3xl">{page.status}: {page.error?.message}</h1>
	{/if}

	<!-- go to history navigation back -->
	<button
		class=" mt-4 rounded-sm p-2 outline outline-[0.3px] transition-colors hover:bg-gray-200 hover:outline-primary"
		onclick={() => history.back()}>Go back</button
	>
</main>
