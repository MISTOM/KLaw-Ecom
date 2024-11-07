import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const id = Number(params.id);

    try {

        const product = await prisma.product.findUnique({
            where: { id, isPublished: true },
            include: { Image: true }
        })

        if (!product) return { status: 404, error: 'Product not found' }
        return { product }

    } catch (e) {
        console.log("err getting product: ", e)
        //@ts-ignore
        return { status: 500, error: e.message }
    }


}) satisfies PageServerLoad;