import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals: { user } }) => {
    const id = Number(params.id);

    try {
        if (user) {
            const order = await prisma.order.findUnique({
                where: { id },
                include: {
                    ProductOnOrder: {
                        include: { product: true }
                    }
                }
            })

            if (!order) return { status: 404, error: 'Order not found' }
            if (order.userId !== user.id) return { status: 403, error: 'Forbidden' }

            return { order }
        }

    } catch (e) {

    }
    return {};
}) satisfies PageServerLoad;