import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ locals: { user }, request }) => {
	if (!user) throw error(401, 'Unauthorized');

	try {
		const { cartItems } = await request.json();

		// Start transaction for consistent check
		const validationResult = await prisma.$transaction(async (tx) => {
			// Get latest product data
			const products = await tx.product.findMany({
				where: {
					id: { in: cartItems.map((item: any) => item.product.id) }
				},
				select: {
					id: true,
					name: true,
					quantity: true,
					price: true
				}
			});

			// Check if all products exist
			if (products.length !== cartItems.length) {
				throw error(400, 'Some products are no longer available');
			}

			// Create map for efficient lookup
			const productMap = new Map(products.map((p) => [p.id, p]));

			// Validate stock and prices
			for (const item of cartItems) {
				const product = productMap.get(item.product.id);
				if (!product) {
					throw error(400, `Product ${item.product.name} not found`);
				}
				if (product.quantity < item.quantity) {
					throw error(400, `Insufficient stock for ${product.name}`);
				}
				// Optional: Validate if price hasn't changed
				if (product.price !== item.product.price) {
					throw error(400, `Price has changed for ${product.name}`);
				}
			}

			return true;
		});

		return json({ valid: validationResult });
	} catch (e) {
		console.error('Validation error:', e);
		//@ts-ignore
		throw error(e?.status || 500, e || 'Validation failed');
	}
};
