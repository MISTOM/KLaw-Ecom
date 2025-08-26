import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import auth from '$lib/server/auth';
import { randomUUID } from 'crypto';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// Max PDF size (25MB default)
const MAX_BYTES = 25 * 1024 * 1024;

export const GET = async ({ params, locals }) => {
    const productId = Number(params.id);
    if (Number.isNaN(productId)) throw error(400, 'Invalid product id');

    const product = await prisma.product.findUnique({
        where: { id: productId, isPublished: true }
    });
    if (!product) throw error(404, 'Product not found');

    const docs = await prisma.productDocument.findMany({
        where: { productId, isPublished: true },
        select: { id: true, originalName: true, sizeBytes: true },
        orderBy: { sortOrder: 'asc' }
    });

    // If user not subscribed only return count (avoid leaking names) – simple privacy measure
    if (!locals.isSubscribed) {
        return json({ count: docs.length });
    }

    return json({ documents: docs });
};

export const POST = async ({ params, request, locals }) => {
    const user = locals.user;
    if (!(await auth.isAdmin(user))) throw error(401, 'Unauthorized');
    const productId = Number(params.id);
    if (Number.isNaN(productId)) throw error(400, 'Invalid product id');

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw error(404, 'Product not found');

    const form = await request.formData();
    const file = form.get('file') as File | null;
    if (!file) throw error(400, 'Missing file');
    if (file.type !== 'application/pdf') throw error(400, 'Only PDF allowed');
    if (file.size > MAX_BYTES) throw error(413, 'File too large');

    // Create directory per product
    const dir = path.join('uploads', 'product-documents', String(productId));
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    // Generate new stored name
    const storedName = `${randomUUID()}.pdf`;
    const fullPath = path.join(dir, storedName);

    // Stream to disk and compute checksum
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = createHash('sha256').update(buffer).digest('hex');

    // Replacement logic: if another doc with SAME originalName exists, replace it (case-insensitive)
    const existing = await prisma.productDocument.findFirst({
        where: { productId, originalName: file.name }
    });

    await new Promise<void>((resolve, reject) => {
        const ws = createWriteStream(fullPath);
        ws.on('finish', () => resolve());
        ws.on('error', (e) => reject(e));
        ws.end(buffer);
    });

    let doc;
    if (existing) {
        // Delete old physical file if different storedName
        try {
            if (existing.storedName && existing.storedName !== storedName) {
                const oldPath = path.join(dir, existing.storedName);
                if (existsSync(oldPath)) unlinkSync(oldPath);
            }
        } catch (e) {
            console.warn('Warn: failed deleting old product document file', e);
        }
        doc = await prisma.productDocument.update({
            where: { id: existing.id },
            data: {
                originalName: file.name,
                storedName,
                sizeBytes: file.size,
                mimeType: file.type,
                checksumSha256: hash
            }
        });
    } else {
        doc = await prisma.productDocument.create({
            data: {
                productId,
                originalName: file.name,
                storedName,
                sizeBytes: file.size,
                mimeType: file.type,
                checksumSha256: hash
            }
        });
    }

    return json({ success: true, document: { id: doc.id, originalName: doc.originalName } });
};
