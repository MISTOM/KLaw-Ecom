import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { getActivePromotions, selectBestPromotion } from '$lib/server/promotionPricing';

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
						product: { include: { Image: { select: { url: true } }, categories: { select: { id: true } } } }
					}
				}
			}
		});

		if (!cart) {
			return error(404, 'Empty cart');
		}

		// Apply promotion pricing on the fly (fetch only promotions touching cart's products/categories)
		const cartProductIds = cart.CartItem.map(ci => ci.product.id);
		const cartCategoryIds = Array.from(new Set(cart.CartItem.flatMap(ci => ci.product.categories.map(c => c.id))));
		const activePromotions = await getActivePromotions(new Date(), { productIds: cartProductIds, categoryIds: cartCategoryIds });
		const enriched = cart.CartItem.map((ci) => {
			const categoryIds = ci.product.categories.map((c) => c.id);
			const applied = selectBestPromotion(ci.product.price, ci.product.id, categoryIds, activePromotions);
			return applied
				? {
					...ci,
					product: {
						...ci.product,
						// flatten for client consumption
						discountedPrice: applied.finalUnitPrice,
						appliedPromotion: {
							id: applied.promotionId,
							name: applied.name,
							discountType: applied.discountType,
							discountValue: applied.discountValue
						}
					}
				}
				: ci;
		});
		return json(enriched);
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

		// Return enriched pricing snapshot (not persisted yet except quantities)
		const activePromotions = await getActivePromotions(new Date(), { productIds: cartItems.map((i: any) => i.productId) });
		const productsWithCats = await prisma.product.findMany({
			where: { id: { in: cartItems.map((i: any) => i.productId) } },
			select: { id: true, price: true, categories: { select: { id: true } } }
		});
		const map = new Map(productsWithCats.map((p) => [p.id, p]));
		const priced = cartItems.map((ci: any) => {
			const prod = map.get(ci.productId)!;
			const applied = selectBestPromotion(prod.price, prod.id, prod.categories.map((c) => c.id), activePromotions);
			return {
				productId: ci.productId,
				quantity: ci.quantity,
				unitPrice: prod.price,
				finalUnitPrice: applied ? applied.finalUnitPrice : prod.price,
				discountAmount: applied ? applied.discountAmount : 0,
				promotionId: applied?.promotionId
			};
		});
		return json({ message: 'Cart saved', items: priced });
	} catch (e: any) {
		console.log(e);
		return error(e?.status || 500, e?.body?.message || 'Error saving cart');
	}
};
