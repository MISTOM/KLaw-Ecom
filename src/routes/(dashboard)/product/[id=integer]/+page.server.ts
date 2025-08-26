import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {
	const id = Number(params.id);

	try {
		const product = await prisma.product.findUnique({
			where: { id, isPublished: true },
			include: { Image: true, categories: true }
		});

		if (!product) return { status: 404, error: 'Product not found' };

		// Fetch published product documents (only need minimal fields) if user is subscribed
		let productDocuments: { id: number; originalName: string }[] = [];
		if (locals.isSubscribed) {
			productDocuments = await prisma.productDocument.findMany({
				where: { productId: product.id, isPublished: true },
				select: { id: true, originalName: true },
				orderBy: { sortOrder: 'asc' }
			});
		}

		// Determine active promotion pricing (reuse logic in listing simplified here)
		const now = new Date();
		const promotions = await prisma.promotion.findMany({
			where: {
				isActive: true,
				startsAt: { lte: now },
				endsAt: { gte: now },
				OR: [
					{ products: { some: { productId: product.id } } },
					{ categories: { some: { categoryId: { in: product.categories.map((c) => c.id) } } } }
				]
			},
			select: { id: true, name: true, discountType: true, discountValue: true, priority: true },
			orderBy: [{ priority: 'asc' }, { startsAt: 'desc' }]
		});
		let discountedPrice: number | null = null;
		let appliedPromotion: any = null;
		for (const promo of promotions) {
			let final = product.price;
			if (promo.discountType === 'PERCENT') final = Math.max(0, product.price * (1 - Number(promo.discountValue) / 100));
			else final = Math.max(0, product.price - Number(promo.discountValue));
			if (discountedPrice === null || final < discountedPrice - 0.0001) {
				discountedPrice = final;
				appliedPromotion = promo;
			}
		}
		return { product: { ...product, discountedPrice: discountedPrice ? Number(discountedPrice.toFixed(2)) : null, appliedPromotion }, productDocuments, isSubscribed: locals.isSubscribed };
	} catch (e) {
		console.log('err getting product: ', e);
		//@ts-ignore
		return { status: 500, error: e.message };
	}
}) satisfies PageServerLoad;
