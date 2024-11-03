<script>
	import { setUserState } from '$lib/state.svelte';
	import '../app.css';

	let { children, data } = $props();

	setUserState(data?.user);
</script>

<div class="font-sans">
	<!-- TODO: Fix Optima font -->
	{@render children?.()}
</div>
<footer class=""></footer>
