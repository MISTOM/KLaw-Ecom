import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals: { user }, url }) => {
	if (!url.pathname.startsWith('/product') && !user) throw redirect(303, '/login');
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
		return { cartItems: cart?.CartItem || [] };
	}
	return { cartItems: [] };
}) satisfies LayoutServerLoad;
