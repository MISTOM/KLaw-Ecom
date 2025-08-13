<script lang="ts">
	import DocViewer from '$lib/components/DocViewer.svelte';
	// Props provided by +page.server.ts
	export let data: { pageCount?: number; watermark: string; docId: number };
	const { pageCount, watermark, docId } = data;
</script>

<svelte:head>
	<title>Secure Viewer</title>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{#if docId}
	<DocViewer {pageCount} {docId} {watermark} />
{:else}
	<p>Invalid document id.</p>
{/if}
