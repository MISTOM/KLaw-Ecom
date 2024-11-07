<script lang="ts">
	import type { Toast } from '$lib/Toast.svelte';
	import { getToastState } from '$lib/Toast.svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		toast: Toast;
	};

	let { toast }: Props = $props();
	const toastState = getToastState();
</script>

<div class="border-gray-500p-2 relative flex h-16 w-60 flex-col justify-center rounded-md border shadow-md" in:slide>
	<span class="text-sm font-medium">{toast.title}</span>
	<span class="text-xs">{toast.message}</span>
	<button class="absolute right-2 top-2 size-5" onclick={() => toastState.remove(toast.id)}>
		<span class="sr-only">Close toast</span>
		X
	</button>
</div>
