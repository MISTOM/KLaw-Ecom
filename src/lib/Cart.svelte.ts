import { goto } from '$app/navigation';
import { getContext, setContext } from 'svelte';
import type { Product } from '@prisma/client';
import { getToastState } from './Toast.svelte';
import { error } from '@sveltejs/kit';

// const toastState = getToastState();

// extend product with image property
interface ProductWithImage extends Product {
	Image: { url: string }[];
}
// extend cartItem with product property
export interface CartItems {
	id: number;
	productId: number;
	quantity: number;
	product: ProductWithImage;
}

class Cart {
	cartItems = $state<CartItems[]>([]); // { id: 1, productId: 1, quantity: 2, product: { id: 1, name: 'product1', price: 100, Image: { url: 'url' } } }
	cartopen = $state(false);
	isLoading = $state(false);
	cartStats = $derived.by(() => {
		let quantity = 0,
			total = 0;

		for (let item of this.cartItems) {
			quantity += item.quantity;
			total += item.product.price * item.quantity;
		}

		return {
			total,
			quantity
		};
	});

	async addItem(product: ProductWithImage) {
		const existingItem = this.cartItems.find((item) => item.product.id === product.id);

		if (existingItem) {
			existingItem.quantity++;
		} else {
			this.cartItems = [
				...this.cartItems,
				// TODO - use crypto.randomUUID() instead
				{ id: Math.random() * Date.now(), productId: product.id, quantity: 1, product }
			];
		}

		return await this.saveCart();
	}

	async saveCart() {
		this.isLoading = true;
		const cartItems = this.cartItems.map((item) => {
			return {
				productId: item.product.id,
				quantity: item.quantity
			};
		});

		try {
			const response = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(cartItems)
			});

			if (!response.ok) {
				console.error()
				throw error(response.status, await response.json());
			}
			return true;
		} catch (e) {

			console.error(e);
			//TODO- Rethrow error to handle it in the UI

			return false;
		} finally {
			this.isLoading = false;
		}
	}

	// async loadCart() {
	// 	try {
	// 		const response = await fetch('/api/cart');

	// 		if (response.ok) {
	// 			const cartItemsRes = await response.json();

	// 			this.cartItems = cartItemsRes.map((item: CartItems) => {
	// 				return {
	// 					id: item.id,
	// 					productId: item.productId,
	// 					quantity: item.quantity,
	// 					product: item.product
	// 				};
	// 			});
	// 			console.log('Loaded CartItems: -->  ', this.cartItems);
	// 		}

	// 		if (response.status === 401) {
	// 			console.error('Unauthorized loading cart: No user logged in');
	// 			await goto('/login');
	// 			return;
	// 		}

	// 		if (response.status === 404) {
	// 			console.log('Empty Cart loaded');
	// 			this.cartItems = [];
	// 		}

	// 		console.log('EndLoadCart: ', response, await response.json());

	// 	} catch (e) {
	// 		console.error(e);
	// 		this.cartItems = []
	// 	}
	// }

	async removeItem(id: number) {
		// TODO - rollback if failed
		// const previousItems = [...this.cartItems];
		// this.cartItems = this.cartItems.filter((item) => item.id !== id);

		// try {
		//     await this.saveCart();
		// } catch (error) {
		//     this.cartItems = previousItems; // Rollback on failure
		//     throw error;
		// }
		this.cartItems = this.cartItems.filter((item) => item.id !== id);
		if (this.cartStats.quantity === 0) this.cartopen = false;
		await this.saveCart();
	}

	// save(){
	//     localStorage.setItem('cart', JSON.stringify(this.cartItems));
	// }
	constructor(cartItems: CartItems[] = []) {
		this.cartItems = cartItems;
	}
}

const STATE_KEY = Symbol('cart-store-key');
export function setCartState(cartItems: CartItems[]) {
	const newCart = new Cart(cartItems);
	setContext(STATE_KEY, newCart);
	return newCart;
}

export function getCartState() {
	return getContext<ReturnType<typeof setCartState>>(STATE_KEY);
}
