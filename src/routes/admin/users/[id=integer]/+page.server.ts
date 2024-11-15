import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const id = Number(params.id)

    try {
        const userDetails = await prisma.user.findUnique({
            where: { id },
            include: { role: true, profileImage: true,  Order: { include: { ProductOnOrder: true } } }
        })
        return { user: userDetails }

    } catch (error) {
        console.log('Error getting user', error);

    }
    return {};
}) satisfies PageServerLoad;