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

	const cartItems = await request.json(); //

	try {
		// Validate stock levels before saving cart
		const products = await prisma.product.findMany({
			where: {
				id: {
					in: cartItems.map((item: any) => item.productId)
				}
			}
		});

		const productMap = new Map(products.map((p) => [p.id, p]));

		// Check stock availability
		for (const item of cartItems) {
			const product = productMap.get(item.productId);
			if (!product || product.quantity < item.quantity) {
				return error(400, {
					message: `Only ${product?.quantity || 0} items available for ${product?.name || 'product'}`
				});
			}
		}

		// Existing cart update logic
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
				data: cartItems.map((item: any) => ({
					cartId: cart.id,
					productId: item.productId,
					quantity: item.quantity
				}))
			});
		});
		return json({ message: 'Cart saved' });
	} catch (e: any) {
		console.log(e);
		return error(e?.status || 500, e?.body?.message || 'Error saving cart');
	}
};
