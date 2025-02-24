<script lang="ts">
	import { fade } from 'svelte/transition';

	let { show = $bindable(), title, children, modalClass = 'max-w-lg' } = $props();

	const close = () => (show = false);
	// const overflow = $derived((show: boolean) =>
	// 	show ? document.body.classList.add('overflow-hidden') : document.body.classList.remove('overflow-hidden')
	// );
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && close()} />

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
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
			class="relative z-50 w-full transform overflow-y-auto rounded-sm bg-white p-6 shadow-xl transition-all {modalClass}"
		>
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">{title}</h2>
				<button class="text-gray-400 hover:text-gray-500" aria-label="Close Button" onclick={close}>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			<div class="mt-2">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}
