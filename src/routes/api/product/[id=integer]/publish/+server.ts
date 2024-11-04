import auth from '$lib/server/auth.js';
import prisma from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';

export const PUT = async ({ params, locals: { user } }) => {
    const id = Number(params.id);
    try {
        if (await auth.isAdmin(user)) {

            await prisma.product.update({
                where: { id },
                data: { isPublished: true }
            });

            return json({ success: true });
        } else {
            throw error(401, 'Unauthorized');
        }
    } catch (e) {
        console.log('publishProduct Err:', e);
        //@ts-ignore
        if (e.status === 401) return error(e.status, e.message);

        return error(500, 'Internal server error publishing product');
    }
};