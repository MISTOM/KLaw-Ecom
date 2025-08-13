<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * Secure, view-only document viewer.
	 * Props:
	 * - docId: number (required)
	 * - pageCount?: number (optional; will fall back to license pages.to)
	 * - watermark: string (user-identifying watermark, e.g., name/email)
	 * - licenseEndpoint?: string (default '/api/license')
	 * - pageEndpoint?: string (default '/api/page')
	 */
	let {
		docId,
		pageCount = $bindable(),
		watermark = '',
		licenseEndpoint = '/api/license',
		pageEndpoint = '/api/page'
	}: {
		docId: number;
		pageCount?: number;
		watermark?: string;
		licenseEndpoint?: string;
		pageEndpoint?: string;
	} = $props();

	type License = { license: string; exp: number; pages?: { from: number; to: number }; key?: string };

	let license: License | null = null;
	let pages: { index: number; status: 'idle' | 'loading' | 'ready' | 'error'; error?: string }[] = $state([]);
	let observer: IntersectionObserver | null = null;

	async function fetchLicense(): Promise<License> {
		const res = await fetch(`${licenseEndpoint}?docId=${docId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' }
		});
		if (!res.ok) throw new Error('Failed to get license');
		const data = (await res.json()) as License;
		return data;
	}

	function isLicenseValid(l: License | null): boolean {
		if (!l) return false;
		const skew = 5; // seconds
		const now = Math.floor(Date.now() / 1000);
		return l.exp - now > skew;
	}

	async function ensureLicense(): Promise<License> {
		console.log('Ensuring license');
		if (isLicenseValid(license)) return license!;
		license = await fetchLicense();
		if (!pageCount && (license as any).pages) pageCount = (license as any).pages!.to;
		return license!;
	}

	async function fetchEncryptedPageBinary(page: number): Promise<ArrayBuffer> {
		const lic = await ensureLicense();
		const url = `${pageEndpoint}?docId=${docId}&page=${page}`;
		let res = await fetch(url, { headers: { Authorization: `Bearer ${lic.license}` } });
		if (res.status === 401) {
			license = null;
			const lic2 = await ensureLicense();
			res = await fetch(url, { headers: { Authorization: `Bearer ${lic2.license}` } });
		}
		if (!res.ok) throw new Error(`Page ${page} fetch failed (${res.status})`);
		return await res.arrayBuffer();
	}

	async function decryptPageToImage(page: number): Promise<ImageBitmap> {
		const buf = await fetchEncryptedPageBinary(page);
		const bytes = new Uint8Array(buf);
		if (bytes.byteLength <= 32) throw new Error('Corrupt payload');
		const iv = bytes.subarray(0, 16);
		const tag = bytes.subarray(16, 32);
		const ct = bytes.subarray(32);

		const lic = await ensureLicense();
		if (!lic.key) throw new Error('License missing key');
		const keyBytes = Uint8Array.from(atob(lic.key), (c) => c.charCodeAt(0));

		const ctWithTag = new Uint8Array(ct.length + tag.length);
		ctWithTag.set(ct, 0);
		ctWithTag.set(tag, ct.length);

		const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
		const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, cryptoKey, ctWithTag);
		const blob = new Blob([plain], { type: 'image/png' });
		const imgBitmap = await createImageBitmap(blob);
		return imgBitmap;
	}

	function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
		if (!watermark) return;
		const ts = new Date().toISOString();
		const text = `${watermark} — ${ts}`;
		ctx.save();
		ctx.globalAlpha = 0.25;
		ctx.fillStyle = '#000';
		ctx.font = `${Math.round(w * 0.03)}px sans-serif`;
		ctx.translate(w / 2, h / 2);
		ctx.rotate(-Math.PI / 6);
		ctx.textAlign = 'center';
		for (let y = -h; y <= h; y += Math.max(80, Math.round(h * 0.2))) {
			ctx.fillText(text, 0, y);
		}
		ctx.restore();
	}

	async function renderPage(page: number) {
		const el = document.getElementById(`page-${page}`) as HTMLCanvasElement | null;
		if (!el) return;
		pages[page - 1].status = 'loading';
		try {
			const img = await decryptPageToImage(page);
			el.width = img.width;
			el.height = img.height;
			const ctx = el.getContext('2d');
			if (!ctx) throw new Error('Canvas context');
			ctx.drawImage(img, 0, 0);
			drawWatermark(ctx, el.width, el.height);
			pages[page - 1].status = 'ready';
		} catch (e: any) {
			pages[page - 1].status = 'error';
			pages[page - 1].error = e?.message || 'Failed to render';
		}
	}

	function setupObserver() {
		console.log('running');
		if (observer) observer.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const id = entry.target.getAttribute('data-page');
						const page = id ? parseInt(id) : NaN;
						if (page && pages[page - 1]?.status === 'idle') {
							renderPage(page);
						}
					}
				}
			},
			{ root: null, rootMargin: '400px 0px', threshold: 0.01 }
		);
		for (let i = 1; i <= (pageCount || 0); i++) {
			const cont = document.querySelector(`.page-container[data-page="${i}"]`);
			if (cont) observer.observe(cont);
		}
	}

	onMount(async () => {
		console.log('mounted');
		await ensureLicense();
		if (!pageCount && (license as any)?.pages) pageCount = (license as any).pages!.to;
		if (!pageCount) return;
		pages = Array.from({ length: pageCount }, (_, i) => ({ index: i + 1, status: 'idle' as const }));
		setTimeout(() => {
			renderPage(1);
			renderPage(2);
			setupObserver();
		}, 0);
	});

	function preventContext(e: MouseEvent) {
		e.preventDefault();
	}
</script>

<div class="viewer" role="application" oncontextmenu={preventContext} aria-label="Secure document viewer">
	<div class="toolbar">
		<div class="title">View-only mode</div>
		<div class="hint">No download. Watermark applied.</div>
	</div>
	{#if pageCount}
		<div class="pages">
			{#each pages as p}
				<div class="page-container" data-page={p.index}>
					<canvas id={`page-${p.index}`} class="page-canvas" aria-label={`Page ${p.index}`}></canvas>
					{#if p.status === 'loading'}<div class="status">Loading…</div>{/if}
					{#if p.status === 'error'}<div class="status error">{p.error}</div>{/if}
				</div>
			{/each}
		</div>
	{:else}
		<div class="status">Preparing viewer…</div>
	{/if}
</div>

<style>
	.viewer {
		user-select: none;
		-webkit-user-drag: none;
	}
	.toolbar {
		position: sticky;
		top: 0;
		display: flex;
		gap: 1rem;
		align-items: center;
		padding: 0.5rem 1rem;
		background: #f7f7f8;
		border-bottom: 1px solid #e5e7eb;
		z-index: 5;
	}
	.title {
		font-weight: 600;
	}
	.hint {
		font-size: 0.9rem;
		color: #6b7280;
	}
	.pages {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
	}
	.page-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.page-canvas {
		max-width: min(100%, 900px);
		height: auto;
		box-shadow: 0 1px 6px rgba(0, 0, 0, 0.12);
		background: #fff;
	}
	.status {
		text-align: center;
		color: #6b7280;
		margin-top: 0.5rem;
	}
	.status.error {
		color: #b91c1c;
	}
	@media print {
		body * {
			display: none !important;
		}
	}
</style>
