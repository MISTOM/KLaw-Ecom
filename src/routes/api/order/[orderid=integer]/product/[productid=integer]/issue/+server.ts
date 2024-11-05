import auth from '$lib/server/auth';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const PUT: RequestHandler = async ({ locals, params, request }) => {
    if (!await auth.isAdmin(locals.user)) return error(401, 'Unauthorized');

    const orderId = Number(params.orderid);
    const productId = Number(params.productid);
    const { isIssued } = await request.json()
    try {

        await prisma.productOnOrder.update({
            where: { orderId_productId: { orderId, productId } },
            data: { isIssued: !!isIssued }
        })

        return json({ success: true });


    } catch (e) {
        console.log('issueProduct Err:', e);
        return error(500, 'Internal server error issuing product');

    }
};