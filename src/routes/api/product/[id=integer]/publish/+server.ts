import auth from '$lib/server/auth.js';
import prisma from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';

export const PUT = async ({ params, request, locals: { user } }) => {
    const id = Number(params.id);
    if (!await auth.isAdmin(user)) return error(401, 'Unauthorized');

    try {
        const { isPublished } = await request.json();

        await prisma.product.update({
            where: { id },
            data: { isPublished: !!isPublished }
        });

        return json({ success: true });
    } catch (e) {
        console.log('publishProduct Err:', e);

        return error(500, 'Internal server error publishing product');
    }
};