import type { PageServerLoad, Actions } from './$types';
import prisma from '$lib/server/prisma';
import { fail } from '@sveltejs/kit';

export const load = (async () => {
	try {
		const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
		return { categories };
	} catch (e) {
		console.error(e);
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	add_category: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const { name } = formData;
		if (!name) return fail(400, { errors: 'Please enter a name' });

		try {
			const category = await prisma.category.create({
				data: {
					name: name.toString()
				}
			});
			return { category };
		} catch (e) {
			console.error(e);
			return fail(400, { errors: 'Error creating category' });
		}
	},

	delete_category: async ({ request }) => {
		const formData = Object.fromEntries(await request.formData());

		const { id } = formData;
		if (!id) return fail(400, { errors: 'Invalid category id' });

		const categoryId = Number(id);
		if (isNaN(categoryId)) return fail(400, { errors: 'Invalid category id' });

		try {
			// Check if the category has any products
			const categoryWithProducts = await prisma.category.findUnique({
				where: { id: categoryId },
				include: { Products: true }
			});

			if (!categoryWithProducts) {
				return fail(400, { errors: 'Category not found' });
			}

			if (categoryWithProducts.Products.length > 0) {
				return fail(400, {
					errors: 'Cannot delete category that contains products.'
				});
			}

			await prisma.category.delete({
				where: { id: categoryId }
			});
			return { id };
		} catch (e) {
			console.error(e);
			return fail(400, { errors: 'Error deleting category' });
		}
	}
};
