<script>
	import '../app.css';
	import cart from '$lib/Cart.svelte';

	let { children } = $props();
</script>

<div class="m-5">
	<img src="/kLawLogo.png" alt="logo" class="h-10 md:h-12 lg:h-20" />
</div>

<header class="flex justify-between bg-fadeblack p-2 text-white">
	<nav class="flex items-center">
		<ul class="flex">
			<li class="mx-4 transition-colors hover:text-secondary"><a href="/">Home</a></li>
			<li class="mx-4 transition-colors hover:text-secondary"><a href="/products">Products</a></li>
			<li class="mx-4 transition-colors hover:text-secondary"><a href="/about">About</a></li>
		</ul>
	</nav>
	<div>
		<button
			class="rounded bg-secondary p-2 transition-colors hover:bg-secondary"
			onclick={() => (cart.cartopen = !cart.cartopen)}
		>
			Cart: {cart.cartStats.quantity}</button
		>
	</div>
</header>

<div>
	{@render children?.()}
</div>
<footer class=""></footer>
