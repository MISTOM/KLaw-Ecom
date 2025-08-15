<script lang="ts">
	import { goto } from '$app/navigation';

	const { children } = $props();

	const handleLogout = async () => {
		const response = await fetch('/api/logout', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' }
		});

		if (!response.ok) console.error('Failed to log out');

		console.log(await response.json());
		goto('/', { invalidateAll: true });
	};
</script>

<div class="m-5">
	<a href="/admin/product">
		<img src="/kLawLogo.png" alt="logo" class="h-10 md:h-12 lg:h-20" />
	</a>
</div>

<header class="bg-fadeblack flex justify-between overflow-auto p-2 text-white">
	<nav class="flex items-center">
		<ul class="flex space-x-5">
			<li class=" hover:text-secondary ml-4 transition-colors">
				<a href="/admin/product">Products</a>
			</li>
			<li class="hover:text-secondary transition-colors"><a href="/admin/order">Orders</a></li>
			<li class="hover:text-secondary transition-colors"><a href="/admin/reports">Reports</a></li>
			<!-- <li class="transition-colors hover:text-secondary"><a href="/admin/users">Users</a></li> -->
			<li class="hover:text-secondary transition-colors"><a href="/admin/category">Categories</a></li>
			<li class="hover:text-secondary transition-colors"><a href="/admin/subscription">Subscription Plans</a></li>

			<!-- <li class="hover:text-secondary transition-colors"><a href="/admin/convenienceFee">Convenience Fee</a></li> -->
		</ul>
	</nav>
	<div class="flex items-center space-x-5">
		<a class="hover:text-secondary transition-colors" href="/admin/profile">Account</a>

		<button
			class="hover:border-primary rounded-sm border border-transparent p-1 transition-colors"
			onclick={() => {
				handleLogout();
			}}>Logout</button
		>
	</div>
</header>
{@render children?.()}
