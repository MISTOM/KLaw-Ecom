<script lang="ts">
	import type { Toast } from '$lib/Toast.svelte';
	import { getToastState } from '$lib/Toast.svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		toast: Toast;
	};

	let { toast }: Props = $props();
	const toastState = getToastState();

	// Toast types and their corresponding styles
	const toastTypes = {
		success: {
			bg: 'bg-green-500',
			text: 'text-white'
		},
		error: {
			bg: 'bg-red-500',
			text: 'text-white'
		},
		info: {
			bg: 'bg-blue-500',
			text: 'text-white'
		},
		warning: {
			bg: 'bg-yellow-500',
			text: 'text-black'
		}
	};
	const toastStyles = $derived(toastTypes[toast.type] || toastTypes.info);
</script>

<div
	class="relative flex h-16 w-80 items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 shadow-md transition-all duration-300"
	in:slide out:slide
>
	<div class="flex items-center gap-3">
		<!-- {#if toast.icon}
			<div class={`rounded-full p-2 ${toastStyles.bg} ${toastStyles.text}`}>
				{@html toast.icon}
			</div>
		{/if} -->
		<div class={`rounded-full p-1 ${toastStyles.bg} ${toastStyles.text}`}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6"
				><path
					fill-rule="evenodd"
					d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
					clip-rule="evenodd"
				/></svg
			>
		</div>

		<div>
			<p class="font-medium">{toast.title}</p>
			<p class="text-sm text-gray-600">{toast.message}</p>
		</div>
	</div>
	<button
		class="w-7 pb-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 focus:outline-none"
		onclick={() => toastState.remove(toast.id)}
	>
		<span class="sr-only">Close toast</span>
		&times;
	</button>
</div>
