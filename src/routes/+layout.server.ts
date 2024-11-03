
import type { LayoutServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async ({ locals: { user } }) => {

    if (user) {
        console.log('user found:', user)
        const loggedInUser = await prisma.user.findUnique({
            where: { id: user.id }
        })
        return { user: loggedInUser };
    }
    return { user: null };

}) satisfies LayoutServerLoad;