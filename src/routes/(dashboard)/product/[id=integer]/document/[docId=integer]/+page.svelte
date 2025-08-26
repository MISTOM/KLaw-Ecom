<script lang="ts">
	import FlipbookViewer from '$lib/components/FlipbookViewer.svelte';
	export let data: { productId: number; docId: number; title: string };
	const { productId, docId, title } = data;
</script>

<svelte:head>
	<title>{title} – Viewer</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<div class="min-h-screen px-4 py-6 text-white">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-xl text-black font-semibold">{title}</h1>
		<a href="/product/{productId}" class="text-sm text-primary underline-offset-2 hover:underline">Back</a>
	</div>
	<FlipbookViewer {docId} {productId} />
</div>
