import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const load = (async ({ url }) => {
	try {
		const categoryFilter = url.searchParams.get('category');

		// Build where clause for category filtering
		const whereClause =
			categoryFilter && categoryFilter !== 'all'
				? {
						categories: {
							some: {
								id: parseInt(categoryFilter)
							}
						}
					}
				: {};

		const [products, categories] = await Promise.all([
			prisma.product.findMany({
				where: whereClause,
				select: {
					id: true,
					name: true,
					sortOrder: true,
					serviceCode: true,
					isPublished: true,
					Image: {
						select: {
							url: true
						},
						take: 1
					},
					categories: {
						select: {
							id: true,
							name: true
						}
					}
				},
				orderBy: { sortOrder: 'asc' }
			}),
			prisma.category.findMany({
				select: {
					id: true,
					name: true
				},
				orderBy: { sortOrder: 'asc' }
			})
		]);

		return {
			products,
			categories,
			selectedCategory: categoryFilter || 'all'
		};
	} catch (e) {
		console.error('Error getting products for sorting: ', e);
		return { status: 500, error: 'Internal server error' };
	}
}) satisfies PageServerLoad;

export const actions: Actions = {
	updateSort: async ({ request, url }) => {
		try {
			const formData = await request.formData();
			const updates = JSON.parse(formData.get('updates') as string);
			const category = formData.get('category') as string;

			// Check if any sort orders have decimals (indicating they need normalization)
			const hasDecimals = updates.some((update: { id: number; sortOrder: number }) => update.sortOrder % 1 !== 0);

			if (hasDecimals) {
				// Get all products to normalize sort orders globally
				const allProducts = await prisma.product.findMany({
					select: { id: true, sortOrder: true },
					orderBy: { sortOrder: 'asc' }
				});

				// Create a map of updates for quick lookup
				const updateMap = new Map(updates.map((u: { id: number; sortOrder: number }) => [u.id, u.sortOrder]));

				// Apply updates to the full list and sort by the new sort orders
				const updatedProducts = allProducts
					.map((product) => ({
						...product,
						sortOrder: updateMap.has(product.id) ? updateMap.get(product.id)! : product.sortOrder
					}))
					.sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));

				// Normalize sort orders to sequential integers
				const normalizedUpdates = updatedProducts.map((product, index) => ({
					id: product.id,
					sortOrder: index + 1
				}));

				// Update all products with normalized sort orders
				await prisma.$transaction(
					normalizedUpdates.map((update) =>
						prisma.product.update({
							where: { id: update.id },
							data: { sortOrder: update.sortOrder }
						})
					)
				);
			} else {
				// No decimals, just update the provided products
				await prisma.$transaction(
					updates.map((update: { id: number; sortOrder: number }) =>
						prisma.product.update({
							where: { id: update.id },
							data: { sortOrder: update.sortOrder }
						})
					)
				);
			}

			return { success: true, category };
		} catch (e) {
			console.error('Error updating sort order: ', e);
			return fail(500, { error: 'Failed to update sort order' });
		}
	}
};
