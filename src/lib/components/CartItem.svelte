<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getCartState, type CartItems } from '$lib/Cart.svelte';

	const { item }: { item: CartItems } = $props();

	const cart = getCartState();
</script>

<div
	class="flex items-center justify-between border-b border-fadeblack py-2"
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 100 }}
>
	<div class="flex items-center">
		<img
			src={item.product.Image[0]?.url || '/kLawPillers.png'}
			alt="Product"
			class="mr-4 size-12 rounded object-cover"
		/>
		<div>
			<h4>{item.product.name}</h4>
			<span class="text-sm">KES {item.product.price} each</span>
		</div>
	</div>

	<div class="flex items-center">
		<button
			class="rounded p-1 hover:bg-gray-200"
			aria-label="Subtract 1 from quantity"
			onclick={async () => {
				if (item.quantity === 1) return;
				item.quantity--;
				await cart.saveCart();
			}}>-</button
		>
		<span class="p-1">{item.quantity}</span>
		<button
			class="rounded p-1 hover:bg-gray-200"
			aria-label="Add 1 to quantity"
			onclick={async () => {
				item.quantity++;
				await cart.saveCart();
			}}>+</button
		>
		<button
			class="ml-4 rounded p-1 hover:bg-red-200"
			onclick={async () => {
				await cart.removeItem(item.id);
			}}>🗑️</button
		>
	</div>
</div>
