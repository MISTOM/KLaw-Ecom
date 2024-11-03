import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async () => {
    //get all orders
    const order = await prisma.order.findMany({
        include: {
            ProductOnOrder: {
                include: { product: true }
            }
        }
    })
    console.log(order)
    return { order }
}) satisfies PageServerLoad;