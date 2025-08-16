import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals: { user, isSubscribed }, url }) => {
	// Reason: Allow non-logged-in users to view product pages and subscription plans
	if (!url.pathname.startsWith('/product') && !url.pathname.startsWith('/subscription') && !user) throw redirect(303, '/login');
	if (user) {
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
		return { cartItems: cart?.CartItem || [], isSubscribed };
	}
	return { cartItems: [], isSubscribed: false };
}) satisfies LayoutServerLoad;
