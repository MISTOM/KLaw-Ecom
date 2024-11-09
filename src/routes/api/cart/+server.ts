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

	try {
		// TODO - Review this approach
		// Validate cart items

		// if (!Array.isArray(cartItems) || !cartItems.every(item => item.productId && item.quantity)) {
		//     throw error(400, 'Invalid cart items');
		// }

		// await prisma.$transaction(async (tx) => {
		//     // Clear existing cart items
		//     await tx.cartItem.deleteMany({ where: { userId: user.id } });

		//     // Add new cart items
		//     await tx.cartItem.createMany({
		//         data: cartItems.map(item => ({
		//             userId: user.id,
		//             productId: item.productId,
		//             quantity: item.quantity
		//         }))
		//     });
		// });

		await prisma.cart.upsert({
			where: { userId: user.id },
			update: {
				CartItem: {
					deleteMany: {}, // Clear existing items

					//@ts-ignore
					create: cartItems.map((item) => ({
						productId: item.productId,
						quantity: item.quantity
					}))
				}
			},
			create: {
				userId: user.id,
				CartItem: {
					//@ts-ignore
					create: cartItems.map((item) => ({
						productId: item.productId,
						quantity: item.quantity
					}))
				}
			}
		});

		return json({ message: 'Cart saved' });
	} catch (e) {
		return error(500, 'Error saving cart');
	}
};
