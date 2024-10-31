import { getContext, setContext } from "svelte";

class Cart {
	cartItems = $state<any[]>([]);
	cartopen = $state(false);

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

	async saveCart() {
		try {
			const response = await fetch('/api/cart', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(this.cartItems)
			});
			if (!response.ok) {
				throw new Error('Failed to save cart');
			}
		} catch (error) {
			console.error(error);
		}
	}

	async loadCart() {
		try {
			const response = await fetch('/api/cart');
			if (response.ok) {
				this.cartItems = await response.json();
				console.log(this.cartItems);
			} else {
				throw new Error('Failed to load cart');
			}
		} catch (error) {
			console.error(error);
		}
	}

	removeItem(id: string) {
		this.cartItems = this.cartItems.filter((item) => item.id !== id);
		if (this.cartStats.quantity === 0) this.cartopen = false;
		this.saveCart();
	}

	// save(){
	//     localStorage.setItem('cart', JSON.stringify(this.cartItems));
	// }
	constructor() {
		// this.loadCart();
	 }
}

const STATE_KEY = Symbol('cart-store-key');
export function setCartState(cart: Cart) {
	const newCart = new Cart();
	setContext(STATE_KEY, newCart);
	return cart;
}

export function getCartState() {
	return getContext(STATE_KEY);
}

const newcart = new Cart();
export default newcart;
