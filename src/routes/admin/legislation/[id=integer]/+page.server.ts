import { error } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const id = parseInt(params.id);

    if (isNaN(id)) {
        throw error(400, 'Invalid legislation ID');
    }

    const legislation = await prisma.legislationItem.findUnique({
        where: { id }
    });

    if (!legislation) {
        throw error(404, 'Legislation not found');
    }

    return {
        legislation
    };
};
