<script lang="ts">
	import { goto } from '$app/navigation';

	const { children } = $props();

	const handleLogout = async () => {
		const response = await fetch('/api/logout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) {
			console.error('Failed to log out');
		}
		console.log(await response.json());
		goto('/login');
	};
</script>

<div class="m-5">
	<img src="/kLawLogo.png" alt="logo" class="h-10 md:h-12 lg:h-20" />
</div>

<header class="flex justify-between bg-fadeblack p-2 text-white">
	<nav class="flex items-center">
		<ul class="flex">
			<li class="mx-4 transition-colors hover:text-secondary">
				<a href="/admin/product">Products</a>
			</li>
			<li class="mx-4 transition-colors hover:text-secondary"><a href="/admin/order">Orders</a></li>
		</ul>
	</nav>
	<div class="flex items-center">
		<a class="mx-4 transition-colors hover:text-secondary" href="/admin/profile">Profile</a>

		<button
			class="mx-3 rounded border border-transparent p-1 transition-colors hover:border-primary"
			onclick={() => {
				handleLogout();
			}}>Log out</button
		>
	</div>
</header>
{@render children?.()}
