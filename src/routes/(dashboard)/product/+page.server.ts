import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import auth from '$lib/server/auth';
import prisma from '$lib/server/prisma';

export const load = (async ({ locals: { user } }) => {
	if (await auth.isAdmin(user)) return redirect(303, '/admin/product');

	try {
		const productsPromise = prisma.product.findMany({
			where: { isPublished: true },
			include: {
				Image: { select: { url: true } },
				categories: true
			},
			orderBy: { createdAt: 'desc' }
		});

		const categoriesPromise = prisma.category.findMany();

		const [products, categories] = await Promise.all([productsPromise, categoriesPromise]);
		return { products, categories };
	} catch (e) {
		console.log('getPublishedProducts: ', e);
		return { status: 500, error: 'Internal server error getting published products' };
	}
}) satisfies PageServerLoad;
