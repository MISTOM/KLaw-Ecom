<script lang="ts">
	import { getToastState } from '$lib/Toast.svelte';
	import Toast from './Toast.svelte';
	const toastState = getToastState();
</script>

<div class="fixed top-2 right-2 z-50 flex flex-col gap-2">
	{#each toastState.toasts as toast}
		<Toast {toast} />
	{/each}
</div>
