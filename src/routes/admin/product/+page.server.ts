
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    if (!locals.user) { throw redirect(303, '/login') }
    // console.log('adminlocals', locals)

    const user = await prisma.user.findUnique({
        where: {
            id: locals.user.id
        }
    })

    return {
        user
    };
}) satisfies PageServerLoad;