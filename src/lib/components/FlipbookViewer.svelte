<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let docId: number; // ProductDocument id
	export let productId: number; // Parent product id
	export let height: string = '80vh';
	/** When true consume full viewport height */
	export let fullPage: boolean = false;
	/** Initial zoom mode (auto, page-fit, page-width, page-actual, number) */
	export let initialZoom: string = 'page-width';
	/** Auto activate flipbook mode inside embedded viewer */
	export let flipbookAuto: boolean = false;

	let iframeEl: HTMLIFrameElement | null = null;
	let loading = true;
	let failed = false;

	// Reason: Use official PDF.js viewer (with built-in UI + our Turn.js toggle) instead of duplicating renderer.
	const encodedFile = encodeURIComponent(`/api/product/${productId}/documents/${docId}/stream`);
	let viewerUrl = `/web/viewer.html?file=${encodedFile}`;

	onMount(() => {
		if (!browser) return;
		let settled = false;
		const failTimeout = setTimeout(() => {
			if (!settled) {
				failed = true;
				loading = false;
			}
		}, 20000); // allow a bit longer; PDF.js may stream

		function finalizeSuccess() {
			if (settled) return;
			settled = true;
			loading = false;
			failed = false;
			clearTimeout(failTimeout);
			try {
				const win = iframeEl?.contentWindow as any;
				if (win?.PDFViewerApplication) {
					setTimeout(() => {
						try {
							win.PDFViewerApplication.pdfViewer.currentScaleValue = initialZoom;
							const toggle = win.document.getElementById('sidebarToggleButton');
							if (toggle?.getAttribute('aria-expanded') === 'true') toggle.click();
							if (flipbookAuto) win.document.getElementById('flipbookToggle')?.click();
						} catch (e) {
							console.warn('[FlipbookViewer] customization failed', e);
						}
					}, 120);
				}
			} catch (err) {
				console.warn('[FlipbookViewer] iframe customization skipped', err);
			}
		}

		function loadHandler() {
			// Iframe loaded shell; still wait for pagesloaded message, but set a backup timer
			setTimeout(() => finalizeSuccess(), 3000); // fallback if message not received
		}
		function errorHandler() {
			if (settled) return;
			failed = true;
			loading = false;
			clearTimeout(failTimeout);
		}

		function messageHandler(ev: MessageEvent) {
			if (ev.data && ev.data.type === 'pdfjs-document-loaded') finalizeSuccess();
		}

		window.addEventListener('message', messageHandler);
		iframeEl?.addEventListener('load', loadHandler);
		iframeEl?.addEventListener('error', errorHandler);

		return () => {
			window.removeEventListener('message', messageHandler);
			iframeEl?.removeEventListener('load', loadHandler);
			iframeEl?.removeEventListener('error', errorHandler);
			clearTimeout(failTimeout);
		};
	});
</script>

<div class="relative overflow-hidden bg-neutral-900" style={`height:${fullPage ? '100dvh' : height}`}>
	<iframe
		bind:this={iframeEl}
		title="PDF Document"
		class="h-full w-full"
		src={viewerUrl}
		loading="lazy"
		sandbox="allow-scripts allow-same-origin allow-downloads allow-popups"
		referrerpolicy="no-referrer"
	></iframe>
	{#if loading}
		<div class="absolute inset-0 flex items-center justify-center bg-black/60 text-sm text-gray-200">
			Loading PDF...
		</div>
	{/if}
	{#if failed}
		<div
			class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 p-4 text-center text-red-300"
		>
			<span>Failed to load viewer.</span>
			<button
				type="button"
				class="rounded bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
				on:click={() => {
					failed = false;
					loading = true;
					if (iframeEl) iframeEl.src = viewerUrl;
				}}>Retry</button
			>
		</div>
	{/if}
</div>

<style>
	iframe {
		border: none;
	}
</style>
