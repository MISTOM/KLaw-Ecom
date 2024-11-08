<script>
	import '../app.css';
	// import { setUserState } from '$lib/state.svelte';
	import { setToastState } from '$lib/Toast.svelte';
	import Toaster from '$lib/components/Toaster.svelte';

	let { children, data } = $props();
	setToastState()
</script>

<Toaster />
<div class=" font-optima">
	<!-- TODO: Fix Optima font -->
	{@render children?.()}
</div>
<footer class=""></footer>
