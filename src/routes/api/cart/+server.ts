import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';


export const GET = async ({ locals: { user } }) => {
	if (!user?.id) {
		return error(401, 'Unauthorized');
	}

	try {
		const cart = await prisma.cart.findUnique({
			where: { userId: user.id },
			include: {
				CartItem: {
					include: {
						product: { include: { Image: { select: { url: true } } } }
					}
				}
			}
		});

		if (!cart) {
			return error(404, 'Empty cart');
		}

		return json(cart.CartItem);
	} catch (e) {
		return error(500, 'Failed to load cart');
	}
};

export const POST = async ({ request, locals: { user } }) => {
	if (!user?.id) return error(401, 'Unauthorized');

	const cartItems = await request.json(); // [{ productId: 1, quantity: 2 }, { productId: 2, quantity: 3 }]

	// Validate request data
	if (!Array.isArray(cartItems) || !cartItems.every(item =>
		typeof item.productId === 'number' &&
		typeof item.quantity === 'number' &&
		item.quantity > 0
	)) {
		throw error(400, 'Invalid cart items format');
	}


	try {

		// Upsert cart and cartItems in a transaction
		await prisma.$transaction(async (tx) => {
			// Find or create cart
			const cart = await tx.cart.upsert({
				where: { userId: user.id },
				create: { userId: user.id },
				update: {}
			});

			// Delete existing cart items
			await tx.cartItem.deleteMany({
				where: { cartId: cart.id }
			});

			// Create new cart items
			await tx.cartItem.createMany({
				data: cartItems.map(item => ({
					cartId: cart.id,
					productId: item.productId,
					quantity: item.quantity
				}))
			});
		});
		return json({ message: 'Cart saved' });
	} catch (e) {
		return error(500, 'Error saving cart');
	}
};
