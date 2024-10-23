<script lang="ts">
	import { fade } from 'svelte/transition';
	import cart from '$lib/Cart.svelte';

	const { item }: any = $props();
</script>

<div
	class="flex items-center justify-between border-b border-gray-200 py-2"
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 100 }}
>
	<div class="flex items-center">
		<img src={item.product.thumbnail} alt="Product" class="mr-4 size-12 rounded object-cover" />
		<div>
			<h4>{item.product.title}</h4>
			<span class="text-sm">Ksh {item.product.price} each</span>
		</div>
	</div>

	<div class="flex items-center">
		<button
			class="rounded p-1 hover:bg-gray-200"
			aria-label="Subtract 1 from quantity"
			onclick={() => {
				if (item.quantity === 1) return;
				item.quantity--;
			}}>-</button
		>
		<span class="p-1">{item.quantity}</span>
		<button
			class="rounded p-1 hover:bg-gray-200"
			aria-label="Add 1 to quantity"
			onclick={() => {
				item.quantity++;
			}}>+</button
		>
		<button
			class="ml-4 rounded p-1 hover:bg-red-100"
			onclick={() => {
				cart.removeItem(item.id);
			}}>🗑️</button
		>
	</div>
</div>
