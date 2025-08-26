<script lang="ts">
	import { fade } from 'svelte/transition';
	import { getCartState, type CartItems } from '$lib/Cart.svelte';
	import { getToastState } from '$lib/Toast.svelte';

	const { item }: { item: CartItems } = $props();

	const cart = getCartState();
	const toast = getToastState();

	// Promotion-aware derived values
	// Reason: Cart item may have a discountedPrice injected at load time; keep UI logic local & resilient.
	const hasDiscount = $derived(!!(item.product as any).discountedPrice);
	const finalUnit = $derived((hasDiscount ? (item.product as any).discountedPrice : item.product.price) as number);
	const appliedPromotion = $derived((item.product as any).appliedPromotion || null);
	const discountBadge = $derived.by(() => {
		if (!appliedPromotion) return '';
		if (appliedPromotion.discountType === 'PERCENT') return `${appliedPromotion.discountValue}% off`;
		// Amount discount – compute percent for user clarity if possible
		const amt = appliedPromotion.discountValue;
		const pct = Math.round((amt / item.product.price) * 100);
		return `Save KES ${amt.toLocaleString()}${pct ? ` (${pct}% )` : ''}`;
	});
</script>

<div
	class="border-fadeblack flex items-center justify-between border-b py-2"
	in:fade={{ duration: 100 }}
	out:fade={{ duration: 100 }}
>
	<div class="flex items-center">
		<img
			src={item.product.Image[0]?.url || '/coat-of-arms.jpg'}
			alt="Product"
			class="mr-4 size-12 rounded-sm object-cover"
		/>
		<div>
			<h4>{item.product.name}</h4>
			{#if hasDiscount}
				<div class="text-sm">
					<span class="mr-1 text-gray-400 line-through">KES {item.product.price.toLocaleString()}</span>
					<span class="text-primary font-semibold">KES {finalUnit.toLocaleString()}</span>
				</div>
				{#if discountBadge}
					<span class="bg-primary/10 text-primary mt-0.5 inline-block rounded px-2 py-0.5 text-[11px] font-medium"
						>{discountBadge}</span
					>
				{/if}
			{:else}
				<span class="text-sm">KES {item.product.price.toLocaleString()} each</span>
			{/if}
			<div class="mt-0.5 text-xs text-gray-500">Subtotal: KES {(finalUnit * item.quantity).toLocaleString()}</div>
		</div>
	</div>

	<div class="flex items-center">
		<button
			class="rounded-sm p-1 hover:bg-gray-200"
			aria-label="Subtract 1 from quantity"
			onclick={async () => {
				if (item.quantity === 1) return;
				item.quantity--;
				await cart.saveCart();
			}}>-</button
		>
		<span class="p-1">{item.quantity}</span>
		<button
			class="rounded-sm p-1 hover:bg-gray-200"
			aria-label="Add 1 to quantity"
			onclick={async () => {
				const result = await cart.addItem(item.product);
				if (result.error) {
					toast.add('Stock Limited', result.error, 'warning');
				}
			}}>+</button
		>
		<button
			class="ml-4 rounded-sm p-1 hover:bg-red-200"
			onclick={async () => {
				await cart.removeItem(item.id);
			}}>🗑️</button
		>
	</div>
</div>
