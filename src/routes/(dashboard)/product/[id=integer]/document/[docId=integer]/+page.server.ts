import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	if (!locals.isSubscribed) throw redirect(303, '/pricing');
	const productId = Number(params.id);
	const docId = Number(params.docId);

	const product = await prisma.product.findUnique({ where: { id: productId, isPublished: true } });
	if (!product) throw error(404, 'Product not found');
	const doc = await prisma.productDocument.findFirst({
		where: { id: docId, productId, isPublished: true },
		select: { id: true, originalName: true }
	});
	if (!doc) throw error(404, 'Document not found');
	return { productId, docId: doc.id, title: doc.originalName };
};
