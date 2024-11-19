import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ depends }) => {
	depends('update:order');
	//get all orders

	try {
		const orders = await prisma.order.findMany({
			include: {
				ProductOnOrder: {
					include: { product: true }
				},
				user: true
			}
		});
		console.log(orders);
		return { orders };
	} catch (e) {
		console.log('Error loading orders', e);
		return { orders: [] };
	}
}) satisfies PageServerLoad;
