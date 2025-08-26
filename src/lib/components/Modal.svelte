<script lang="ts">
	import { fade } from 'svelte/transition';

	let { show = $bindable(), title, children, modalClass = 'max-w-lg' } = $props();

	const close = () => (show = false);

	// Prevent body scroll when modal is open
	$effect(() => {
		if (show) {
			document.body.classList.add('overflow-hidden');
		} else {
			document.body.classList.remove('overflow-hidden');
		}

		// Cleanup when component is destroyed
		return () => {
			document.body.classList.remove('overflow-hidden');
		};
	});
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && close()} />

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4"
		aria-modal="true"
		in:fade={{ duration: 70 }}
		out:fade={{ duration: 70 }}
	>
		<div
			class="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-all"
			aria-hidden="true"
			onclick={close}
		></div>

		<div
			class="relative z-50 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg bg-white shadow-xl transition-all {modalClass}"
		>
			<!-- Fixed header -->
			<div class="flex shrink-0 items-center justify-between border-b border-gray-200 p-6">
				<h2 class="text-xl font-semibold text-gray-900">{title}</h2>
				<button
					class="focus:ring-primary rounded-md p-1 text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-offset-2 focus:outline-none"
					aria-label="Close Button"
					onclick={close}
				>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<!-- Scrollable content -->
			<div class="flex-1 overflow-y-auto p-6">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
