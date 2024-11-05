import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async ({ params, depends }) => {
	depends('update:order');
	//get all orders
	const id = Number(params.id);
	try {
		const order = await prisma.order.findUnique({
			where: { id },
			include: {
				ProductOnOrder: {
					include: { product: true }
				},
				user: true
			}
		});
		if (!order) return { status: 404, error: 'Order not found' };
		return { order };
	} catch (e) {
		console.log('getOrder:', e);
		return { status: 500, error: 'Internal server error getting order details' };
	}
}) satisfies PageServerLoad;
