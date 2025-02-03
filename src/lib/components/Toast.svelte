<script lang="ts">
	import type { Toast } from '$lib/Toast.svelte';
	import { getToastState } from '$lib/Toast.svelte';
	import { slide } from 'svelte/transition';

	type Props = { toast: Toast };

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
			bg: 'bg-secondary/80',
			text: 'text-black'
		}
	};

	// Toast icons
	const toastIcons = {
		success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
  </svg>`,

		error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
  </svg>`,

		warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
  </svg>`,

		info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" />
  </svg>`
	};

	// Derive the icon and styles based on the toast typ
	const toastIcon = $derived(toastIcons[toast.type]);
	const toastStyles = $derived(toastTypes[toast.type] || toastTypes.info);
</script>

<div
	class="relative flex h-16 w-80 items-center justify-between rounded-md bg-gray-50 px-4 py-2 shadow-xs"
	in:slide
	out:slide={{ duration: 100 }}
>
	<div class="flex items-center gap-3">
		{#if toastIcon}
			<div class={`rounded-full p-2 ${toastStyles.bg} ${toastStyles.text}`}>
				{@html toastIcon}
			</div>
		{/if}
		<div>
			<p class="font-medium">{toast.title}</p>
			<p class="text-sm text-gray-600">{toast.message}</p>
		</div>
	</div>
	<button
		class="w-7 rounded-full bg-gray-200 pb-1 text-gray-600 hover:bg-gray-300 focus:outline-hidden"
		onclick={() => toastState.remove(toast.id)}
	>
		<span class="sr-only">Close toast</span>
		&times;
	</button>
</div>
