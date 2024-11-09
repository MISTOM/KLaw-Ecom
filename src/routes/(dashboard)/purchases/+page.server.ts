import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { user } }) => {
	try {
		if (user) {
			const orders = await prisma.order.findMany({
				where: {
					userId: user.id
				},
				include: {
					ProductOnOrder: {
						include: { product: true }
					}
				},
				orderBy: { createdAt: 'desc' }
			});

			return { orders };
		}
	} catch (e) {
		console.log('getOrder: ', e);
		return { status: 500, error: 'Internal server error getting order' };
	}
}) satisfies PageServerLoad;
