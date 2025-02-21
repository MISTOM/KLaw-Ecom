import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

const ITEMS_PER_PAGE = 12;

export const load = (async ({ locals: { user }, url }) => {
	if (await auth.isAdmin(user)) return redirect(303, '/admin/product');

	try {
		const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
		const categoryId = url.searchParams.get('category') || 'all';
		const skip = (page - 1) * ITEMS_PER_PAGE;

		// Validate categoryId exists if not 'all'
		let where: any = { isPublished: true };
		if (categoryId !== 'all') {
			const category = await prisma.category.findUnique({
				where: { id: parseInt(categoryId) }
			});
			if (category) {
				where = {
					...where,
					categories: { some: { id: parseInt(categoryId) } }
				};
			}
		}

		const [products, total, categories] = await Promise.all([
			prisma.product.findMany({
				where,
				include: {
					Image: { select: { url: true } },
					categories: true
				},
				orderBy: { createdAt: 'desc' },
				skip,
				take: ITEMS_PER_PAGE
			}),
			prisma.product.count({ where }),
			prisma.category.findMany()
		]);

		const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

		// Redirect if page is out of bounds
		if (page > totalPages && total > 0) {
			return redirect(302, `?page=${totalPages}&category=${categoryId}`);
		}

		return {
			products,
			categories,
			page,
			totalPages
		};
	} catch (e) {
		console.error('getPublishedProducts: ', e);
		return { status: 500, error: 'Internal server error getting published products' };
	}
}) satisfies PageServerLoad;
