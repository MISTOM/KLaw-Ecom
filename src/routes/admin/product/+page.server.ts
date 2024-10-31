import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load = (async ({ locals }) => {
    console.log('adminlocals', locals)
    if (!locals.user) {
        throw redirect(302, '/login')
    }

    const user = await prisma.user.findUnique({
        where: {
            id: locals.user.id
        }
    })
    
    return {
        user
    };
}) satisfies PageServerLoad;