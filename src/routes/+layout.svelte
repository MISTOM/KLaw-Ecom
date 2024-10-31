<script>
	import { setUserState } from '$lib/state.svelte';
	import '../app.css';

	let { children, data } = $props();

	// if (data.user) setUserState(data.user);
</script>

<div class="font-sans">
	<!-- TODO: Fix Optima font -->
	{@render children?.()}
</div>
<footer class=""></footer>
