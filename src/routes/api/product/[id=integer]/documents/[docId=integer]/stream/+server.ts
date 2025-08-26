import { error, type RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = async ({ params, locals }) => {
    const productId = Number(params.id);
    const docId = Number(params.docId);
    if (Number.isNaN(productId) || Number.isNaN(docId)) throw error(400, 'Invalid params');

    const product = await prisma.product.findUnique({ where: { id: productId, isPublished: true } });
    if (!product) throw error(404, 'Product not found');

    const doc = await prisma.productDocument.findFirst({
        where: { id: docId, productId, isPublished: true }
    });
    if (!doc) throw error(404, 'Document not found');

    if (!locals.isSubscribed && !(await import('$lib/server/auth')).default.isAdmin(locals.user)) {
        throw error(403, 'Subscription required');
    }

    const filePath = path.join('uploads', 'product-documents', String(productId), doc.storedName);
    if (!fs.existsSync(filePath)) throw error(404, 'File missing');

    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    return new Response(stream as any, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Length': String(stat.size),
            'Content-Disposition': `inline; filename="${doc.originalName.replace(/"/g, '')}"`,
            'Cache-Control': 'no-store'
        }
    });
};
