import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

const ITEMS_PER_PAGE = 10;

export const load = (async ({ locals: { user }, url }) => {
	if (!user) return { orders: [], total: 0, page: 1 };

	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const skip = (page - 1) * ITEMS_PER_PAGE;

		const [orders, total] = await Promise.all([
			prisma.order.findMany({
				where: { userId: user.id },
				include: {
					ProductOnOrder: {
						include: { product: true }
					}
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: ITEMS_PER_PAGE,
			}),
			prisma.order.count({
				where: { userId: user.id }
			})
		]);

		return {
			orders,
			total,
			page,
			totalPages: Math.ceil(total / ITEMS_PER_PAGE)
		};
	} catch (e) {
		console.error('getOrders:', e);
		return { status: 500, error: 'Internal server error getting orders' };
	}
}) satisfies PageServerLoad;
