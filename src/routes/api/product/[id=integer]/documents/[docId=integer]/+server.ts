import { error, json, type RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import auth from '$lib/server/auth';
import fs from 'fs';
import path from 'path';

export const DELETE: RequestHandler = async ({ params, locals }) => {
    const user = locals.user;
    if (!(await auth.isAdmin(user))) throw error(401, 'Unauthorized');
    const productId = Number(params.id);
    const docId = Number(params.docId);
    if (Number.isNaN(productId) || Number.isNaN(docId)) throw error(400, 'Invalid params');

    const doc = await prisma.productDocument.findFirst({ where: { id: docId, productId } });
    if (!doc) throw error(404, 'Not found');

    await prisma.productDocument.delete({ where: { id: doc.id } });

    // Delete file best-effort
    try {
        const filePath = path.join('uploads', 'product-documents', String(productId), doc.storedName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
        console.warn('Failed to delete physical product document file', e);
    }

    return json({ success: true });
};
