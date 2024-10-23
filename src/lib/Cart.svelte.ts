class cart {
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

	removeItem(id: string) {
		this.cartItems = this.cartItems.filter((item) => item.id !== id);
        if(this.cartStats.quantity === 0) this.cartopen = false
	}

    // save(){
    //     localStorage.setItem('cart', JSON.stringify(this.cartItems));
    // }
    constructor(){}
}
const newcart = new cart();
export default newcart;