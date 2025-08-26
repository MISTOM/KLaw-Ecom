import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { LayoutServerLoad } from './$types';
import { getActivePromotions, selectBestPromotion } from '$lib/server/promotionPricing';

export const load = (async ({ locals: { user, isSubscribed }, url }) => {
	// Reason: Allow non-logged-in users to view product pages and subscription plans
	if (!url.pathname.startsWith('/product') && !url.pathname.startsWith('/subscription') && !user) throw redirect(303, '/login');
	if (user) {
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

		if (!cart) return { cartItems: [], isSubscribed };

		// Apply promotion pricing snapshot to existing cart items (fetch only relevant promotions)
		const productIds = cart.CartItem.map(ci => ci.productId || ci.product.id).filter(Boolean);
		const categoryIds = Array.from(new Set(cart.CartItem.flatMap(ci => ci.product.categories.map(c => c.id))));
		const activePromotions = await getActivePromotions(new Date(), { productIds, categoryIds });
		const enriched = cart.CartItem.map((ci) => {
			const categoryIds = ci.product.categories.map((c) => c.id);
			const applied = selectBestPromotion(ci.product.price, ci.product.id, categoryIds, activePromotions);
			return applied
				? {
					...ci,
					product: {
						...ci.product,
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

		return { cartItems: enriched, isSubscribed };
	}
	return { cartItems: [], isSubscribed: false };
}) satisfies LayoutServerLoad;
